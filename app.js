const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-openidconnect');
const path = require('path');
require('dotenv').config();

const app = express();

// Passport OIDC Configuration
passport.use(
  new Strategy(
    {
      issuer: process.env.OIDC_ISSUER,
      authorizationURL: process.env.OIDC_AUTHORIZATION_URL,
      tokenURL: process.env.OIDC_TOKEN_URL,
      userInfoURL: process.env.OIDC_USER_INFO_URL,
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: process.env.OIDC_CALLBACK_URL,
      scope: ['openid'],
    },
    (issuer, sub, profile, accessToken, refreshToken, done) => {
       if (!accessToken) {
        console.error('Access token is missing');
        return done(new Error('Failed to retrieve access token'));
      }
      return done(null, profile);
    }
  )
);

// Serialize and Deserialize User
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', passport.authenticate('openidconnect'));

app.get(
  '/callback',  (req, res, next) => {
  console.log('Callback query parameters:', req.query);
  next();
}, passport.authenticate('openidconnect', (err, user, info) => {
      if (err) {
        console.error('OIDC Authentication Error:', err);
        return res.send(`Authentication failed: ${err.message || ' error'}`);
      }
      if (!user) {
        console.error('OIDC User Info Error:', info);
        return res.send(`Authentication failed: ${info || 'Unknown user'}`);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('Login Error:', loginErr);
          return res.send(`Authentication failed: ${loginErr.message}`);
        }
        res.redirect('/');
      });
    })(req, res, next);
  }
);

app.get('/error', (req, res) => {
  const errorMessage = req.session.messages || 'Unknown error';
  console.error('Authentication failed:', errorMessage);
  res.send(`Authentication failed: ${errorMessage}`);
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

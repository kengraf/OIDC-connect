# OIDC-connect
OIDC-connect

### Prerequisites
1. OIDC Provider: Google
2. Client ID and Client Secret: Register the application with Google to obtain these credentials.
3. Redirect URI: Set a redirect URI (e.g., http://localhost:3000/callback).

### Install Dependencies
npm install express passport passport-openidconnect express-session dotenv

.env  ----content
PORT=3000
OIDC_ISSUER=https://your-oidc-provider.com
OIDC_CLIENT_ID=your-client-id
OIDC_CLIENT_SECRET=your-client-secret
OIDC_CALLBACK_URL=http://localhost:3000/callback
SESSION_SECRET=your-session-secret

app.js ----
```
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
      authorizationURL: `${process.env.OIDC_ISSUER}/authorize`,
      tokenURL: `${process.env.OIDC_ISSUER}/token`,
      userInfoURL: `${process.env.OIDC_ISSUER}/userinfo`,
      clientID: process.env.OIDC_CLIENT_ID,
      clientSecret: process.env.OIDC_CLIENT_SECRET,
      callbackURL: process.env.OIDC_CALLBACK_URL,
    },
    (issuer, sub, profile, accessToken, refreshToken, done) => {
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
  '/callback',
  passport.authenticate('openidconnect', {
    failureRedirect: '/',
  }),
  (req, res) => {
    res.redirect('/');
  }
);

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
```
views/index.ejs
```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home</title>
</head>
<body>
  <h1>Welcome to OIDC Example</h1>
  <% if (user) { %>
    <p>Hello, <%= user.displayName || user.name || "User" %>!</p>
    <a href="/logout">Logout</a>
  <% } else { %>
    <a href="/login">Login</a>
  <% } %>
</body>
</html>

```
views/login.ejs
```
Redirects to the OIDC provider login page automatically through the /login route.
```

start server:
`node app.js`

access app:
`http://localhost:3000`

### notes
OIDC Provider: Replace https://your-oidc-provider.com with your actual provider's URL (e.g., Google: https://accounts.google.com).
Session Management: Adjust session configurations for production use (secure cookies, longer session expiration).
Error Handling: Add proper error-handling middleware for robustness.


const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
async function verify() {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: 958115105182-0rvbal5tufba8jsubammhgq3ee149vdu.apps.googleusercontent.com,
  });
  const payload = ticket.getPayload();
  const userid = payload['sub'];
  // If the request specified a Google Workspace domain:
  // const domain = payload['hd'];
}
verify().catch(console.error);

function validateToken() { return true; }
// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

app.post('/callback',  (req, res ) => {
  console.log('callback post');
  res.send("callback responce");
});

// Protected route
app.get('/protected', validateToken, (req, res) => {
  res.json({
    message: 'Access granted to protected route',
    user: req.user, // Decoded JWT payload
  });
});
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

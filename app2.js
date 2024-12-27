const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();


const app = express();
app.set('view engine', 'ejs');
app.use(express.json());

app.use(
  session({
    secret: 'your-secret-key', // Replace with a strong secret key
    resave: false,            // Avoid resaving unchanged sessions
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: {
      secure: false,          // Set `true` if using HTTPS
      httpOnly: true,         // Prevent client-side access to cookies
      maxAge: 3600000,        // Session expiration time in milliseconds (1 hour)
    },
  })
);

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

app.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
});

app.post('/callback',  (req, res ) => {
  console.log('callback post');
  res.send("callback responce");
});

function validateToken() { return true; };
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
const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

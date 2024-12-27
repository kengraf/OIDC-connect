const express = require('express');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

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

function validateToken() { return true; }
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

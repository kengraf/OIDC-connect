const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.OIDC_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());


// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { user: req.user });
});

app.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
  console.log( idToken );
  
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload['sub']; // Use this user ID for your app's session

    // After verification, establish a session or issue a secure token
    console.log('req.session:', req.session);
    req.session.user = userId; // Example for session-based apps

    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
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

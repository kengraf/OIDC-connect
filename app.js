const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = process.env.OIDC_CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);
let session_secret = 'your-secret-key';
let session_email = '';

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());

app.use(
  session({
    secret: session_secret, // Replace with a strong secret key
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

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { user: req.user });
});

// The GIS callback invokes this route after successful login
app.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // TODO: Fulee deployment would need real session management
    res.cookie('userId', payload['sub'], {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, 
    });

   //  res.json({ success: true });
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

app.get('/callback', (req, res) => {});
        
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

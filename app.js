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

app.post('/verify-token', async (req, res) => {
  const { idToken } = req.body;
  
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const userId = payload['sub']; // Use this user ID for your app's session

    // After verification, establish a session or issue a secure token
    req.session.user = { username: userId }; // Example for session-based apps
    session_secret = userId;
    session_user = payload['email'];
    req.session.save((err) => {               // Ensure session is saved
      if (err) {
        return res.status(500).json({ message: 'Session save failed' });
      }
    });    
    res.json({ success: true });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

function verifyToken(req, res, next) {
  console.log( "verifytoken" );
  console.log( req.session );
  const token = req.session.user;
  console.log( token);
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token is required' });
  }

  jwt.verify(token, 'your-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = decoded; // Attach decoded token data to the request
    next();
  });
}

function validateSession(req, res, next) {
    console.log('Session:', req.session);
  if (req.session && req.session.user) {
    console.log('Session validated:', req.session.user);
    next(); // User is authenticated; proceed to the next middleware or route
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in' });
  }
}

app.get('/protected', (req, res) => {
    res.redirect('/');
});

app.get('/protected2', validateSession, (req, res) => {
  console.log(req);
  res.json({ success: true, message: 'Welcome to the protected page!', user: req.user });
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

const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

function decodeJwtResponse(token, secret="") {
    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, secret);
        
        console.log("Token is valid. Contents:");
        console.log(decoded);
        
        return decoded; // Return decoded content if needed
    } catch (error) {
        console.error("Invalid token:", error.message);
        return null;
    }
}

function handleCredentialResponse(response) {
   // decodeJwtResponse() is a custom function defined by you
   // to decode the credential response.
   const responsePayload = decodeJwtResponse(response.credential);

   console.log("ID: " + responsePayload.sub);
   console.log('Full Name: ' + responsePayload.name);
   console.log('Given Name: ' + responsePayload.given_name);
   console.log('Family Name: ' + responsePayload.family_name);
   console.log("Image URL: " + responsePayload.picture);
   console.log("Email: " + responsePayload.email);
}

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
  console.log('post:', req);
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

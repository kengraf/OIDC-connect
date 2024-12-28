const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
   app.use(cookieParser());


app.get('/', (req, res) => {
  res.cookie('myCookie', 'value', { secure: false, httpOnly: false, path: '/' });
   console.log(res.cookie);
   res.redirect('http://localhost:3000/another-page')
});

app.get('/another-page', (req, res) => {
  console.log(req.cookies); // Should log the cookie
  res.send('Redirected page');
});

app.listen(3000);

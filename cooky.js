const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
   app.use(cookieParser());


app.get('/', (req, res) => {
  res.cookie('myCookie', 'value', { secure: false, httpOnly: true, path: '/' });
  res.redirect('/another-page');
});

app.get('/another-page', (req, res) => {
  console.log(req.cookies); // Should log the cookie
  res.send('Redirected page');
});

app.listen(3000);

const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.cookie('myCookie', 'value');
  res.redirect('/another-page');
});

app.get('/another-page', (req, res) => {
  console.log(req.cookies); // Should log the cookie
  res.send('Redirected page');
});

app.listen(3000);

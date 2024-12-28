const express = require('express');
const app = express();
const PORT = 3000;

// With middleware
app.use('/', function (req, res, next) {
    res.cookie('title', 'GeeksforGeeks');
    res.send("Cookie Set");
    next();
})

app.get('/', function (req, res) {
    console.log('Cookie SET');
});


app.get('/a', (req, res) => {
  res.cookie('myCookie', 'value', { samesite: 'lax', secure: false, httpOnly: false, path: '/' });
   console.log(res);
   res.send("ok");
   res.redirect('/b')
});

app.get('/b', (req, res) => {
  console.log(req.cookies); // Should log the cookie
  res.send('Redirected page');
});

app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});


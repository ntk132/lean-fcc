require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

let shortURLs = [];

// API: Handle POST URL
app.post('/api/shorturl', function(req, res) {
  var leng = shortURLs.push({original_url : req.body.url, short_url : shortURLs.length + 1})
  
  const regex = /^https:\/\//;
  const found = req.body.url.match(regex);
  
  if (found) {
    res.send({ original_url: req.body.url, short_url: leng });
  } else {
    res.send({ error: 'invalid url' });
  }
  
});

// API: Handle url shortener
app.get('/api/shorturl/:short_url', function(req, res) {
  // if (!req.params.short_url || req.params.short_url > shortURLs.length) {
  //   res.json({ error: 'invalid url' });
  // } else {
    if (isNaN(parseInt(req.params.short_url))) {
      res.json({ error: 'invalid url' });
    } else {
      var shortenerUrl = shortURLs.find(url => url['short_url'] === parseInt(req.params.short_url));
      if (shortenerUrl) {
        //res.json(shortenerUrl);
        res.redirect(shortenerUrl['original_url']);
      } else {
        res.json({ error: 'invalid url' });
      }
    }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

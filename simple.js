/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , spdy = require('spdy')
  , fs = require('fs')

var keypath = '/node_modules/spdy/keys/';

var options = {
  key: fs.readFileSync(__dirname + keypath + 'spdy-key.pem'),
  cert: fs.readFileSync(__dirname + keypath + 'spdy-cert.pem'),
  ca: fs.readFileSync(__dirname + keypath + 'spdy-csr.pem')
};

var app = module.exports = spdy.createServer(express.HTTPSServer, options);

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// Routes

var path = '/images/icon0.png',
    header = { 'content-type': 'image/png' },
    file = fs.readFileSync(__dirname + '/public' + path);

app.get('/', function(req, res) {
  var title = 'HTTP :(';
  if (res.isSpdy) {
    title = 'SPDY :)';

    res.push(path, header, function(err, stream) {
      if (err) return console.error(err);
      stream.on('error', function(){});
      stream.end(file);
    });
  }

  res.render('index', {
    title: title
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

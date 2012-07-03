
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
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

function readContent(path) {
  return fs.readFileSync(__dirname + '/public' + path);
}

var headers = {
  'png': { 'content-type': 'image/png' },
  'css': { 'content-type': 'text/css' },
  'js' : { 'content-type': 'application/javascript' }
};

var filepath = [
  '/images/icon0.png',
  '/images/icon1.png',
  '/images/icon2.png',
  '/images/icon3.png',
  '/images/icon4.png',
  '/images/icon5.png',
  '/images/icon6.png',
  '/images/icon7.png',
  '/images/icon8.png',
  '/images/icon9.png',
  '/stylesheets/style0.css',
  '/stylesheets/style1.css',
  '/stylesheets/style2.css',
  '/javascripts/script0.js',
  '/javascripts/script1.js',
  '/javascripts/script2.js',
]

var files = filepath.map(function(path) {
  var ex = path.split('.')[1];
  return [path, headers[ex], readContent(path)];
});

app.get('/', function(req, res) {
  var title = 'HTTP :(';
  if (res.isSpdy) {
    title = 'SPDY :)';

    function spdy_push(path, head, file) {
      var noop = function(){};
      res.push(path, head, function(err, stream) {
        if (err) return console.error(err);
        stream.on('error', noop);
        stream.end(file);
      });
    }

    files.forEach(function(file) {
      spdy_push.apply(null, file);
    });
  }

  res.render('index', {
    title: title
  });
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
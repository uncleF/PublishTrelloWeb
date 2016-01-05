var express = require('express');
var publish = require('publishtrello');
var path = require('path');
var url = require('url');
var fs = require('fs');

var app = express();

var public = '/public/';
var data = 'app/data/board.json';

function init() {
  app.set('views', __dirname + public);
  app.use(express.static(path.join(__dirname, public)));
  app.engine('.html', require('ejs').renderFile);
  app.get('/', showInterface);
  app.get('/generate', generateOutput);
  app.get('/data', getData);
  app.get('*', pageNotFound);
  app.listen(8000);
}

function showInterface(request, response) {
  response.render('app.html');
}

function generateOutput(request, response) {
  var options = url.parse(request.url).query;
  var dir = __dirname + 'output';
  var dataURL = 'http://192.168.1.101:8000/data';
  // publish.init(dataURL, dir, options);
}

function getData(request, response) {
  fs.readFile(data, function(error, data) {
    response.json(JSON.parse(data));
  });
}

function pageNotFound(request, response) {
  response.send('404');
}

function runScript(path, args) {
  var process = childProcess.fork(path, args);
}

init();

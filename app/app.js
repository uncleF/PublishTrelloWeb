/*jslint node: true */

var express = require('express');
var publish = require('publishtrello');
var path = require('path');
var url = require('url');
var fs = require('fs');
var qconf = require('qconf');

var app = express();
var config = qconf();

var public = config.get('public');

var fileReadyPromise;

function showInterface(request, response) {
  response.render('app.html');
}

function generateOutput(request, response) {
  var options = {
    link: 'http://localhost:8000/data',
    dir: __dirname + '/output',
    output: JSON.parse('{"' + url.parse(request.url).query.replace(/=/g, '":"').replace(/&/g, '","') + '"}'),
    arch: true
  };
  fileReadyPromise = publish.output(options);
  response.end();
}

function download(request, response) {
  fileReadyPromise.then(function(options) {
    response.download(options.dir + '/' + 'trelloBoard.zip');
  });
}

function getData(request, response) {
  fs.readFile('app/data/board.json', function(error, data) {
    response.json(JSON.parse(data));
  });
}

function pageNotFound(request, response) {
  response.send('404');
}

function init() {
  app.set('views', __dirname + public);
  app.use(express.static(path.join(__dirname, public)));
  app.engine('.html', require('ejs').renderFile);
  app.get('/', showInterface);
  app.get('/generate', generateOutput);
  app.get('/download', download);
  app.get('/data', getData);
  app.get('*', pageNotFound);
  app.listen(8000);
}

init();

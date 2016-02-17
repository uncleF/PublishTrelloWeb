/*jslint node: true */

var express = require('express');
var publish = require('publishtrello');
var path = require('path');
var url = require('url');
var fs = require('fs');
var qconf = require('qconf');
var shortid = require('shortid');

var app = express();
var config = qconf();

var public = config.get('public');

var options;

function showInterface(request, response) {
  response.render('app.html');
}

function folderName() {
  return shortid.generate();
}

function generateOutput(request, response) {
  options = {
    link: 'http://localhost:8000/data',
    dir: __dirname + '/output/' + folderName(),
    output: JSON.parse('{"' + url.parse(request.url).query.replace(/=/g, '":"').replace(/&/g, '","') + '"}'),
    arch: true
  };
  publish.output(options).then(function() {
    response.end();
  });
}

function download(request, response) {
  response.download(options.dir + '/' + 'trelloBoard.zip');
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

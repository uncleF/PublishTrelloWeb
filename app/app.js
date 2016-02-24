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

function error404(request, response) {
  response.status(400);
  response.render('404.html', {title: '404'});
}

function error500(error, request, response, next) {
  response.status(500);
  response.render('500.html', {title:'500', error: error});
}

function init() {
  app.set('views', __dirname + public);
  app.engine('.html', require('nunjucks').render);
  app.use(express.static(path.join(__dirname, public)));
  app.get('/', showInterface);
  app.get('/generate', generateOutput);
  app.get('/download', download);
  app.get('/data', getData);
  app.use(error404);
  app.use(error500);
  app.listen(8000);
}

init();

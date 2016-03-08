/* jshint browser: true */

'use strict';

var form = document.getElementById('form');
var board = document.getElementById('board');
var download = document.getElementById('download');
var options = {
  html: document.getElementById('html'),
  md: document.getElementById('md'),
  pdf: document.getElementById('pdf'),
  epub: document.getElementById('epub')
};

var request = require('browser-request');
var serialize = require('form-serialize');
var message = require('./messages');
var autocomplete = require('./autocomplete');
var eventsTool = require('./patterns/tx-event.js');

var trello;

function busyDownload() {
  download.disabled = true;
  download.className = 'download download-is-busy';
}

function validate() {
  if (download.className !== 'download download-is-busy' && download.disabled && (form.className === 'form form-is-validBoard' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked))) {
    download.disabled = false;
  } else if (download.className !== 'download download-is-busy' && !download.disabled && (form.className !== 'form form-is-validBoard' || (!options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked))) {
    download.disabled = true;
  }
}

function validateBoard() {
  if (board.value !== '') {
    if (board.value.match(trello.regExpURL())) {
      form.className = 'form form-is-validBoard';
    } else {
      form.className = 'form form-is-invalidBoard';
    }
  } else {
    form.className = 'form';
  }
}

function resetForm() {
  form.reset();
  validateBoard();
  download.className = 'download';
}

function startDownload(dir, file) {
  resetForm();
  window.location = `/download?dir=${dir}&file=${file}`;
}

function outputOptions() {
  var options = serialize(form, {hash: true});
  options.board = options.board.replace(/http.*\/b\//g, '').replace(/\/.*/g, '');
  options.token = trello.token();
  return options;
}

function onResponse(error, response) {
  if (!error && response.statusCode === 200) {
    var json = JSON.parse(response.responseText);
    if (json.hasOwnProperty('error')) {
      resetForm();
      message.show(json.error);
    } else {
      startDownload(json.dir, json.file);
    }
  } else {
    resetForm();
    message.show('Something went wrong!');
  }
}

function send() {
  var body = outputOptions();
  if (body.hasOwnProperty('token') && body.token) {
    busyDownload();
    request({
      method: 'POST',
      uri: '/generate',
      body: body,
      json: true
    }, onResponse);
  }
}

function sendAfterAuth() {
  eventsTool.unbind(window, 'gottoken', sendAfterAuth);
  send();
}

function submit(event) {
  event.preventDefault();
  if (trello.authorized()) {
    send();
  } else {
    eventsTool.bind(window, 'gottoken', sendAfterAuth);
    trello.authorizeTrello();
  }
}

function initAutocomplete() {
  autocomplete.init(board, trello, trello.regExpURL());
  eventsTool.unbind(window, 'authsuccess', initAutocomplete);
}

function init(trelloInstance) {
  var inputEvent = 'oninput' in window ? 'input' : 'keyup';
  trello = trelloInstance;
  message.init();
  eventsTool.bind(form, 'submit', submit);
  eventsTool.bind(form, 'change', validate);
  eventsTool.bind(form, inputEvent, validate);
  eventsTool.bind(board, 'change', validateBoard);
  eventsTool.bind(board, inputEvent, validateBoard);
  if (trello.authorized()) {
    initAutocomplete();
  } else {
    eventsTool.bind(window, 'authsuccess', initAutocomplete);
  }
}

exports.init = init;

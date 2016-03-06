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

const TRELLO_URL = new RegExp(/(?:^(?:https?:\/\/)?|^(?:w{3}\.)?|^(?:https?:\/\/w{3}\.)?)trello\.com\/b\//);

function toggleDownload() {
  download.disabled = !download.disabled;
  if (download.className !== 'download') {
    download.className = 'download';
  }
}

function busyDownload() {
  toggleDownload();
  download.className = 'download download-is-busy';
}

function validate() {
  if (download.className !== 'download download-is-busy' && download.disabled && (form.className === 'form form-is-validBoard' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked))) {
    toggleDownload();
  } else if (download.className !== 'download download-is-busy' && !download.disabled && (form.className !== 'form form-is-validBoard' || (!options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked))) {
    toggleDownload();
  }
}

function validateBoard() {
  if (board.value !== '') {
    if (board.value.match(TRELLO_URL)) {
      form.className = 'form form-is-validBoard';
      eventsTool.trigger(window, 'boardvalid');
    } else {
      form.className = 'form form-is-invalidBoard';
      eventsTool.trigger(window, 'inboardvalid');
    }
  } else {
    form.className = 'form';
  }
}

function resetForm() {
  form.reset();
  validateBoard();
  toggleDownload();
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
  if (response.statusCode === 200) {
    var json = JSON.parse(response.responseText);
    startDownload(json.dir, json.file);
  } else {
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
  autocomplete.init(board, trello, TRELLO_URL);
  eventsTool.unbind(window, 'authsuccess', initAutocomplete);
}

function init(trelloInstance) {
  var inputEvent = 'oninput' in window ? 'input' : 'keyup';
  trello = trelloInstance;
  message.init();
  // if (trello.authorized()) {
    initAutocomplete();
  // }
  eventsTool.bind(form, 'submit', submit);
  eventsTool.bind(form, 'change', validate);
  eventsTool.bind(form, inputEvent, validate);
  eventsTool.bind(board, 'change', validateBoard);
  eventsTool.bind(board, inputEvent, validateBoard);
  eventsTool.bind(window, 'authsuccess', initAutocomplete);
}

exports.init = init;

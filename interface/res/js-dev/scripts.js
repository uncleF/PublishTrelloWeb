/* jshint browser: true */
/* global Modernizr */
/* global Trello */

'use strict';

(function() {

  var request = require('browser-request');
  var serialize = require('form-serialize');

  var message = require('./messages');
  var help = require('./help');
  var cache = require('./cache');
  var eventsTool = require('./components/tx-event.js');

  var form = document.getElementById('form');
  var board = document.getElementById('board');
  var download = document.getElementById('download');
  var options = {
    html: document.getElementById('html'),
    md: document.getElementById('md'),
    pdf: document.getElementById('pdf'),
    epub: document.getElementById('epub')
  };

  var auth = document.getElementById('auth');
  var helpToggle = document.getElementById('helpToggle');

  const TRELLO_LS_KEY = 'trello_token';
  const TRELLO_URL = new RegExp(/(?:^(?:https?:\/\/)?|^(?:w{3}\.)?|^(?:https?:\/\/w{3}\.)?)trello\.com\/b\//);

  function toggleDownload() {
    download.disabled = !download.disabled;
    download.className = 'download';
  }

  function validateBoard() {
    if (board.value !== '') {
      if (board.value.match(TRELLO_URL)) {
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
    toggleDownload();
  }

  function busyDownload() {
    toggleDownload();
    download.className = 'download download-is-busy';
  }

  function startDownload(dir, file) {
    resetForm();
    window.location = `/download?dir=${dir}&file=${file}`;
  }

  function onResponse(error, response) {
    if (response.statusCode === 200) {
      var json = JSON.parse(response.responseText);
      startDownload(json.dir, json.file);
    } else {
      message.show('Something went wrong!');
    }
  }

  function outputOptions() {
    var options = serialize(form, {hash: true});
    options.board = options.board.replace(/http.*\/b\//g, '').replace(/\/.*/g, '');
    options.token = Trello.token();
    return options;
  }

  function send() {
    busyDownload();
    request({
      method: 'POST',
      uri: '/generate',
      body: outputOptions(),
      json: true
    }, onResponse);
  }

  function authenticationSuccess() {
    help.toggleHelp();
    auth.className = 'authorization authorization-is-authorized';
  }

  function authenticationSuccessSend() {
    authenticationSuccess();
    send();
  }

  function authenticationFailure() {
    help.toggleHelp();
    auth.className = 'authorization authorization-is-unauthorized';
  }

  function authorizeTrello(send) {
    var success;
    if (!send) {
      success = authenticationSuccess;
    } else {
      success = authenticationSuccessSend;
    }
    Trello.authorize({
      type: 'popup',
      name: 'Publish Trello',
      expiration: 'never',
      success: success,
      error: authenticationFailure
    });
  }

  function submit(event) {
    event.preventDefault();
    if (Trello.authorized()) {
      send();
    } else {
      authorizeTrello(true);
    }
  }

  function validate() {
    if (download.className !== 'download download-is-busy' && download.disabled && (form.className === 'form form-is-validBoard' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked))) {
      toggleDownload();
    } else if (download.className !== 'download download-is-busy' && !download.disabled && (form.className !== 'form form-is-validBoard' || (!options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked))) {
      toggleDownload();
    }
  }

  function authToggle(event) {
    event.preventDefault();
    if (!Trello.authorized()) {
      authorizeTrello();
    }
  }

  function init() {
    var inputEvent = 'oninput' in window ? 'input' : 'keyup';
    if (Modernizr.serviceworker) {
      cache.init();
    }
    if (Modernizr.localstorage && localStorage[TRELLO_LS_KEY]) {
      authenticationSuccess();
    }
    message.init();
    help.init(authorizeTrello);
    eventsTool.bind(form, 'submit', submit);
    eventsTool.bind(form, 'change', validate);
    eventsTool.bind(form, inputEvent, validate);
    eventsTool.bind(board, 'change', validateBoard);
    eventsTool.bind(board, inputEvent, validateBoard);
    eventsTool.bind(auth, 'click', authToggle);
    eventsTool.bind(helpToggle, 'click', help.show);
  }

  init();

})();

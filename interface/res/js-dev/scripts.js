/* jshint browser:true */

(function() {

  var request = require('browser-request');
  var serialize = require('form-serialize');
  var message = require('./messages');
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

  const TRELLO_URL = new RegExp(/https*:\/\/(?:www\.)*trello.com\/b\//);

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

  function startDownload() {
    resetForm();
    window.location = '/download';
  }

  function onResponse(error, response) {
    if (response.statusCode === 200) {
      startDownload();
    } else {
      message.show('Something went wrong!');
    }
  }

  function outputOptions() {
    var options = serialize(form, {hash: true});
    options.board = options.board.replace(/http.*\/b\//g, '').replace(/\/.*/g, '');
    return options;
  }

  function send(event) {
    event.preventDefault();
    busyDownload();
    request({
      method: 'POST',
      uri: '/generate',
      body: outputOptions(),
      json: true
    }, onResponse);
  }

  function validate() {
    if (download.className !== 'download download-is-busy' && download.disabled && (form.className === 'form form-is-validBoard' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked))) {
      toggleDownload();
    } else if (download.className !== 'download download-is-busy' && !download.disabled && (form.className !== 'form form-is-validBoard' || (!options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked))) {
      toggleDownload();
    }
  }

  function init() {
    var inputEvent = 'oninput' in window ? 'input' : 'keyup';
    eventsTool.bind(form, 'submit', send);
    eventsTool.bind(form, 'change', validate);
    eventsTool.bind(form, inputEvent, validate);
    eventsTool.bind(board, 'change', validateBoard);
    eventsTool.bind(board, inputEvent, validateBoard);
  }

  init();
  message.init();

})();

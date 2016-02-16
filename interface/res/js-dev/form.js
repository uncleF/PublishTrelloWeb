/* jshint browser:true */

var request = require('browser-request');
var serialize = require('form-serialize');
var eventsTool = require('./components/tx-event.js');

var form = document.getElementById('options');
var board = document.getElementById('boardURL');
var download = document.getElementById('download');
var options = {
  html: document.getElementById('html'),
  md: document.getElementById('md'),
  pdf: document.getElementById('pdf'),
  epub: document.getElementById('epub')
};
var cssToggle = document.getElementById('cssOption');
var cssForm = document.getElementById('cssOptionsForm');
var cssActiveClass = ' cssOptionsForm-is-active';
var cssBrowse = document.getElementById('uploadCSSBrowse');
var cssUpload = document.getElementById('uploadCSS');

const LINK = 'http://localhost:8000/generate';

function onResponse(error, response) {
  if (response.statusCode === 200) {
    window.location = '/download';
  } else {
    console.log(error);
  }
}

function send(event) {
  event.preventDefault();
  request((LINK + '?' + serialize(form)), onResponse);
}

function toggleCSS(event) {
  var currentClassName = cssForm.className;
  cssForm.className = currentClassName.indexOf(cssActiveClass) > -1 ? currentClassName.replace(cssActiveClass, '') : currentClassName + cssActiveClass;
}

function browseCSS(event) {
  event.preventDefault();
  eventsTool.trigger(cssUpload, 'click');
}

function toggleDownload() {
  download.disabled = !download.disabled;
}

function validate() {
  if (download.disabled && (board.value !== '' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked))) {
    toggleDownload();
  } else if (!download.disabled && (board.value === '' || (!options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked))) {
    toggleDownload();
  }
}

function init(node) {
  eventsTool.bind(form, 'submit', send);
  eventsTool.bind(form, 'change', validate);
  if ('oninput' in window) {
    eventsTool.bind(form, 'input', validate);
  } else {
    eventsTool.bind(form, 'keyup', validate);
  }
  eventsTool.bind(cssToggle, 'change', toggleCSS);
  eventsTool.bind(cssBrowse, 'click', browseCSS);
}

exports.init = init;

/* jshint browser:true */

(function() {

  var request = require('browser-request');
  var serialize = require('form-serialize');
  var message = require('./messages');
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
  var cssLink = document.getElementById('linkCSS');
  var cssBrowse = document.getElementById('uploadCSSBrowse');
  var cssUpload = document.getElementById('uploadCSS');
  var cssUploadFlag = document.getElementById('uploadFlag');

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
    var params = serialize(form, {hash: true});
    if (cssUploadFlag.value === 'true') {
      console.log('upload');
    } else {
      console.log('link');
    }
    request({uri: LINK, body: params, json: true}, onResponse);
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

  function extractName(filePath) {
    var fileSplit = filePath.split('\\');
    return fileSplit[fileSplit.length - 1];
  }

  function updateCSSFile() {
    var value = cssUpload.value;
    if (value) {
      cssLink.value = extractName(value);
      cssUploadFlag.value = true;
    }
  }

  function updateCSSLink() {
    var valueLink = cssLink.value;
    var valueFile = extractName(cssUpload.value);
    if (cssUploadFlag.value === 'true' && valueLink !== valueFile) {
      cssUpload.value = '';
      cssUploadFlag.value = false;
    } else if (cssUploadFlag.value === 'false' && valueLink === valueFile) {
      cssUploadFlag.value = true;
    }
  }

  function validate() {
    if (download.disabled && (board.value !== '' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked))) {
      toggleDownload();
    } else if (!download.disabled && (board.value === '' || (!options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked))) {
      toggleDownload();
    }
  }

  function init() {
    var inputEvent = 'oninput' in window ? 'input' : 'keyup';
    eventsTool.bind(form, 'submit', send);
    eventsTool.bind(form, 'change', validate);
    eventsTool.bind(cssLink, inputEvent, validate);
    eventsTool.bind(cssLink, inputEvent, updateCSSLink);
    eventsTool.bind(cssUpload, 'change', updateCSSFile);
    eventsTool.bind(cssToggle, 'change', toggleCSS);
    eventsTool.bind(cssBrowse, 'click', browseCSS);
  }

  init();
  message.init();

})();

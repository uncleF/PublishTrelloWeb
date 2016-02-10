/* jshint browser:true */

var SEND_DATA = (function() {

  var event = require('./components/tx-event.js');

  var serialize = require('form-serialize');
  var request = require('browser-request');

  var form;

  var LINK = 'http://localhost:8000/generate';

  function init() {
    form = document.getElementById('options');
    event.bind(form, 'submit', send);
  }

  function send(event) {
    event.preventDefault();
    request((LINK + '?' + serialize(form)), onResponse);
  }

  function onResponse(error, response, body) {
    if (response.statusCode === 200) {
      window.location = '/download';
    } else {

    }
  }

  return {
    init: init
  };

})();

module.exports = SEND_DATA;

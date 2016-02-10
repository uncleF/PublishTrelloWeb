/* jshint browser:true */

(function() {

  var request = require('browser-request');
  var serialize = require('form-serialize');
  var addEvent = require('./components/tx-event.js');

  var form;

  const LINK = 'http://localhost:8000/generate';

  function init() {
    form = document.getElementById('options');
    addEvent.bind(form, 'submit', send);
  }

  function send(event) {
    event.preventDefault();
    request((LINK + '?' + serialize(form)), onResponse);
  }

  function onResponse(error, response) {
    if (response.statusCode === 200) {
      window.location = '/download';
    } else {
      console.log(error);
    }
  }

  init();

})();

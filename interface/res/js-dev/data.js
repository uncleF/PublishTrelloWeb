/* jshint browser:true */

var SEND_DATA = (function() {

  var serialize = require('form-serialize');
  var request = require('browser-request');

  var form;

  var LINK = 'http://192.168.1.101:8000/generate';

  function init() {
    form = document.getElementById('options');
    form.addEventListener('submit', send);
  }

  function send(event) {
    event.preventDefault();
    var args = 'args=' + serialize(form).replace(/(&*)(.*?)(?:=on)/g, '$1--$2').replace(/&/g, ',');
    request((LINK + '?' + args), function(error, response, body) {});
  }

  return {
    init: init
  };

})();

module.exports = SEND_DATA;

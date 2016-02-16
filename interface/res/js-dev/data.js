/* jshint browser:true */

var request = require('browser-request');
var serialize = require('form-serialize');
var addEvent = require('./components/tx-event.js');

var form;

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

function init(node) {
  form = node;
  addEvent.bind(form, 'submit', send);
}

exports.init = init;

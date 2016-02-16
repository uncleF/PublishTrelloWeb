/* jshint browser:true */

var overlay = require('./components/tx-overlay.js');
var eventsTool = require('./components/tx-event.js');

var overlayLayer = document.getElementById('overlay');
var messageText = document.getElementById('messageText');
var closeLink = document.getElementById('close');

function init() {
  overlay.init(overlayLayer);
  eventsTool.bind(closeLink, 'click', overlay.toggle);
}

function show(message) {
  messageText.textContent = message;
  overlay.toggle();
}

exports.init = init;
exports.show = show;

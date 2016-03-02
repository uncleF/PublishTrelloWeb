/* jshint browser:true */

'use strict';

var overlayLayer = document.getElementById('message');
var messageText = document.getElementById('messageText');
var closeLink = document.getElementById('closeMessage');
var okButton = document.getElementById('okMessage');

var overlay = require('./components/tx-overlay.js').init(overlayLayer);
var eventsTool = require('./components/tx-event.js');

function init() {
  eventsTool.bind(closeLink, 'click', overlay.toggle);
  eventsTool.bind(okButton, 'click', overlay.toggle);
}

function show(message) {
  messageText.textContent = message;
  overlay.toggle();
  closeLink.focus();
}

exports.init = init;
exports.show = show;

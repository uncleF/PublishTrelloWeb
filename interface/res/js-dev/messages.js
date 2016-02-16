/* jshint browser:true */

var overlay = require('./components/tx-overlay.js');
var addEvent = require('./components/tx-event.js');

var overlayLayer;
var messageText;
var closeLink;

function init(layerNode, textNode, closeNode) {
  overlayLayer = layerNode;
  messageText = textNode;
  closeLink = closeNode;
  overlay.init(overlayLayer);
  addEvent.bind(closeLink, 'click', overlay.toggle);
}

function show(message) {
  messageText.textContent = message;
  overlay.toggle();
}

exports.init = init;
exports.show = show;

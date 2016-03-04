/* jshint browser: true */

'use strict';

var overlayLayer = document.getElementById('help');
var closeLink = document.getElementById('closeHelp');
var helpToggle = document.getElementById('helpToggle');
var authHelp = document.getElementById('authHelp');

var overlay = require('./patterns/tx-overlay.js').init(overlayLayer);
var eventsTool = require('./patterns/tx-event.js');

function show(event) {
  if (event) {
    event.preventDefault();
  }
  overlay.toggle();
}

function toggleAuthHelp() {
  if (authHelp.className === 'authHelp') {
    authHelp.className = 'authHelp authHelp-is-invisible';
  } else {
    authHelp.className = 'authHelp';
  }
}

function init() {
  eventsTool.bind(closeLink, 'click', overlay.toggle);
  eventsTool.bind(helpToggle, 'click', show);
  eventsTool.bind(window, 'authsuccess', toggleAuthHelp);
  eventsTool.bind(window, 'authfailure', toggleAuthHelp);
}

exports.init = init;

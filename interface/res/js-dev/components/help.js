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

function authHelpOn() {
  authHelp.className = 'authHelp';
}

function authHelpOff() {
  authHelp.className = 'authHelp authHelp-is-invisible';
}

function init() {
  eventsTool.bind(closeLink, 'click', overlay.toggle);
  eventsTool.bind(helpToggle, 'click', show);
  eventsTool.bind(window, 'authsuccess', authHelpOff);
  eventsTool.bind(window, 'authfailure', authHelpOn);
}

exports.init = init;

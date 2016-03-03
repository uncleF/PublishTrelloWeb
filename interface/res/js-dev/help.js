/* jshint browser: true */

'use strict';

var overlayLayer = document.getElementById('help');
var closeLink = document.getElementById('closeHelp');
var authHelp = document.getElementById('authorizationHelp');
var authHelpToggle = document.getElementById('authorizationHelpToggle');

var authorization;

var overlay = require('./components/tx-overlay.js').init(overlayLayer);
var eventsTool = require('./components/tx-event.js');

function authFromHelp(event) {
  event.preventDefault();
  authorization();
}

function init(auth) {
  authorization = auth;
  eventsTool.bind(closeLink, 'click', overlay.toggle);
  eventsTool.bind(authHelpToggle, 'click', authFromHelp);
}

function show(event) {
  if (event) {
    event.preventDefault();
  }
  overlay.toggle();
  closeLink.focus();
}

function toggleHelp() {
  if (authHelp.className.match('authorizationHelp-is-invisible')) {
    authHelp.className = 'authorizationHelp';
  } else {
    authHelp.className = 'authorizationHelp authorizationHelp-is-invisible';
  }
}

exports.init = init;
exports.show = show;
exports.toggleHelp = toggleHelp;

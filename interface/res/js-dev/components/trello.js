/* jshint browser: true */
/* global Trello */
/* global Modernizr */

'use strict';

var auth = document.getElementById('authToggle');
var autheHelp = document.getElementById('authToggleHelp');

var eventsTool = require('./patterns/tx-event.js');

const TRELLO_LS_KEY = 'trello_token';

var trelloAuth = false;
var trelloToken;

function triggerSuccess() {
  eventsTool.trigger(window, 'authsuccess');
}

function triggerFailure() {
  eventsTool.trigger(window, 'authfailure');
}

function authorizeTrello() {
  Trello.authorize({
    type: 'popup',
    name: 'Publish Trello',
    expiration: 'never',
    success: triggerSuccess,
    error: triggerFailure
  });
}

function authorized() {
  return trelloAuth;
}

function token() {
  return trelloToken;
}

function authToggleFromHelp(event) {
  event.preventDefault();
  authorizeTrello();
}

function authToggle(event) {
  event.preventDefault();
  if (!authorized()) {
    authorizeTrello();
  }
}

function authSuccess() {
  trelloAuth = Trello.authorized();
  trelloToken = Trello.token();
  auth.className = 'authorization authorization-is-authorized';
}

function authFailure() {
  trelloAuth = false;
  trelloToken = void 0;
  auth.className = 'authorization authorization-is-unauthorized';
}

function init() {
  eventsTool.bind(auth, 'click', authToggle);
  eventsTool.bind(autheHelp, 'click', authToggleFromHelp);
  eventsTool.bind(window, 'authsuccess', authSuccess);
  eventsTool.bind(window, 'authfailure', authFailure);
  if (Modernizr.localstorage && localStorage[TRELLO_LS_KEY]) {
    trelloToken = localStorage[TRELLO_LS_KEY];
    auth.className = 'authorization authorization-is-authorized';
  }
}

exports.init = init;
exports.authorizeTrello = authorizeTrello;
exports.authorized = authorized;
exports.token = token;

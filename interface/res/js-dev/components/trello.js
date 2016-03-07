/* jshint browser: true */
/* global Modernizr */

'use strict';

var auth = document.getElementById('authToggle');
var autheHelp = document.getElementById('authToggleHelp');

var eventsTool = require('./patterns/tx-event.js');

const APP_KEY = '84e8362bd7d7fefaab5498e386897312';
const LS_KEY = 'trello_token';
const AUTH_ENDPOINT = 'https://trello.com';
const REGEXP_URL = new RegExp(/(?:^(?:https?:\/\/)?|^(?:w{3}\.)?|^(?:https?:\/\/w{3}\.)?)trello\.com\/b\/.+/);

var authWindow;
var trelloAuth = false;
var trelloToken;

function triggerSuccess() {
  eventsTool.trigger(window, 'authsuccess');
}

function triggerFailure() {
  eventsTool.trigger(window, 'authfailure');
}

function authorized() {
  return trelloAuth;
}

function token() {
  return trelloToken;
}

function key() {
  return APP_KEY;
}

function regExpURL() {
  return REGEXP_URL;
}

function receiveAuthMessage(event) {
  var source;
  if (event.origin !== AUTH_ENDPOINT || event.source !== authWindow) {
    triggerFailure();
    return;
  }
  if ((source = event.source) !== null) {
    source.close();
  }
  if ((event.data !== null) && /[0-9a-f]{64}/.test(event.data)) {
    trelloToken = event.data;
    triggerSuccess();
  } else {
    trelloToken = null;
    triggerFailure();
  }
  if (Modernizr.localstorage && trelloToken) {
    localStorage[LS_KEY] = trelloToken;
  } else if (!trelloToken) {
    delete localStorage[LS_KEY];
  }
  eventsTool.trigger(window, 'gottoken');
  eventsTool.unbind(window, 'message', receiveAuthMessage);
}

function authorizeTrello() {
  eventsTool.bind(window, 'message', receiveAuthMessage);
  var width = 420;
  var height = 470;
  var left = window.screenX + (window.innerWidth - width) / 2;
  var top = window.screenY + (window.innerHeight - height) / 2;
  var location = window.location;
  var origin = (location = /^[a-z]+:\/\/[^\/]*/.exec(location)) !== null ? location[0] : void 0;
  authWindow = window.open(`https://trello.com/1/authorize?response_type=token&key=${APP_KEY}&return_url=${origin}&callback_method=postMessage&scope=read&expiration=never&name=Publish%20Trello`, 'trello', `width=${width},height=${height},left=${left},top=${top}`);
}

function deauthorizeTrello() {
  trelloToken = null;
  if (Modernizr.localstorage) {
    delete localStorage[LS_KEY];
  }
}

function authSuccess() {
  trelloAuth = true;
  auth.className = 'authorization authorization-is-authorized';
}

function authFailure() {
  trelloAuth = false;
  auth.className = 'authorization authorization-is-unauthorized';
}

function authToggle(event) {
  event.preventDefault();
  if (!authorized()) {
    authorizeTrello();
  }
}

function init() {
  eventsTool.bind(auth, 'click', authToggle);
  eventsTool.bind(autheHelp, 'click', authToggle);
  eventsTool.bind(window, 'authsuccess', authSuccess);
  eventsTool.bind(window, 'authfailure', authFailure);
  if (Modernizr.localstorage && localStorage[LS_KEY]) {
    trelloToken = localStorage[LS_KEY];
    triggerSuccess();
  }
}

exports.init = init;
exports.authorizeTrello = authorizeTrello;
exports.authorizeTrello = deauthorizeTrello;
exports.authorized = authorized;
exports.token = token;
exports.key = key;
exports.regExpURL = regExpURL;

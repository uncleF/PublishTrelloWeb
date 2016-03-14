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
const REGEXP_HASH = new RegExp(/[&#]?token=([0-9a-f]{64})/);
const REGEXP_TOKEN = new RegExp(/[0-9a-f]{64}/);

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
  if ((event.data !== null) && REGEXP_TOKEN.test(event.data)) {
    trelloToken = event.data;
    triggerSuccess();
    eventsTool.trigger(window, 'gottoken');
    eventsTool.unbind(window, 'message', receiveAuthMessage);
  } else {
    trelloToken = null;
    triggerFailure();
  }
  if (Modernizr.localstorage && trelloToken) {
    localStorage.setItem(LS_KEY, trelloToken);
  } else if (!trelloToken) {
    localStorage.removeItem(LS_KEY);
  }
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

function authorizeTrelloRedirect() {
  window.location = `https://trello.com/1/authorize?response_type=token&key=${APP_KEY}&redirect_uri=${location.href}&callback_method=fragment&scope=read&expiration=never&name=Publish%20Trello`;
}

function deauthorizeTrello() {
  trelloToken = null;
  if (Modernizr.localstorage) {
    localStorage.removeItem(LS_KEY);
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
    if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0) {
      authorizeTrelloRedirect();
    } else {
      authorizeTrello();
    }
  }
}

function getTokenFromHash(hash) {
  var token = hash.replace(REGEXP_HASH, '$1');
  if (REGEXP_TOKEN.test(token)) {
    trelloToken = token;
    if (Modernizr.history) {
      history.pushState('', document.title, window.location.pathname);
    } else {
      window.location.hash = '';
    }
    if (Modernizr.localstorage) {
      localStorage.setItem(LS_KEY, trelloToken);
    }
    triggerSuccess();
  }
}

function init() {
  var hash = window.location.hash;
  eventsTool.bind(auth, 'click', authToggle);
  eventsTool.bind(autheHelp, 'click', authToggle);
  eventsTool.bind(window, 'authsuccess', authSuccess);
  eventsTool.bind(window, 'authfailure', authFailure);
  if (Modernizr.localstorage && localStorage[LS_KEY]) {
    trelloToken = localStorage.getItem(LS_KEY);
    triggerSuccess();
  } else if (hash !== '') {
    getTokenFromHash(hash);
  }
}

exports.init = init;
exports.authorizeTrello = authorizeTrello;
exports.deauthorizeTrello = deauthorizeTrello;
exports.authorized = authorized;
exports.token = token;
exports.key = key;
exports.regExpURL = regExpURL;

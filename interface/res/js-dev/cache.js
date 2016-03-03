/* jshint browser: true */

'use strict';

function success(registration) {
  console.log(`ServiceWorker registration successful with scope: ${registration.scope}`);
}

function fail(error) {
  console.log(`ServiceWorker registration failed: ${error}`);
}

function init() {
  navigator.serviceWorker.register('/service.js')
    .then(success)
    .catch(fail);
}

exports.init = init;

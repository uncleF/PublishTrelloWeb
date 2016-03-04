/* jshint browser: true */
/* global Modernizr */

'use strict';

function init() {
  if (Modernizr.serviceworker) {
    navigator.serviceWorker.register('/service.js');
  }
}

exports.init = init;

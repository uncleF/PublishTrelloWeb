/* jshint browser: true */

'use strict';

function init() {
  navigator.serviceWorker.register('/service.js');
}

exports.init = init;

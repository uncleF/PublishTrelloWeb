/* jshint browser: true */

'use strict';

(function() {

  var cache = require('./components/cache');
  var help = require('./components/help');
  var trello = require('./components/trello');
  var form = require('./components/form');
  var rAF = require('./components/patterns/tx-rAF');

  function init() {
    rAF.polyfill();
    cache.init();
    help.init();
    trello.init(help);
    form.init(trello);
  }

  init();

})();

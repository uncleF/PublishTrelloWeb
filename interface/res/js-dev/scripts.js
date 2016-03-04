/* jshint browser: true */

'use strict';

(function() {

  var help = require('./components/help');
  var cache = require('./components/cache');
  var trello = require('./components/trello');
  var form = require('./components/form');

  function init() {
    cache.init();
    help.init();
    trello.init(help);
    form.init(trello);
  }

  init();

})();

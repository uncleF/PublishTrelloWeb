/* jshint browser:true */

(function() {

  var data = require('./data');
  var message = require('./messages');

  data.init(document.getElementById('options'));

  message.init(document.getElementById('overlay'), document.getElementById('messageText'), document.getElementById('close'));

})();

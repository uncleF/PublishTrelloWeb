/* jshint browser:true */

(function() {

  var screens = {};

  function init(state) {
    screens = {
      state: state
    };
  }

  function change(state) {
    screens.state = state;
  }

  return {
    init: init,
    change: change
  };

})();

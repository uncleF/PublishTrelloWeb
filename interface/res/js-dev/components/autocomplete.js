/* jshint browser: true */

'use strict';

var list = document.getElementById('autocomplete');

var update = require('./autocompleteUpdate');
var eventsTool = require('./patterns/tx-event.js');

var autocompleteActive = false;
var autocompleteOn = false;

var input;

var trello;

var options;
var optionsLength;
var highlightedOption;

function getOptionTarget(target) {
  return Array.prototype.indexOf.call(options, target);
}

function checkOption(target) {
  return target.className.indexOf('js-autocompleteOption') > -1;
}

function getListBounds() {
  var scroll = list.scrollTop;
  var height = list.getAttribute('data-height') - 0;
  if (!height) {
    height = list.offsetHeight - options[0].offsetHeight;
    list.setAttribute('data-height', height);
  }
  return {
    scroll: scroll,
    height: height
  };
}

function getOptionPosition(option) {
  var position = option.getAttribute('data-position') - 0;
  if (!position) {
    position = option.offsetTop;
    option.setAttribute('data-position', position);
  }
  return position;
}

function scrollOption() {
  requestAnimationFrame(function() {
    var option = options[highlightedOption];
    var optionPosition = getOptionPosition(option);
    var visibleBounds = getListBounds();
    if (optionPosition <= visibleBounds.scroll) {
      option.scrollIntoView(true);
    } else if (optionPosition >= (visibleBounds.scroll + visibleBounds.height)) {
      option.scrollIntoView(false);
    }
  });
}

function updateOption(newHighlightedOption) {
  if (highlightedOption > -1) {
    options[highlightedOption].className = options[highlightedOption].className.replace(' js-autocompleteOption-is-highlighted', '');
  }
  highlightedOption = newHighlightedOption;
  options[highlightedOption].className += ' js-autocompleteOption-is-highlighted';
}

function changeOption() {
  input.value = options[highlightedOption].href;
  eventsTool.trigger(input, 'change', true);
}

function highlightOption(newHighlightedOption) {
  updateOption(newHighlightedOption);
  scrollOption();
}

function selectOption(newHighlightedOption) {
  highlightOption(newHighlightedOption);
  changeOption();
}

function choosePrev(event) {
  event.preventDefault();
  if (highlightedOption > 0) {
    selectOption(highlightedOption - 1);
  } else {
    selectOption(optionsLength - 1);
  }
}

function chooseNext(event) {
  event.preventDefault();
  if (highlightedOption > -1 && highlightedOption < (optionsLength - 1)) {
    selectOption(highlightedOption + 1);
  } else {
    selectOption(0);
  }
}

function chooseMouse(event) {
  var target = event.target;
  if (checkOption(target)) {
    selectOption(getOptionTarget(target));
  }
}

function chooseThis(event) {
  event.preventDefault();
  deactivate();
  eventsTool.trigger(input, 'change');
}

function choose(event) {
  var key = event.keyCode;
  if (key === 38) {
    choosePrev(event);
    return;
  }
  if (key === 40) {
    chooseNext(event);
    return;
  }
  if (key === 13) {
    chooseThis(event);
    return;
  }
}

function show() {
  list.className = 'autocomplete autocomplete-is-active';
}

function hide() {
  list.className = 'autocomplete';
}

function activate() {
  if (autocompleteActive && !autocompleteOn) {
    autocompleteOn = true;
    show();
    eventsTool.unbind(input, 'keydown', openAutocomplete);
    eventsTool.bind(input, 'keydown', choose);
  }
}

function deactivate(event) {
  if (autocompleteOn) {
    autocompleteOn = false;
    hide();
    eventsTool.unbind(input, 'keydown', choose);
    eventsTool.bind(input, 'keydown', openAutocomplete);
  }
}

function deactivateMouse(event) {
  event.preventDefault();
}

function toggleAutocomplete() {
  options = document.getElementsByClassName('js-autocompleteOption');
  optionsLength = options.length;
  autocompleteActive = true;
}

function openAutocomplete(event) {
  if (event.keyCode === 40) {
    event.preventDefault();
    activate();
  }
}

function reset() {
  autocompleteActive = false;
  update.update();
}

function init(element, trelloInstance) {
  var inputEvent = 'oninput' in window ? 'input' : 'keyup';
  input = element;
  trello = trelloInstance;
  update.init(list, trello);
  eventsTool.bind(input, 'focus', activate);
  eventsTool.bind(input, 'blur', deactivate);
  eventsTool.bind(input, inputEvent, deactivate);
  eventsTool.bind(list, 'mouseover', chooseMouse);
  eventsTool.bind(list, 'click', deactivateMouse);
  eventsTool.bind(window, 'gotboards', toggleAutocomplete);
}

exports.init = init;
exports.activate = activate;
exports.deactivate = deactivate;
exports.reset = reset;

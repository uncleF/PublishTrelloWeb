/* jshint browser: true */

'use strict';

var list = document.getElementById('autocomplete');
var input;
var trello;
var TRELLO_URL;
var TRELLO_MEMBER;

var request = require('browser-request');
var eventsTool = require('./patterns/tx-event.js');
var options;
var optionsAvailiable;
var selectedOption;

function checkBoard() {
  if (!findSelectedBoard()) {
    resetSelectedBoard();
  }
}

function show() {
  list.className = 'autocomplete autocomplete-is-active';
}

function hide() {
  list.className = 'autocomplete';
}

function preventBlur() {
  eventsTool.unbind(input, 'blur', hideAutocomplete);
}

function chooseSelected() {
  deactivate();
  input.value = options[selectedOption].href;
  eventsTool.trigger(input, 'change');
}

function updateOptions(newSelected) {
  if (selectedOption > -1) {
    options[selectedOption].className = options[selectedOption].className.replace(' autocompleteOption-is-selected', '');
  }
  selectedOption = newSelected;
  options[selectedOption].className += ' autocompleteOption-is-selected';
  // preventBlur();
  // options[selectedOption].focus();
  // eventsTool.bind(input, 'blur', hideAutocomplete);
}

function updateClicked(target) {
  for (let index = 0; index < optionsAvailiable; index += 1) {
    if (options[index] === target) {
      updateOptions(index);
      chooseSelected();
      return;
    }
  }
}

function chooseClick(event) {
  var target = event.target;
  event.preventDefault();
  if (target.className.indexOf('autocompleteOption') > -1) {
    updateClicked(target);
  }
  eventsTool.bind(input, 'blur', hideAutocomplete);
}

function choosePrev(event) {
  event.preventDefault();
  if (selectedOption === -1) {
    selectedOption = optionsAvailiable - 1;
    updateOptions(selectedOption);
  } else {
    updateOptions(selectedOption > 0 ? selectedOption - 1 : optionsAvailiable - 1);
  }
  options[selectedOption].scrollIntoView(false);
}

function chooseNext(event) {
  event.preventDefault();
  if (selectedOption === -1) {
    selectedOption = 0;
    updateOptions(selectedOption);
  } else {
    updateOptions(selectedOption < (optionsAvailiable - 1) ? selectedOption + 1 : 0);
  }
  options[selectedOption].scrollIntoView(false);
}

function chooseThis(event) {
  event.preventDefault();
  chooseSelected();
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

function deactivate() {
  hide();
  eventsTool.unbind(input, 'keyup', choose);
  eventsTool.unbind(list, 'click', chooseClick);
  eventsTool.bind(input, 'keyup', triggerAutocomplete);
}

function activate() {
  show();
  eventsTool.unbind(input, 'keyup', triggerAutocomplete);
  eventsTool.bind(input, 'keyup', choose);
  eventsTool.bind(list, 'click', chooseClick);
}

function getBoardShortURL(value) {
  return value.replace(TRELLO_URL, '').split('/')[0];
}

function selectedBoardIndex() {
  var value = getBoardShortURL(input.value);
  for (let index = 0; index < optionsAvailiable; index += 1) {
    if (getBoardShortURL(options[index].href) === value) {
      return index;
    }
  }
  return -1;
}

function findSelectedBoard() {
  var index = selectedBoardIndex();
  if (index > -1) {
    updateOptions(index);
    return true;
  } else {
    return false;
  }
}

function resetSelectedBoard() {
  if (selectedOption > -1) {
    options[selectedOption].className = options[selectedOption].className.replace(' autocompleteOption-is-selected', '');
    selectedOption = -1;
  }
}

function initOptions() {
  if (selectedOption > -1) {
    resetSelectedBoard();
  }
  options = document.getElementsByClassName('autocompleteOption');
  optionsAvailiable = options.length;
}

function buildAutocomplete(boards) {
  var items = '';
  for (let index = 0, length = boards.length; index < length; index += 1) {
    items += `<li class="autocompleteItem"><a href="${boards[index].shortUrl}" class="autocompleteOption">${boards[index].name}</a></li>`;
  }
  list.insertAdjacentHTML('beforeend', items);
}

function update(callback) {
  // request({
  //   method: 'GET',
  //   uri: `https://api.trello.com/1/members/${TRELLO_MEMBER}/boards?key=${trello.key()}&token=${trello.token()}&filter=open`,
  // }, function(error, response) {
  //   if (error) {
  //     console.log(error);
  //   } else {
  //     buildAutocomplete(JSON.parse(response.body));
      initOptions();
      if (input.value !== '') {
        findSelectedBoard();
      }
      callback();
  //   }
  // });
}

function showAutocomplete() {
  // if (TRELLO_MEMBER) {
    update(activate);
  // }
}

function hideAutocomplete() {
  deactivate();
}

function triggerAutocomplete(event) {
  if (event.keyCode === 40) {
    event.preventDefault();
    activate();
  }
}

function getMemeber() {
  request({
    method: 'GET',
    uri: `https://api.trello.com/1/tokens/${trello.token()}/member?key=${trello.key()}&fields=username`,
  }, function(error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log(JSON.parse(response.body).username);
      TRELLO_MEMBER = JSON.parse(response.body).username;
    }
  });
}

function mouseInterfaceStart() {
  list.className += ' autocomplete-is-mouseInterface';
}

function mouseInterfaceFinish() {
  list.className = list.className.replace(' autocomplete-is-mouseInterface', '');
}

function init(element, trelloInstance, regexp) {
  input = element;
  trello = trelloInstance;
  TRELLO_URL = regexp;
  // getMemeber();
  eventsTool.bind(input, 'focus', showAutocomplete);
  eventsTool.bind(input, 'blur', hideAutocomplete);
  eventsTool.bind(list, 'mousedown', preventBlur);
  eventsTool.bind(list, 'mouseover', mouseInterfaceStart);
  eventsTool.bind(list, 'mouseout', mouseInterfaceFinish);
  eventsTool.bind(window, 'boardvalid', checkBoard);
}

exports.init = init;
exports.activate = activate;
exports.deactivate = deactivate;

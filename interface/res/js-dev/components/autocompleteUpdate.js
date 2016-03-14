/* jshint browser: true */
/* global Modernizr */

'use strict';

var request = require('browser-request');
var eventsTool = require('./patterns/tx-event.js');

var list;
var trello;

var TRELLO_MEMBER;
var TRELLO_BOARDS;
var LS_KEY = 'trello_boards_autocomplete';

function appendItem(board) {
  var star = '';
  if (board.starred) {
    star = 'js-autocompleteOption-is-starred';
  }
  return `<li class="js-autocompleteItem"><a href="${board.shortUrl}" class="js-autocompleteOption ${star}">${board.name}</a></li>`;
}

function buildList() {
  var items = '';
  for (let index = 0, length = TRELLO_BOARDS.length; index < length; index += 1) {
    items += appendItem(TRELLO_BOARDS[index]);
  }
  list.insertAdjacentHTML('beforeend', items);
  eventsTool.trigger(window, 'gotboards');
}

function updateRequest(requestURL, callback) {
  request({
    method: 'GET',
    uri: requestURL,
  }, callback);
}

function gotBoards(error, response) {
  if (error) {
    console.log(error);
  } else {
    if (Modernizr.localstorage) {
      localStorage.setItem(LS_KEY, response.body);
    }
    TRELLO_BOARDS = JSON.parse(response.body);
    buildList();
  }
}

function getBoards() {
  var boardsRequestURL = `https://api.trello.com/1/members/${TRELLO_MEMBER}/boards?key=${trello.key()}&token=${trello.token()}&fields=name,shortUrl&filter=open`;
  if (Modernizr.localstorage && localStorage[LS_KEY]) {
    TRELLO_BOARDS = JSON.parse(localStorage.getItem(LS_KEY));
    if (TRELLO_BOARDS) {
      buildList();
    }
  }
  updateRequest(boardsRequestURL, gotBoards);
}

function gotMemeber(error, response) {
  if (error) {
    console.log(error);
  } else {
    TRELLO_MEMBER = JSON.parse(response.body).username;
    getBoards();
  }
}

function getMemeber() {
  var membersRequestURL = `https://api.trello.com/1/tokens/${trello.token()}/member?key=${trello.key()}&fields=username`;
  updateRequest(membersRequestURL, gotMemeber);
}

function init(element, trelloInstance) {
  list = element;
  trello = trelloInstance;
  getMemeber();
}

exports.init = init;
exports.update = getBoards;

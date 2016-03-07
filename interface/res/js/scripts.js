(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  return target.className.indexOf('autocompleteOption') > -1;
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
  requestAnimationFrame(function () {
    var option = options[highlightedOption];
    var optionPosition = getOptionPosition(option);
    var visibleBounds = getListBounds();
    if (optionPosition <= visibleBounds.scroll) {
      option.scrollIntoView(true);
    } else if (optionPosition >= visibleBounds.scroll + visibleBounds.height) {
      option.scrollIntoView(false);
    }
  });
}

function updateOption(newHighlightedOption) {
  if (highlightedOption > -1) {
    options[highlightedOption].className = options[highlightedOption].className.replace(' autocompleteOption-is-highlighted', '');
  }
  highlightedOption = newHighlightedOption;
  options[highlightedOption].className += ' autocompleteOption-is-highlighted';
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
  if (highlightedOption > -1 && highlightedOption < optionsLength - 1) {
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
    eventsTool.unbind(input, 'keyup', openAutocomplete);
    eventsTool.bind(input, 'keyup', choose);
  }
}

function deactivate(event) {
  if (autocompleteOn) {
    autocompleteOn = false;
    hide();
    eventsTool.unbind(input, 'keyup', choose);
    eventsTool.bind(input, 'keyup', openAutocomplete);
  }
}

function deactivateMouse(event) {
  event.preventDefault();
}

function toggleAutocomplete() {
  options = document.getElementsByClassName('autocompleteOption');
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

},{"./autocompleteUpdate":2,"./patterns/tx-event.js":7}],2:[function(require,module,exports){
/* jshint browser: true */

'use strict';

var request = require('browser-request');
var eventsTool = require('./patterns/tx-event.js');

var list;
var trello;

var TRELLO_MEMBER;
var TRELLO_BOARDS;

function buildList() {
  var items = '';
  for (var index = 0, length = TRELLO_BOARDS.length; index < length; index += 1) {
    items += '<li class="autocompleteItem"><a href="' + TRELLO_BOARDS[index].shortUrl + '" class="autocompleteOption">' + TRELLO_BOARDS[index].name + '</a></li>';
  }
  list.insertAdjacentHTML('beforeend', items);
  eventsTool.trigger(window, 'gotboards');
}

function updateRequest(requestURL, callback) {
  request({
    method: 'GET',
    uri: requestURL
  }, callback);
}

function gotBoards(error, response) {
  if (error) {
    console.log(error);
  } else {
    TRELLO_BOARDS = JSON.parse(response.body);
    buildList();
  }
}

function getBoards() {
  var boardsRequestURL = 'https://api.trello.com/1/members/' + TRELLO_MEMBER + '/boards?key=' + trello.key() + '&token=' + trello.token() + '&filter=open';
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
  var membersRequestURL = 'https://api.trello.com/1/tokens/' + trello.token() + '/member?key=' + trello.key() + '&fields=username';
  updateRequest(membersRequestURL, gotMemeber);
}

function init(element, trelloInstance) {
  list = element;
  trello = trelloInstance;
  getMemeber();
}

exports.init = init;
exports.update = getBoards;

},{"./patterns/tx-event.js":7,"browser-request":12}],3:[function(require,module,exports){
/* jshint browser: true */
/* global Modernizr */

'use strict';

function init() {
  if (Modernizr.serviceworker) {
    navigator.serviceWorker.register('/service.js');
  }
}

exports.init = init;

},{}],4:[function(require,module,exports){
/* jshint browser: true */

'use strict';

var form = document.getElementById('form');
var board = document.getElementById('board');
var download = document.getElementById('download');
var options = {
  html: document.getElementById('html'),
  md: document.getElementById('md'),
  pdf: document.getElementById('pdf'),
  epub: document.getElementById('epub')
};

var request = require('browser-request');
var serialize = require('form-serialize');
var message = require('./messages');
var autocomplete = require('./autocomplete');
var eventsTool = require('./patterns/tx-event.js');

var trello;

function busyDownload() {
  download.disabled = true;
  download.className = 'download download-is-busy';
}

function validate() {
  if (download.className !== 'download download-is-busy' && download.disabled && form.className === 'form form-is-validBoard' && (options.html.checked || options.md.checked || options.pdf.checked || options.epub.checked)) {
    download.disabled = false;
  } else if (download.className !== 'download download-is-busy' && !download.disabled && (form.className !== 'form form-is-validBoard' || !options.html.checked && !options.md.checked && !options.pdf.checked && !options.epub.checked)) {
    download.disabled = true;
  }
}

function validateBoard() {
  if (board.value !== '') {
    if (board.value.match(trello.regExpURL())) {
      form.className = 'form form-is-validBoard';
    } else {
      form.className = 'form form-is-invalidBoard';
    }
  } else {
    form.className = 'form';
  }
}

function resetForm() {
  form.reset();
  validateBoard();
  download.className = 'download';
}

function startDownload(dir, file) {
  resetForm();
  window.location = '/download?dir=' + dir + '&file=' + file;
}

function outputOptions() {
  var options = serialize(form, { hash: true });
  options.board = options.board.replace(/http.*\/b\//g, '').replace(/\/.*/g, '');
  options.token = trello.token();
  return options;
}

function onResponse(error, response) {
  if (response.statusCode === 200) {
    var json = JSON.parse(response.responseText);
    startDownload(json.dir, json.file);
  } else {
    message.show('Something went wrong!');
  }
}

function send() {
  var body = outputOptions();
  if (body.hasOwnProperty('token') && body.token) {
    busyDownload();
    request({
      method: 'POST',
      uri: '/generate',
      body: body,
      json: true
    }, onResponse);
  }
}

function sendAfterAuth() {
  eventsTool.unbind(window, 'gottoken', sendAfterAuth);
  send();
}

function submit(event) {
  event.preventDefault();
  if (trello.authorized()) {
    send();
  } else {
    eventsTool.bind(window, 'gottoken', sendAfterAuth);
    trello.authorizeTrello();
  }
}

function initAutocomplete() {
  autocomplete.init(board, trello, trello.regExpURL());
  eventsTool.unbind(window, 'authsuccess', initAutocomplete);
}

function init(trelloInstance) {
  var inputEvent = 'oninput' in window ? 'input' : 'keyup';
  trello = trelloInstance;
  message.init();
  eventsTool.bind(form, 'submit', submit);
  eventsTool.bind(form, 'change', validate);
  eventsTool.bind(form, inputEvent, validate);
  eventsTool.bind(board, 'change', validateBoard);
  eventsTool.bind(board, inputEvent, validateBoard);
  if (trello.authorized()) {
    initAutocomplete();
  } else {
    eventsTool.bind(window, 'authsuccess', initAutocomplete);
  }
}

exports.init = init;

},{"./autocomplete":1,"./messages":6,"./patterns/tx-event.js":7,"browser-request":12,"form-serialize":13}],5:[function(require,module,exports){
/* jshint browser: true */

'use strict';

var overlayLayer = document.getElementById('help');
var closeLink = document.getElementById('closeHelp');
var helpToggle = document.getElementById('helpToggle');
var authHelp = document.getElementById('authHelp');

var overlay = require('./patterns/tx-overlay.js').init(overlayLayer);
var eventsTool = require('./patterns/tx-event.js');

function show(event) {
  if (event) {
    event.preventDefault();
  }
  overlay.toggle();
}

function toggleAuthHelp() {
  if (authHelp.className === 'authHelp') {
    authHelp.className = 'authHelp authHelp-is-invisible';
  } else {
    authHelp.className = 'authHelp';
  }
}

function init() {
  eventsTool.bind(closeLink, 'click', overlay.toggle);
  eventsTool.bind(helpToggle, 'click', show);
  eventsTool.bind(window, 'authsuccess', toggleAuthHelp);
  eventsTool.bind(window, 'authfailure', toggleAuthHelp);
}

exports.init = init;

},{"./patterns/tx-event.js":7,"./patterns/tx-overlay.js":8}],6:[function(require,module,exports){
/* jshint browser: true */

'use strict';

var overlayLayer = document.getElementById('message');
var messageText = document.getElementById('messageText');
var closeLink = document.getElementById('closeMessage');
var okButton = document.getElementById('okMessage');

var overlay = require('./patterns/tx-overlay.js').init(overlayLayer);
var eventsTool = require('./patterns/tx-event.js');

function init() {
  eventsTool.bind(closeLink, 'click', overlay.toggle);
  eventsTool.bind(okButton, 'click', overlay.toggle);
}

function show(message) {
  messageText.textContent = message;
  overlay.toggle();
}

exports.init = init;
exports.show = show;

},{"./patterns/tx-event.js":7,"./patterns/tx-overlay.js":8}],7:[function(require,module,exports){
/* jshint browser: true */

'use strict';

function bind(object, type, callback) {
  if (document.addEventListener) {
    object.addEventListener(type, callback);
  } else {
    object.attachEvent('on' + type, callback);
  }
}

function unbind(object, type, callback) {
  if (document.removeEventListener) {
    object.removeEventListener(type, callback);
  } else {
    object.detachEvent('on' + type, callback);
  }
}

function trigger(object, event, propagate) {
  propagate = propagate || false;
  var eventObj;
  if (document.createEvent) {
    eventObj = document.createEvent('MouseEvents');
    eventObj.initEvent(event, propagate, false);
    object.dispatchEvent(eventObj);
  } else {
    eventObj = document.createEventObject();
    object.fireEvent('on' + event, eventObj);
  }
}

exports.bind = bind;
exports.unbind = unbind;
exports.trigger = trigger;

},{}],8:[function(require,module,exports){
/* jshint browser: true */

'use strict';

var addEvent = require('./tx-event');

function Overlay(element) {

  var object;
  var activeClassName;

  function toggle(event) {
    var currentClassName = object.className;
    if (event) {
      event.preventDefault();
    }
    object.className = currentClassName.indexOf(activeClassName) > -1 ? currentClassName.replace(activeClassName, '') : currentClassName + ' ' + activeClassName;
  }

  function clicked(event) {
    var target = event.target ? event.target : event.srcElement;
    if (target.className.indexOf(activeClassName) > -1) {
      toggle(event);
    }
  }

  function setup() {
    if (element) {
      object = element;
      activeClassName = object.className.split(' ')[0] + '-is-active';
      addEvent.bind(object, 'click', clicked);
    }
  }

  setup();

  return {
    toggle: toggle
  };
}

function init(element) {
  return new Overlay(element);
}

exports.init = init;

},{"./tx-event":7}],9:[function(require,module,exports){
'use strict';

/* jshint browser:true */

function polyfill() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }
}

exports.polyfill = polyfill;

},{}],10:[function(require,module,exports){
/* jshint browser: true */
/* global Modernizr */

'use strict';

var auth = document.getElementById('authToggle');
var autheHelp = document.getElementById('authToggleHelp');

var eventsTool = require('./patterns/tx-event.js');

var APP_KEY = '84e8362bd7d7fefaab5498e386897312';
var LS_KEY = 'trello_token';
var AUTH_ENDPOINT = 'https://trello.com';
var REGEXP_URL = new RegExp(/(?:^(?:https?:\/\/)?|^(?:w{3}\.)?|^(?:https?:\/\/w{3}\.)?)trello\.com\/b\/.+/);

var authWindow;
var trelloAuth = false;
var trelloToken;

function triggerSuccess() {
  eventsTool.trigger(window, 'authsuccess');
}

function triggerFailure() {
  eventsTool.trigger(window, 'authfailure');
}

function authorized() {
  return trelloAuth;
}

function token() {
  return trelloToken;
}

function key() {
  return APP_KEY;
}

function regExpURL() {
  return REGEXP_URL;
}

function receiveAuthMessage(event) {
  var source;
  if (event.origin !== AUTH_ENDPOINT || event.source !== authWindow) {
    triggerFailure();
    return;
  }
  if ((source = event.source) !== null) {
    source.close();
  }
  if (event.data !== null && /[0-9a-f]{64}/.test(event.data)) {
    trelloToken = event.data;
    triggerSuccess();
  } else {
    trelloToken = null;
    triggerFailure();
  }
  if (Modernizr.localstorage && trelloToken) {
    localStorage[LS_KEY] = trelloToken;
  } else if (!trelloToken) {
    delete localStorage[LS_KEY];
  }
  eventsTool.trigger(window, 'gottoken');
  eventsTool.unbind(window, 'message', receiveAuthMessage);
}

function authorizeTrello() {
  eventsTool.bind(window, 'message', receiveAuthMessage);
  var width = 420;
  var height = 470;
  var left = window.screenX + (window.innerWidth - width) / 2;
  var top = window.screenY + (window.innerHeight - height) / 2;
  var location = window.location;
  var origin = (location = /^[a-z]+:\/\/[^\/]*/.exec(location)) !== null ? location[0] : void 0;
  authWindow = window.open('https://trello.com/1/authorize?response_type=token&key=' + APP_KEY + '&return_url=' + origin + '&callback_method=postMessage&scope=read&expiration=never&name=Publish%20Trello', 'trello', 'width=' + width + ',height=' + height + ',left=' + left + ',top=' + top);
}

function deauthorizeTrello() {
  trelloToken = null;
  if (Modernizr.localstorage) {
    delete localStorage[LS_KEY];
  }
}

function authSuccess() {
  trelloAuth = true;
  auth.className = 'authorization authorization-is-authorized';
}

function authFailure() {
  trelloAuth = false;
  auth.className = 'authorization authorization-is-unauthorized';
}

function authToggle(event) {
  event.preventDefault();
  if (!authorized()) {
    authorizeTrello();
  }
}

function init() {
  eventsTool.bind(auth, 'click', authToggle);
  eventsTool.bind(autheHelp, 'click', authToggle);
  eventsTool.bind(window, 'authsuccess', authSuccess);
  eventsTool.bind(window, 'authfailure', authFailure);
  if (Modernizr.localstorage && localStorage[LS_KEY]) {
    trelloToken = localStorage[LS_KEY];
    triggerSuccess();
  }
}

exports.init = init;
exports.authorizeTrello = authorizeTrello;
exports.authorizeTrello = deauthorizeTrello;
exports.authorized = authorized;
exports.token = token;
exports.key = key;
exports.regExpURL = regExpURL;

},{"./patterns/tx-event.js":7}],11:[function(require,module,exports){
/* jshint browser: true */

'use strict';

(function () {

  var cache = require('./components/cache');
  var help = require('./components/help');
  var trello = require('./components/trello');
  var form = require('./components/form');
  var rAF = require('./components/patterns/tx-rAF');

  function init() {
    rAF.polyfill();
    // cache.init();
    help.init();
    trello.init(help);
    form.init(trello);
  }

  init();
})();

},{"./components/cache":3,"./components/form":4,"./components/help":5,"./components/patterns/tx-rAF":9,"./components/trello":10}],12:[function(require,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// UMD HEADER START 
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END

},{}],13:[function(require,module,exports){
// get successful control from form and assemble into object
// http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2

// types which indicate a submit action and are not successful controls
// these will be ignored
var k_r_submitter = /^(?:submit|button|image|reset|file)$/i;

// node names which could be successful controls
var k_r_success_contrls = /^(?:input|select|textarea|keygen)/i;

// Matches bracket notation.
var brackets = /(\[[^\[\]]*\])/g;

// serializes form fields
// @param form MUST be an HTMLForm element
// @param options is an optional argument to configure the serialization. Default output
// with no options specified is a url encoded string
//    - hash: [true | false] Configure the output type. If true, the output will
//    be a js object.
//    - serializer: [function] Optional serializer function to override the default one.
//    The function takes 3 arguments (result, key, value) and should return new result
//    hash and url encoded str serializers are provided with this module
//    - disabled: [true | false]. If true serialize disabled fields.
//    - empty: [true | false]. If true serialize empty fields
function serialize(form, options) {
    if (typeof options != 'object') {
        options = { hash: !!options };
    }
    else if (options.hash === undefined) {
        options.hash = true;
    }

    var result = (options.hash) ? {} : '';
    var serializer = options.serializer || ((options.hash) ? hash_serializer : str_serialize);

    var elements = form && form.elements ? form.elements : [];

    //Object store each radio and set if it's empty or not
    var radio_store = Object.create(null);

    for (var i=0 ; i<elements.length ; ++i) {
        var element = elements[i];

        // ingore disabled fields
        if ((!options.disabled && element.disabled) || !element.name) {
            continue;
        }
        // ignore anyhting that is not considered a success field
        if (!k_r_success_contrls.test(element.nodeName) ||
            k_r_submitter.test(element.type)) {
            continue;
        }

        var key = element.name;
        var val = element.value;

        // we can't just use element.value for checkboxes cause some browsers lie to us
        // they say "on" for value when the box isn't checked
        if ((element.type === 'checkbox' || element.type === 'radio') && !element.checked) {
            val = undefined;
        }

        // If we want empty elements
        if (options.empty) {
            // for checkbox
            if (element.type === 'checkbox' && !element.checked) {
                val = '';
            }

            // for radio
            if (element.type === 'radio') {
                if (!radio_store[element.name] && !element.checked) {
                    radio_store[element.name] = false;
                }
                else if (element.checked) {
                    radio_store[element.name] = true;
                }
            }

            // if options empty is true, continue only if its radio
            if (!val && element.type == 'radio') {
                continue;
            }
        }
        else {
            // value-less fields are ignored unless options.empty is true
            if (!val) {
                continue;
            }
        }

        // multi select boxes
        if (element.type === 'select-multiple') {
            val = [];

            var selectOptions = element.options;
            var isSelectedOptions = false;
            for (var j=0 ; j<selectOptions.length ; ++j) {
                var option = selectOptions[j];
                var allowedEmpty = options.empty && !option.value;
                var hasValue = (option.value || allowedEmpty);
                if (option.selected && hasValue) {
                    isSelectedOptions = true;

                    // If using a hash serializer be sure to add the
                    // correct notation for an array in the multi-select
                    // context. Here the name attribute on the select element
                    // might be missing the trailing bracket pair. Both names
                    // "foo" and "foo[]" should be arrays.
                    if (options.hash && key.slice(key.length - 2) !== '[]') {
                        result = serializer(result, key + '[]', option.value);
                    }
                    else {
                        result = serializer(result, key, option.value);
                    }
                }
            }

            // Serialize if no selected options and options.empty is true
            if (!isSelectedOptions && options.empty) {
                result = serializer(result, key, '');
            }

            continue;
        }

        result = serializer(result, key, val);
    }

    // Check for all empty radio buttons and serialize them with key=""
    if (options.empty) {
        for (var key in radio_store) {
            if (!radio_store[key]) {
                result = serializer(result, key, '');
            }
        }
    }

    return result;
}

function parse_keys(string) {
    var keys = [];
    var prefix = /^([^\[\]]*)/;
    var children = new RegExp(brackets);
    var match = prefix.exec(string);

    if (match[1]) {
        keys.push(match[1]);
    }

    while ((match = children.exec(string)) !== null) {
        keys.push(match[1]);
    }

    return keys;
}

function hash_assign(result, keys, value) {
    if (keys.length === 0) {
        result = value;
        return result;
    }

    var key = keys.shift();
    var between = key.match(/^\[(.+?)\]$/);

    if (key === '[]') {
        result = result || [];

        if (Array.isArray(result)) {
            result.push(hash_assign(null, keys, value));
        }
        else {
            // This might be the result of bad name attributes like "[][foo]",
            // in this case the original `result` object will already be
            // assigned to an object literal. Rather than coerce the object to
            // an array, or cause an exception the attribute "_values" is
            // assigned as an array.
            result._values = result._values || [];
            result._values.push(hash_assign(null, keys, value));
        }

        return result;
    }

    // Key is an attribute name and can be assigned directly.
    if (!between) {
        result[key] = hash_assign(result[key], keys, value);
    }
    else {
        var string = between[1];
        var index = parseInt(string, 10);

        // If the characters between the brackets is not a number it is an
        // attribute name and can be assigned directly.
        if (isNaN(index)) {
            result = result || {};
            result[string] = hash_assign(result[string], keys, value);
        }
        else {
            result = result || [];
            result[index] = hash_assign(result[index], keys, value);
        }
    }

    return result;
}

// Object/hash encoding serializer.
function hash_serializer(result, key, value) {
    var matches = key.match(brackets);

    // Has brackets? Use the recursive assignment function to walk the keys,
    // construct any missing objects in the result tree and make the assignment
    // at the end of the chain.
    if (matches) {
        var keys = parse_keys(key);
        hash_assign(result, keys, value);
    }
    else {
        // Non bracket notation can make assignments directly.
        var existing = result[key];

        // If the value has been assigned already (for instance when a radio and
        // a checkbox have the same name attribute) convert the previous value
        // into an array before pushing into it.
        //
        // NOTE: If this requirement were removed all hash creation and
        // assignment could go through `hash_assign`.
        if (existing) {
            if (!Array.isArray(existing)) {
                result[key] = [ existing ];
            }

            result[key].push(value);
        }
        else {
            result[key] = value;
        }
    }

    return result;
}

// urlform encoding serializer
function str_serialize(result, key, value) {
    // encode newlines as \r\n cause the html spec says so
    value = value.replace(/(\r)?\n/g, '\r\n');
    value = encodeURIComponent(value);

    // spaces should be '+' rather than '%20'.
    value = value.replace(/%20/g, '+');
    return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
}

module.exports = serialize;

},{}]},{},[11]);

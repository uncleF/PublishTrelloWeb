(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require === 'function' && require;
        if (!u && a) {
          return a(o, !0);
        }
        if (i) {
          return i(o, !0);
        }
        var f = new Error('Cannot find module \'' + o + '\'');
        throw f.code = 'MODULE_NOT_FOUND', f;
      }
      var l = n[o] = { exports: {} };
      t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];
        return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = typeof require === 'function' && require;
  for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }
  return s;
}({
  1: [
    function (require, module, exports) {
      var TX_EVENT = function () {
        function bind(object, type, callback) {
          if (document.addEventListener) {
            object.addEventListener(type, callback);
          } else {
            object.attachEvent(type, callback);
          }
        }
        return { bind: bind };
      }();
      module.exports = TX_EVENT;
    },
    {}
  ],
  2: [
    function (require, module, exports) {
      var SEND_DATA = function () {
        var event = require('./components/tx-event.js');
        var serialize = require('form-serialize');
        var request = require('browser-request');
        var form;
        var LINK = 'http://192.168.1.101:8000/generate';
        function init() {
          form = document.getElementById('options');
          event.bind(form, 'submit', send);
        }
        function send(event) {
          event.preventDefault();
          request(LINK + '?' + serialize(form), onResponse);
        }
        function onResponse(error, response, body) {
          console.log(response);
        }
        return { init: init };
      }();
      module.exports = SEND_DATA;
    },
    {
      './components/tx-event.js': 1,
      'browser-request': 4,
      'form-serialize': 5
    }
  ],
  3: [
    function (require, module, exports) {
      (function () {
        var data = require('./data.js');
        data.init();
      }());
    },
    { './data.js': 2 }
  ],
  4: [
    function (require, module, exports) {
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
        var XHR = XMLHttpRequest;
        if (!XHR) {
          throw new Error('missing XMLHttpRequest');
        }
        request.log = {
          'trace': noop,
          'debug': noop,
          'info': noop,
          'warn': noop,
          'error': noop
        };
        var DEFAULT_TIMEOUT = 3 * 60 * 1000;
        // 3 minutes
        //
        // request
        //
        function request(options, callback) {
          // The entry-point to the API: prep the options object and pass the real work to run_xhr.
          if (typeof callback !== 'function') {
            throw new Error('Bad callback given: ' + callback);
          }
          if (!options) {
            throw new Error('No options given');
          }
          var optionsOnResponse = options.onResponse;
          // Save this for later.
          if (typeof options === 'string') {
            options = { 'uri': options };
          } else {
            options = JSON.parse(JSON.stringify(options));
          }
          // Use a duplicate for mutating.
          options.onResponse = optionsOnResponse;
          // And put it back.
          if (options.verbose) {
            request.log = getLogger();
          }
          if (options.url) {
            options.uri = options.url;
            delete options.url;
          }
          if (!options.uri && options.uri !== '') {
            throw new Error('options.uri is a required argument');
          }
          if (typeof options.uri !== 'string') {
            throw new Error('options.uri must be a string');
          }
          var unsupportedOptions = [
            'proxy',
            '_redirectsFollowed',
            'maxRedirects',
            'followRedirect'
          ];
          for (var i = 0; i < unsupportedOptions.length; i++) {
            if (options[unsupportedOptions[i]]) {
              throw new Error('options.' + unsupportedOptions[i] + ' is not supported');
            }
          }
          options.callback = callback;
          options.method = options.method || 'GET';
          options.headers = options.headers || {};
          options.body = options.body || null;
          options.timeout = options.timeout || request.DEFAULT_TIMEOUT;
          if (options.headers.host) {
            throw new Error('Options.headers.host is not supported');
          }
          if (options.json) {
            options.headers.accept = options.headers.accept || 'application/json';
            if (options.method !== 'GET') {
              options.headers['content-type'] = 'application/json';
            }
            if (typeof options.json !== 'boolean') {
              options.body = JSON.stringify(options.json);
            } else if (typeof options.body !== 'string') {
              options.body = JSON.stringify(options.body);
            }
          }
          //BEGIN QS Hack
          var serialize = function (obj) {
            var str = [];
            for (var p in obj)
              if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
              }
            return str.join('&');
          };
          if (options.qs) {
            var qs = typeof options.qs === 'string' ? options.qs : serialize(options.qs);
            if (options.uri.indexOf('?') !== -1) {
              //no get params
              options.uri = options.uri + '&' + qs;
            } else {
              //existing get params
              options.uri = options.uri + '?' + qs;
            }
          }
          //END QS Hack
          //BEGIN FORM Hack
          var multipart = function (obj) {
            //todo: support file type (useful?)
            var result = {};
            result.boundry = '-------------------------------' + Math.floor(Math.random() * 1000000000);
            var lines = [];
            for (var p in obj) {
              if (obj.hasOwnProperty(p)) {
                lines.push('--' + result.boundry + '\n' + 'Content-Disposition: form-data; name="' + p + '"' + '\n' + '\n' + obj[p] + '\n');
              }
            }
            lines.push('--' + result.boundry + '--');
            result.body = lines.join('');
            result.length = result.body.length;
            result.type = 'multipart/form-data; boundary=' + result.boundry;
            return result;
          };
          if (options.form) {
            if (typeof options.form === 'string') {
              throw 'form name unsupported';
            }
            if (options.method === 'POST') {
              var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
              options.headers['content-type'] = encoding;
              switch (encoding) {
              case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, '+');
                break;
              case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
              default:
                throw new Error('unsupported encoding:' + encoding);
              }
            }
          }
          //END FORM Hack
          // If onResponse is boolean true, call back immediately when the response is known,
          // not when the full request is complete.
          options.onResponse = options.onResponse || noop;
          if (options.onResponse === true) {
            options.onResponse = callback;
            options.callback = noop;
          }
          // XXX Browsers do not like this.
          //if(options.body)
          //  options.headers['content-length'] = options.body.length;
          // HTTP basic authentication
          if (!options.headers.authorization && options.auth) {
            options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);
          }
          return runXhr(options);
        }
        var reqSeq = 0;
        function runXhr(options) {
          var xhr = new XHR(), timedOut = false, isCors = isCrossDomain(options.uri), supportsCors = 'withCredentials' in xhr;
          reqSeq += 1;
          xhr.seq_id = req_seq;
          xhr.id = reqSeq + ': ' + options.method + ' ' + options.uri;
          xhr._id = xhr.id;
          // I know I will type "_id" from habit all the time.
          if (isCors && !supportsCors) {
            var corsErr = new Error('Browser does not support cross-origin request: ' + options.uri);
            corsErr.cors = 'unsupported';
            return options.callback(corsErr, xhr);
          }
          xhr.timeoutTimer = setTimeout(tooLate, options.timeout);
          function tooLate() {
            timedOut = true;
            var er = new Error('ETIMEDOUT');
            er.code = 'ETIMEDOUT';
            er.duration = options.timeout;
            request.log.error('Timeout', {
              'id': xhr._id,
              'milliseconds': options.timeout
            });
            return options.callback(er, xhr);
          }
          // Some states can be skipped over, so remember what is still incomplete.
          var did = {
            'response': false,
            'loading': false,
            'end': false
          };
          xhr.onreadystatechange = onStateChange;
          xhr.open(options.method, options.uri, true);
          // asynchronous
          if (isCors) {
            xhr.withCredentials = !!options.withCredentials;
          }
          xhr.send(options.body);
          return xhr;
          function onStateChange(event) {
            if (timedOut) {
              return request.log.debug('Ignoring timed out state change', {
                'state': xhr.readyState,
                'id': xhr.id
              });
            }
            request.log.debug('State change', {
              'state': xhr.readyState,
              'id': xhr.id,
              'timed_out': timed_out
            });
            if (xhr.readyState === XHR.OPENED) {
              request.log.debug('Request started', { 'id': xhr.id });
              for (var key in options.headers)
                xhr.setRequestHeader(key, options.headers[key]);
            } else if (xhr.readyState === XHR.HEADERS_RECEIVED) {
              onResponse();
            } else if (xhr.readyState === XHR.LOADING) {
              onResponse();
              onLoading();
            } else if (xhr.readyState === XHR.DONE) {
              onResponse();
              onLoading();
              onEnd();
            }
          }
          function onResponse() {
            if (did.response) {
              return;
            }
            did.response = true;
            request.log.debug('Got response', {
              'id': xhr.id,
              'status': xhr.status
            });
            clearTimeout(xhr.timeoutTimer);
            xhr.statusCode = xhr.status;
            // Node request compatibility
            // Detect failed CORS requests.
            if (isCors && xhr.statusCode === 0) {
              var corsErr = new Error('CORS request rejected: ' + options.uri);
              corsErr.cors = 'rejected';
              // Do not process this request further.
              did.loading = true;
              did.end = true;
              return options.callback(corsErr, xhr);
            }
            options.onResponse(null, xhr);
          }
          function onLoading() {
            if (did.loading) {
              return;
            }
            did.loading = true;
            request.log.debug('Response body loading', { 'id': xhr.id })  // TODO: Maybe simulate "data" events by watching xhr.responseText
;
          }
          function onEnd() {
            if (did.end) {
              return;
            }
            did.end = true;
            request.log.debug('Request done', { 'id': xhr.id });
            xhr.body = xhr.responseText;
            if (options.json) {
              try {
                xhr.body = JSON.parse(xhr.responseText);
              } catch (er) {
                return options.callback(er, xhr);
              }
            }
            options.callback(null, xhr, xhr.body);
          }
        }
        // request
        request.withCredentials = false;
        request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;
        //
        // defaults
        //
        request.defaults = function (options, requester) {
          var def = function (method) {
            var d = function (params, callback) {
              if (typeof params === 'string') {
                params = { 'uri': params };
              } else {
                params = JSON.parse(JSON.stringify(params));
              }
              for (var i in options) {
                if (params[i] === undefined) {
                  params[i] = options[i];
                }
              }
              return method(params, callback);
            };
            return d;
          };
          var de = def(request);
          de.get = def(request.get);
          de.post = def(request.post);
          de.put = def(request.put);
          de.head = def(request.head);
          return de;
        };
        //
        // HTTP method shortcuts
        //
        var shortcuts = [
          'get',
          'put',
          'post',
          'head'
        ];
        shortcuts.forEach(function (shortcut) {
          var method = shortcut.toUpperCase();
          var func = shortcut.toLowerCase();
          request[func] = function (opts) {
            if (typeof opts === 'string') {
              opts = {
                'method': method,
                'uri': opts
              };
            } else {
              opts = JSON.parse(JSON.stringify(opts));
              opts.method = method;
            }
            var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
            return request.apply(this, args);
          };
        });
        //
        // CouchDB shortcut
        //
        request.couch = function (options, callback) {
          if (typeof options === 'string') {
            options = { 'uri': options };
          }
          // Just use the request API to do JSON.
          options.json = true;
          if (options.body) {
            options.json = options.body;
          }
          delete options.body;
          callback = callback || noop;
          var xhr = request(options, couchHandler);
          return xhr;
          function couchHandler(er, resp, body) {
            if (er) {
              return callback(er, resp, body);
            }
            if ((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
              // The body is a Couch JSON object indicating the error.
              er = new Error('CouchDB error: ' + (body.error.reason || body.error.error));
              for (var key in body)
                er[key] = body[key];
              return callback(er, resp, body);
            }
            return callback(er, resp, body);
          }
        };
        //
        // Utility
        //
        function noop() {
        }
        function getLogger() {
          var logger = {}, levels = [
              'trace',
              'debug',
              'info',
              'warn',
              'error'
            ], level, i;
          for (i = 0; i < levels.length; i++) {
            level = levels[i];
            logger[level] = noop;
            if (typeof console !== 'undefined' && console && console[level]) {
              logger[level] = formatted(console, level);
            }
          }
          return logger;
        }
        function formatted(obj, method) {
          return formattedLogger;
          function formattedLogger(str, context) {
            if (typeof context === 'object') {
              str += ' ' + JSON.stringify(context);
            }
            return obj[method].call(obj, str);
          }
        }
        // Return whether a URL is a cross-domain request.
        function isCrossDomain(url) {
          var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;
          // jQuery #8138, IE may throw an exception when accessing
          // a field from window.location if document.domain has been set
          var ajaxLocation;
          try {
            ajaxLocation = location.href;
          } catch (e) {
            // Use the href attribute of an A element since IE will modify it given document.location
            ajaxLocation = document.createElement('a');
            ajaxLocation.href = '';
            ajaxLocation = ajaxLocation.href;
          }
          var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [], parts = rurl.exec(url.toLowerCase());
          var result = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === 'http:' ? 80 : 443)) !== (ajaxLocParts[3] || (ajaxLocParts[1] === 'http:' ? 80 : 443))));
          //console.debug('is_crossDomain('+url+') -> ' + result)
          return result;
        }
        // MIT License from http://phpjs.org/functions/base64_encode:358
        function b64_enc(data) {
          // Encodes string using MIME base64 algorithm
          var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
          var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc = '', tmpArr = [];
          if (!data) {
            return data;
          }
          // assume utf8 data
          // data = this.utf8_encode(data+'');
          do {
            // pack three octets into four hexets
            o1 = data.charCodeAt(i++);
            o2 = data.charCodeAt(i++);
            o3 = data.charCodeAt(i++);
            bits = o1 << 16 | o2 << 8 | o3;
            h1 = bits >> 18 & 63;
            h2 = bits >> 12 & 63;
            h3 = bits >> 6 & 63;
            h4 = bits & 63;
            // use hexets to index into b64, and append result to encoded string
            tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
          } while (i < data.length);
          enc = tmpArr.join('');
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
        return request;  //UMD FOOTER START
      }));  //UMD FOOTER END
    },
    {}
  ],
  5: [
    function (require, module, exports) {
      // get successful control from form and assemble into object
      // http://www.w3.org/TR/html401/interact/forms.html#h-17.13.2
      // types which indicate a submit action and are not successful controls
      // these will be ignored
      var kR_submitter = /^(?:submit|button|image|reset|file)$/i;
      // node names which could be successful controls
      var kR_successContrls = /^(?:input|select|textarea|keygen)/i;
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
        if (typeof options !== 'object') {
          options = { hash: !!options };
        } else if (options.hash === undefined) {
          options.hash = true;
        }
        var result = options.hash ? {} : '';
        var serializer = options.serializer || (options.hash ? hashSerializer : strSerialize);
        var elements = form && form.elements ? form.elements : [];
        //Object store each radio and set if it's empty or not
        var radioStore = Object.create(null);
        for (var i = 0; i < elements.length; ++i) {
          var element = elements[i];
          // ingore disabled fields
          if (!options.disabled && element.disabled || !element.name) {
            continue;
          }
          // ignore anyhting that is not considered a success field
          if (!kR_successContrls.test(element.nodeName) || kR_submitter.test(element.type)) {
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
              if (!radioStore[element.name] && !element.checked) {
                radioStore[element.name] = false;
              } else if (element.checked) {
                radioStore[element.name] = true;
              }
            }
            // if options empty is true, continue only if its radio
            if (!val && element.type === 'radio') {
              continue;
            }
          } else {
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
            for (var j = 0; j < selectOptions.length; ++j) {
              var option = selectOptions[j];
              var allowedEmpty = options.empty && !option.value;
              var hasValue = option.value || allowedEmpty;
              if (option.selected && hasValue) {
                isSelectedOptions = true;
                // If using a hash serializer be sure to add the
                // correct notation for an array in the multi-select
                // context. Here the name attribute on the select element
                // might be missing the trailing bracket pair. Both names
                // "foo" and "foo[]" should be arrays.
                if (options.hash && key.slice(key.length - 2) !== '[]') {
                  result = serializer(result, key + '[]', option.value);
                } else {
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
          for (var key in radioStore) {
            if (!radioStore[key]) {
              result = serializer(result, key, '');
            }
          }
        }
        return result;
      }
      function parseKeys(string) {
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
      function hashAssign(result, keys, value) {
        if (keys.length === 0) {
          result = value;
          return result;
        }
        var key = keys.shift();
        var between = key.match(/^\[(.+?)\]$/);
        if (key === '[]') {
          result = result || [];
          if (Array.isArray(result)) {
            result.push(hashAssign(null, keys, value));
          } else {
            // This might be the result of bad name attributes like "[][foo]",
            // in this case the original `result` object will already be
            // assigned to an object literal. Rather than coerce the object to
            // an array, or cause an exception the attribute "_values" is
            // assigned as an array.
            result._values = result._values || [];
            result._values.push(hashAssign(null, keys, value));
          }
          return result;
        }
        // Key is an attribute name and can be assigned directly.
        if (!between) {
          result[key] = hashAssign(result[key], keys, value);
        } else {
          var string = between[1];
          var index = parseInt(string, 10);
          // If the characters between the brackets is not a number it is an
          // attribute name and can be assigned directly.
          if (isNaN(index)) {
            result = result || {};
            result[string] = hashAssign(result[string], keys, value);
          } else {
            result = result || [];
            result[index] = hashAssign(result[index], keys, value);
          }
        }
        return result;
      }
      // Object/hash encoding serializer.
      function hashSerializer(result, key, value) {
        var matches = key.match(brackets);
        // Has brackets? Use the recursive assignment function to walk the keys,
        // construct any missing objects in the result tree and make the assignment
        // at the end of the chain.
        if (matches) {
          var keys = parseKeys(key);
          hashAssign(result, keys, value);
        } else {
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
              result[key] = [existing];
            }
            result[key].push(value);
          } else {
            result[key] = value;
          }
        }
        return result;
      }
      // urlform encoding serializer
      function strSerialize(result, key, value) {
        // encode newlines as \r\n cause the html spec says so
        value = value.replace(/(\r)?\n/g, '\r\n');
        value = encodeURIComponent(value);
        // spaces should be '+' rather than '%20'.
        value = value.replace(/%20/g, '+');
        return result + (result ? '&' : '') + encodeURIComponent(key) + '=' + value;
      }
      module.exports = serialize;
    },
    {}
  ]
}, {}, [3]));
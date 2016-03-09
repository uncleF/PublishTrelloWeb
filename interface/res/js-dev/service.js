/* jshint browser: true */
/* global self */
/* global caches */

'use strict';

var CACHE_NAME = 'pt-cache-v3';

var offline = [
  '/',
  '/res/css/styles.css',
  '/res/js/scripts.js'
];

function onInstall(event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function(cache) {
        cache.addAll(offline);
      })
  );
}

function onFetch(event) {
  var request = event.request;
  var fetchedFromNetwork = function(response) {
    var clonedResponse = response.clone();
    caches.open(CACHE_NAME).then(function(cache) {
      cache.put(request, clonedResponse);
    });
    return response;
  };
  var queriedCache = function(cached) {
    var networked = fetch(request).then(fetchedFromNetwork);
    return cached || networked;
  };
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }
  event.respondWith(caches.match(request).then(queriedCache));
}

self.addEventListener('install', onInstall);
self.addEventListener('fetch', onFetch);

!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){"use strict";function d(){Modernizr.serviceworker&&navigator.serviceWorker.register("/service.js")}c.init=d},{}],2:[function(a,b,c){"use strict";function d(){s.disabled=!s.disabled,"download"!==s.className&&(s.className="download")}function e(){d(),s.className="download download-is-busy"}function f(){"download download-is-busy"!==s.className&&s.disabled&&"form form-is-validBoard"===q.className&&(t.html.checked||t.md.checked||t.pdf.checked||t.epub.checked)?d():"download download-is-busy"===s.className||s.disabled||"form form-is-validBoard"===q.className&&(t.html.checked||t.md.checked||t.pdf.checked||t.epub.checked)||d()}function g(){""!==r.value?r.value.match(y)?q.className="form form-is-validBoard":q.className="form form-is-invalidBoard":q.className="form"}function h(){q.reset(),g(),d()}function i(a,b){h(),window.location="/download?dir="+a+"&file="+b}function j(){var a=v(q,{hash:!0});return a.board=a.board.replace(/http.*\/b\//g,"").replace(/\/.*/g,""),a.token=p.token(),a}function k(a,b){if(200===b.statusCode){var c=JSON.parse(b.responseText);i(c.dir,c.file)}else w.show("Something went wrong!")}function l(){e(),u({method:"POST",uri:"/generate",body:j(),json:!0},k)}function m(){x.unbind(window,"authsuccess",m),l()}function n(a){a.preventDefault(),p.authorized()?l():(x.bind(window,"authsuccess",m),p.authorizeTrello())}function o(a){var b="oninput"in window?"input":"keyup";p=a,w.init(),x.bind(q,"submit",n),x.bind(q,"change",f),x.bind(q,b,f),x.bind(r,"change",g),x.bind(r,b,g)}var p,q=document.getElementById("form"),r=document.getElementById("board"),s=document.getElementById("download"),t={html:document.getElementById("html"),md:document.getElementById("md"),pdf:document.getElementById("pdf"),epub:document.getElementById("epub")},u=a("browser-request"),v=a("form-serialize"),w=a("./messages"),x=a("./patterns/tx-event.js"),y=new RegExp(/(?:^(?:https?:\/\/)?|^(?:w{3}\.)?|^(?:https?:\/\/w{3}\.)?)trello\.com\/b\//);c.init=o},{"./messages":4,"./patterns/tx-event.js":5,"browser-request":9,"form-serialize":10}],3:[function(a,b,c){"use strict";function d(a){a&&a.preventDefault(),k.toggle()}function e(){"authHelp"===j.className?j.className="authHelp authHelp-is-invisible":j.className="authHelp"}function f(){l.bind(h,"click",k.toggle),l.bind(i,"click",d),l.bind(window,"authsuccess",e),l.bind(window,"authfailure",e)}var g=document.getElementById("help"),h=document.getElementById("closeHelp"),i=document.getElementById("helpToggle"),j=document.getElementById("authHelp"),k=a("./patterns/tx-overlay.js").init(g),l=a("./patterns/tx-event.js");c.init=f},{"./patterns/tx-event.js":5,"./patterns/tx-overlay.js":6}],4:[function(a,b,c){"use strict";function d(){k.bind(h,"click",j.toggle),k.bind(i,"click",j.toggle)}function e(a){g.textContent=a,j.toggle()}var f=document.getElementById("message"),g=document.getElementById("messageText"),h=document.getElementById("closeMessage"),i=document.getElementById("okMessage"),j=a("./patterns/tx-overlay.js").init(f),k=a("./patterns/tx-event.js");c.init=d,c.show=e},{"./patterns/tx-event.js":5,"./patterns/tx-overlay.js":6}],5:[function(a,b,c){"use strict";function d(a,b,c){document.addEventListener?a.addEventListener(b,c):a.attachEvent("on"+b,c)}function e(a,b,c){document.removeEventListener?a.removeEventListener(b,c):a.detachEvent("on"+b,c)}function f(a,b,c){c=c||!1;var d;document.createEvent?(d=document.createEvent("MouseEvents"),d.initEvent(b,c,!1),a.dispatchEvent(d)):(d=document.createEventObject(),a.fireEvent("on"+b,d))}c.bind=d,c.unbind=e,c.trigger=f},{}],6:[function(a,b,c){"use strict";function d(a){function b(a){var b=e.className;a&&a.preventDefault(),e.className=b.indexOf(g)>-1?b.replace(g,""):b+" "+g}function c(a){var c=a.target?a.target:a.srcElement;c.className.indexOf(g)>-1&&b(a)}function d(){a&&(e=a,g=e.className.split(" ")[0]+"-is-active",f.bind(e,"click",c))}var e,g;return d(),{toggle:b}}function e(a){return new d(a)}var f=a("./tx-event");c.init=e},{"./tx-event":5}],7:[function(a,b,c){"use strict";function d(){q.trigger(window,"authsuccess")}function e(){q.trigger(window,"authfailure")}function f(){Trello.authorize({type:"popup",name:"Publish Trello",expiration:"never",success:d,error:e})}function g(){return s}function h(){return n}function i(a){a.preventDefault(),f()}function j(a){a.preventDefault(),g()||f()}function k(){s=Trello.authorized(),n=Trello.token(),o.className="authorization authorization-is-authorized"}function l(){s=!1,n=void 0,o.className="authorization authorization-is-unauthorized"}function m(){q.bind(o,"click",j),q.bind(p,"click",i),q.bind(window,"authsuccess",k),q.bind(window,"authfailure",l),Modernizr.localstorage&&localStorage[r]&&(n=localStorage[r],o.className="authorization authorization-is-authorized")}var n,o=document.getElementById("authToggle"),p=document.getElementById("authToggleHelp"),q=a("./patterns/tx-event.js"),r="trello_token",s=!1;c.init=m,c.authorizeTrello=f,c.authorized=g,c.token=h},{"./patterns/tx-event.js":5}],8:[function(a,b,c){"use strict";!function(){function b(){d.init(),c.init(),e.init(c),f.init(e)}var c=a("./components/help"),d=a("./components/cache"),e=a("./components/trello"),f=a("./components/form");b()}()},{"./components/cache":1,"./components/form":2,"./components/help":3,"./components/trello":7}],9:[function(a,b,c){!function(a,d){"function"==typeof define&&define.amd?define([],d):"object"==typeof c?b.exports=d():a.returnExports=d()}(this,function(){function a(e,f){if("function"!=typeof f)throw new Error("Bad callback given: "+f);if(!e)throw new Error("No options given");var h=e.onResponse;if(e="string"==typeof e?{uri:e}:JSON.parse(JSON.stringify(e)),e.onResponse=h,e.verbose&&(a.log=d()),e.url&&(e.uri=e.url,delete e.url),!e.uri&&""!==e.uri)throw new Error("options.uri is a required argument");if("string"!=typeof e.uri)throw new Error("options.uri must be a string");for(var i=["proxy","_redirectsFollowed","maxRedirects","followRedirect"],j=0;j<i.length;j++)if(e[i[j]])throw new Error("options."+i[j]+" is not supported");if(e.callback=f,e.method=e.method||"GET",e.headers=e.headers||{},e.body=e.body||null,e.timeout=e.timeout||a.DEFAULT_TIMEOUT,e.headers.host)throw new Error("Options.headers.host is not supported");e.json&&(e.headers.accept=e.headers.accept||"application/json","GET"!==e.method&&(e.headers["content-type"]="application/json"),"boolean"!=typeof e.json?e.body=JSON.stringify(e.json):"string"!=typeof e.body&&(e.body=JSON.stringify(e.body)));var k=function(a){var b=[];for(var c in a)a.hasOwnProperty(c)&&b.push(encodeURIComponent(c)+"="+encodeURIComponent(a[c]));return b.join("&")};if(e.qs){var l="string"==typeof e.qs?e.qs:k(e.qs);-1!==e.uri.indexOf("?")?e.uri=e.uri+"&"+l:e.uri=e.uri+"?"+l}var m=function(a){var b={};b.boundry="-------------------------------"+Math.floor(1e9*Math.random());var c=[];for(var d in a)a.hasOwnProperty(d)&&c.push("--"+b.boundry+'\nContent-Disposition: form-data; name="'+d+'"\n\n'+a[d]+"\n");return c.push("--"+b.boundry+"--"),b.body=c.join(""),b.length=b.body.length,b.type="multipart/form-data; boundary="+b.boundry,b};if(e.form){if("string"==typeof e.form)throw"form name unsupported";if("POST"===e.method){var n=(e.encoding||"application/x-www-form-urlencoded").toLowerCase();switch(e.headers["content-type"]=n,n){case"application/x-www-form-urlencoded":e.body=k(e.form).replace(/%20/g,"+");break;case"multipart/form-data":var o=m(e.form);e.body=o.body,e.headers["content-type"]=o.type;break;default:throw new Error("unsupported encoding:"+n)}}}return e.onResponse=e.onResponse||c,e.onResponse===!0&&(e.onResponse=f,e.callback=c),!e.headers.authorization&&e.auth&&(e.headers.authorization="Basic "+g(e.auth.username+":"+e.auth.password)),b(e)}function b(b){function c(){l=!0;var c=new Error("ETIMEDOUT");return c.code="ETIMEDOUT",c.duration=b.timeout,a.log.error("Timeout",{id:k._id,milliseconds:b.timeout}),b.callback(c,k)}function d(c){if(l)return a.log.debug("Ignoring timed out state change",{state:k.readyState,id:k.id});if(a.log.debug("State change",{state:k.readyState,id:k.id,timed_out:l}),k.readyState===h.OPENED){a.log.debug("Request started",{id:k.id});for(var d in b.headers)k.setRequestHeader(d,b.headers[d])}else k.readyState===h.HEADERS_RECEIVED?e():k.readyState===h.LOADING?(e(),g()):k.readyState===h.DONE&&(e(),g(),i())}function e(){if(!p.response){if(p.response=!0,a.log.debug("Got response",{id:k.id,status:k.status}),clearTimeout(k.timeoutTimer),k.statusCode=k.status,m&&0==k.statusCode){var c=new Error("CORS request rejected: "+b.uri);return c.cors="rejected",p.loading=!0,p.end=!0,b.callback(c,k)}b.onResponse(null,k)}}function g(){p.loading||(p.loading=!0,a.log.debug("Response body loading",{id:k.id}))}function i(){if(!p.end){if(p.end=!0,a.log.debug("Request done",{id:k.id}),k.body=k.responseText,b.json)try{k.body=JSON.parse(k.responseText)}catch(c){return b.callback(c,k)}b.callback(null,k,k.body)}}var k=new h,l=!1,m=f(b.uri),n="withCredentials"in k;if(j+=1,k.seq_id=j,k.id=j+": "+b.method+" "+b.uri,k._id=k.id,m&&!n){var o=new Error("Browser does not support cross-origin request: "+b.uri);return o.cors="unsupported",b.callback(o,k)}k.timeoutTimer=setTimeout(c,b.timeout);var p={response:!1,loading:!1,end:!1};return k.onreadystatechange=d,k.open(b.method,b.uri,!0),m&&(k.withCredentials=!!b.withCredentials),k.send(b.body),k}function c(){}function d(){var a,b,d={},f=["trace","debug","info","warn","error"];for(b=0;b<f.length;b++)a=f[b],d[a]=c,"undefined"!=typeof console&&console&&console[a]&&(d[a]=e(console,a));return d}function e(a,b){function c(c,d){return"object"==typeof d&&(c+=" "+JSON.stringify(d)),a[b].call(a,c)}return c}function f(a){var b,c=/^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/;try{b=location.href}catch(d){b=document.createElement("a"),b.href="",b=b.href}var e=c.exec(b.toLowerCase())||[],f=c.exec(a.toLowerCase()),g=!(!f||f[1]==e[1]&&f[2]==e[2]&&(f[3]||("http:"===f[1]?80:443))==(e[3]||("http:"===e[1]?80:443)));return g}function g(a){var b,c,d,e,f,g,h,i,j="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",k=0,l=0,m="",n=[];if(!a)return a;do b=a.charCodeAt(k++),c=a.charCodeAt(k++),d=a.charCodeAt(k++),i=b<<16|c<<8|d,e=i>>18&63,f=i>>12&63,g=i>>6&63,h=63&i,n[l++]=j.charAt(e)+j.charAt(f)+j.charAt(g)+j.charAt(h);while(k<a.length);switch(m=n.join(""),a.length%3){case 1:m=m.slice(0,-2)+"==";break;case 2:m=m.slice(0,-1)+"="}return m}var h=XMLHttpRequest;if(!h)throw new Error("missing XMLHttpRequest");a.log={trace:c,debug:c,info:c,warn:c,error:c};var i=18e4,j=0;a.withCredentials=!1,a.DEFAULT_TIMEOUT=i,a.defaults=function(b,c){var d=function(a){var c=function(c,d){c="string"==typeof c?{uri:c}:JSON.parse(JSON.stringify(c));for(var e in b)void 0===c[e]&&(c[e]=b[e]);return a(c,d)};return c},e=d(a);return e.get=d(a.get),e.post=d(a.post),e.put=d(a.put),e.head=d(a.head),e};var k=["get","put","post","head"];return k.forEach(function(b){var c=b.toUpperCase(),d=b.toLowerCase();a[d]=function(b){"string"==typeof b?b={method:c,uri:b}:(b=JSON.parse(JSON.stringify(b)),b.method=c);var d=[b].concat(Array.prototype.slice.apply(arguments,[1]));return a.apply(this,d)}}),a.couch=function(b,d){function e(a,b,c){if(a)return d(a,b,c);if((b.statusCode<200||b.statusCode>299)&&c.error){a=new Error("CouchDB error: "+(c.error.reason||c.error.error));for(var e in c)a[e]=c[e];return d(a,b,c)}return d(a,b,c)}"string"==typeof b&&(b={uri:b}),b.json=!0,b.body&&(b.json=b.body),delete b.body,d=d||c;var f=a(b,e);return f},a})},{}],10:[function(a,b,c){function d(a,b){"object"!=typeof b?b={hash:!!b}:void 0===b.hash&&(b.hash=!0);for(var c=b.hash?{}:"",d=b.serializer||(b.hash?g:h),e=a&&a.elements?a.elements:[],f=Object.create(null),k=0;k<e.length;++k){var l=e[k];if((b.disabled||!l.disabled)&&l.name&&j.test(l.nodeName)&&!i.test(l.type)){var m=l.name,n=l.value;if("checkbox"!==l.type&&"radio"!==l.type||l.checked||(n=void 0),b.empty){if("checkbox"!==l.type||l.checked||(n=""),"radio"===l.type&&(f[l.name]||l.checked?l.checked&&(f[l.name]=!0):f[l.name]=!1),!n&&"radio"==l.type)continue}else if(!n)continue;if("select-multiple"!==l.type)c=d(c,m,n);else{n=[];for(var o=l.options,p=!1,q=0;q<o.length;++q){var r=o[q],s=b.empty&&!r.value,t=r.value||s;r.selected&&t&&(p=!0,c=b.hash&&"[]"!==m.slice(m.length-2)?d(c,m+"[]",r.value):d(c,m,r.value))}!p&&b.empty&&(c=d(c,m,""))}}}if(b.empty)for(var m in f)f[m]||(c=d(c,m,""));return c}function e(a){var b=[],c=/^([^\[\]]*)/,d=new RegExp(k),e=c.exec(a);for(e[1]&&b.push(e[1]);null!==(e=d.exec(a));)b.push(e[1]);return b}function f(a,b,c){if(0===b.length)return a=c;var d=b.shift(),e=d.match(/^\[(.+?)\]$/);if("[]"===d)return a=a||[],Array.isArray(a)?a.push(f(null,b,c)):(a._values=a._values||[],a._values.push(f(null,b,c))),a;if(e){var g=e[1],h=parseInt(g,10);isNaN(h)?(a=a||{},a[g]=f(a[g],b,c)):(a=a||[],a[h]=f(a[h],b,c))}else a[d]=f(a[d],b,c);return a}function g(a,b,c){var d=b.match(k);if(d){var g=e(b);f(a,g,c)}else{var h=a[b];h?(Array.isArray(h)||(a[b]=[h]),a[b].push(c)):a[b]=c}return a}function h(a,b,c){return c=c.replace(/(\r)?\n/g,"\r\n"),c=encodeURIComponent(c),c=c.replace(/%20/g,"+"),a+(a?"&":"")+encodeURIComponent(b)+"="+c}var i=/^(?:submit|button|image|reset|file)$/i,j=/^(?:input|select|textarea|keygen)/i,k=/(\[[^\[\]]*\])/g;b.exports=d},{}]},{},[8]);
'use strict';

var flags = location.search.substring(1).split('&');

require('brout');

var broutHandler = function () {
  if (typeof process === 'undefined') {
    return console.log('[EXIT 1]');
  }
  var brout = process._brout;
  var log = console.log.original.bind(console);
  brout.on('out', function (msg) {
    log('[OUT]' + msg);
  });
  brout.on('err', function (msg) {
    log('[ERR]' + msg);
  });
  brout.on('exit', function (code) {
    log('[EXIT ' + (code || 0) + ']');
  });
};

var timeout = window.setTimeout.bind(window);
var defaultHandler = function () {
  console.error = function (msg) {
    console.log('[ERR]' + msg + '\n');
  };
  (function testDone() {
    var t1 = Date.now();
    timeout(function () {
      var t2 = Date.now();
      if (Math.abs(t2 - t1) < 110) {
        console.log('[TEST_EXIT]');
      }
      testDone();
    }, 100);
  }());
};

var injectBundle = function () {
  var script = document.createElement('script');
  script.src = '/js/bundle';
  if (phantomicConfig.brout) {
    script.addEventListener('load', broutHandler);
  } else {
    defaultHandler();
  }
  document.body.appendChild(script);
};

if (flags.indexOf('debug') !== -1) {
  var waitForDebugger = function () {
    var t = Date.now();

    // Oh, hi! Was waiting for you here. Press play to continue ...
    debugger;

    if (Date.now() - t > 100) {
      injectBundle();
    } else {
      setTimeout(waitForDebugger, 100);
    }
  };
  waitForDebugger();
} else {
  injectBundle();
}


setTimeout(function() {
  process.exit(1);
}, 500);


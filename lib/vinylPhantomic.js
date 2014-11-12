'use strict';

var es = require('event-stream');
var exec = require('child_process').exec;
var fs = require('fs');
var gulpConcat = require('gulp-concat');
var gulpFilter = require('gulp-filter');
var http = require('http');
var sourceMap = require('source-mapper');
var spawn = require('child_process').spawn;
var through = require('through2');
var vMap = require('vinyl-map');

var stringStream = require('./stringStream');
var inspector = 'http://localhost:9000/webkit/inspector/inspector.html?page=2';


function httpServer(port, bundles, callback) {
  var server = http.createServer(function (req, res) {
    var url = req.url;
    var p = url.indexOf('?');
    if (p !== -1) {
      url = url.substring(0, p);
    }
    if (url === '/') {
      res.writeHead(200);
      fs.createReadStream(__dirname + '/page.html').pipe(res);
    } else if (url === '/js/bundle') {
      res.writeHead(200);
      bundles.js().pipe(res);
    } else if (url === '/js/es5-shim') {
      res.writeHead(200);
      fs.createReadStream(require.resolve('es5-shim/es5-shim')).pipe(res);
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  server.timeout = 0;
  server.listen(port || 0, function (err) {
    callback(err, server);
  });
}

function launchPhantom(output, options, callback) {
  var args = [__dirname + '/runner.js'];
  if (options.debug) {
    args.unshift('--remote-debugger-autorun=yes');
    args.unshift('--remote-debugger-port=9000');
  }

  var exitCode;
  var ended = 0;
  var onEnd = function () {
    if (++ended === 3) {
      output.push(null);
      process.nextTick(function () {
        callback(exitCode);
      });
    }
  };

  var phantomjs = spawn(options.phantomjs || 'phantomjs', args, {
    env: {
      PATH: process.env.PATH,
      PHANTOMIC_PORT: options.port,
      PHANTOMIC_DEBUG: options.debug ? '1' : '',
      PHANTOMIC_BROUT: options.brout ? '1' : ''
    }
  });

  phantomjs.stdout.pipe(output);
  phantomjs.stderr.on('data', function (data) {
    if (data.toString() === 'PHANTOMIC_DEBUG') {
      var cmd;
      if (process.platform === 'darwin') {
        cmd = 'open';
      } else if (process.platform === 'win32') {
        cmd = 'start ""';
      }
      if (cmd) {
        exec(cmd + ' ' + inspector);
      } else {
        process.stderr.write('\nPlease open ' + inspector + '\n');
      }
    } else {
      output.push(data);
    }
  });

  phantomjs.stdout.on('end', onEnd);
  phantomjs.stderr.on('end', onEnd);
  phantomjs.on('error', function (err) {
    if (err.code === 'ENOENT') {
      console.log('Cannot find phantomjs. Make sure it\'s in your $PATH, or specify with --phantomjs.');
    } else {
      console.log('phantomjs failed:', err.toString());
    }
    ended = 2;
    exitCode = 1;
    onEnd();
  });

  phantomjs.on('exit', function (code) {
    exitCode = code;
    onEnd();
  });

  return output;
}

module.exports = function (options, callback) {

  var jsFilter = gulpFilter('**/*.js');
  var htmlFilter = gulpFilter('**/*.html');
  var cssFilter = gulpFilter('**/*.css');

  var input = through.obj();
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (typeof options === 'undefined' || options === null) {
    options = {};
  }
  if (typeof callback === 'undefined' || callback === null) {
    callback = function() {};
  }

  var bundles = {
    js: null,
    html: null,
    css: null
  };

  input.pipe(jsFilter)
  .pipe(gulpConcat('bundle.js'))
  .pipe(vMap(function(data, name) {
    bundles.js = stringStream(data);
  }));

  input.pipe(htmlFilter)
  .pipe(gulpConcat('bundle.html'))
  .pipe(vMap(function(data, name) {
    bundles.html = stringStream(data);
  }));

  input.pipe(cssFilter)
  .pipe(gulpConcat('bundle.css'))
  .pipe(vMap(function(data, name) {
    bundles.css = stringStream(data);
  }));

  var phantomOutput = through();

  httpServer(options.port, bundles, function (err, server) {
    if (err) {
      process.stderr.write('Server failed: ' + err.toString() + '\n');
      callback(1);
    } else {
      options.port = server.address().port;
      launchPhantom(phantomOutput, options, function (code) {
        server.close();
        callback(code);
      });
    }
  });

  return es.duplex(input, phantomOutput);
};

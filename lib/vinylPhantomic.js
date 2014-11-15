'use strict';

var _ = require('lodash');
var es = require('event-stream');
var exec = require('child_process').exec;
var fs = require('fs');
var gulpConcat = require('gulp-concat');
var gulpFilter = require('gulp-filter');
var http = require('http');
var sourceMap = require('source-mapper');
var spawn = require('child_process').spawn;
var streamqueue = require('streamqueue');
var through = require('through2');
var vMap = require('vinyl-map');
var phantomjs = require('phantomjs');
var source = require('vinyl-source-stream');

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
      streamqueue({ objectMode: true },
        fs.createReadStream(__dirname + '/pageHeader.html'),
        bundles.html(),
        stringStream("<script type=\"text/javascript\">window.phantomicConfig = " + JSON.stringify(bundles.config, null, '  ') + ";")(),
        fs.createReadStream(__dirname + '/pageScript.js'),
        stringStream("</script>")(),
        fs.createReadStream(__dirname + '/pageEnd.html')
      )
      .pipe(res);
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

  var phantomjsProcess = spawn(options.phantomjs || phantomjs.path, args, {
    env: {
      PATH: process.env.PATH,
      PHANTOMIC_PORT: options.port,
      PHANTOMIC_DEBUG: options.debug ? '1' : '',
      PHANTOMIC_BROUT: options.brout ? '1' : ''
    }
  });

  phantomjsProcess.stdout.pipe(output);
  phantomjsProcess.stderr.on('data', function (data) {
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

  phantomjsProcess.stdout.on('end', onEnd);
  phantomjsProcess.stderr.on('end', onEnd);
  phantomjsProcess.on('error', function (err) {
    if (err.code === 'ENOENT') {
      console.log('Cannot find phantomjs. Make sure it\'s in your $PATH, or specify with --phantomjs.');
    } else {
      console.log('phantomjs failed:', err.toString());
    }
    ended = 2;
    exitCode = 1;
    onEnd();
  });

  phantomjsProcess.on('exit', function (code) {
    exitCode = code;
    onEnd();
  });

  return output;
}

module.exports = function vinylPhantomic(options, callback) {
  if (typeof options === 'function') callback = options;
  if (typeof options === 'undefined' || options === null) options = {};
  if (typeof callback === 'undefined' || callback === null) callback = function() {};

  options = _.extend({
    // timeout: 500,
    brout: true
  }, options);

  var input = through.obj();
  var output = through();

  var types = _.extend({
    js: {
      filter: gulpFilter('**/*.js'),
      concat: gulpConcat('bundle.js', {newLine: ';\n'})
    },
    html: {
      filter: gulpFilter('**/*.html'),
      concat: gulpConcat('bundle.html')
    },
    css: {
      filter: gulpFilter('**/*.css'),
      concat: gulpConcat('bundle.css'),
      onComplete: function(data) {
        if(data.length >= 1)
          console.warn("vinyl-phantomic does not yet support css!");
      }
    }
  }, options.types);
  
  var bundles = {
    empty: stringStream(''),
    config: options
  };

  function startServer() {
    if (_.find(bundles, function(v, k) { return _.isNull(v); }) === null)
      return;

    httpServer(options.port, bundles, function (err, server) {
      if (err) {
        process.stderr.write('Server failed: ' + err.toString() + '\n');
        callback(1);
      } else {
        options.port = server.address().port;
        launchPhantom(output, options, function (code) {
          server.close();
          callback(code);
        });
      }
    });
  }

  function makeTypeStream(typeName, type) {
    bundles[typeName] = null;

    input.pipe(type.filter)
    .pipe(type.concat)
    .pipe(vMap(function(data, fileName) {
      if (_.isFunction(type.onComplete)) type.onComplete(data);
      bundles[typeName] = stringStream(data.toString());
    }))
    .on('end', function() {
      if (bundles[typeName] === null) bundles[typeName] = bundles.empty;
      startServer();
    });
  }

  makeTypeStream('js', types.js);
  makeTypeStream('html', types.html);
  makeTypeStream('css', types.css);


  return es.duplex(input, output);
};

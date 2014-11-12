'use strict';

var es        = require('event-stream');
var exec      = require('child_process').exec;
var fs        = require('fs');
var http      = require('http');
var sourceMap = require('source-mapper');
var spawn     = require('child_process').spawn;
var through   = require('through');
var through2   = require('through2');

var inspector = 'http://localhost:9000/webkit/inspector/inspector.html?page=2';


function httpServer(port, js, callback) {
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
      js.pipe(res);
      js.resume();
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
      output.queue(null);
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
      output.queue(data);
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
}




/*
  stringifyStream = through.obj (file, enc, cb) ->
    if not file.contents?
      cb null, file
    else if file.isBuffer()
      cb null, file.contents.toString()
    else if file.isStream()
      throw new Error "Streams aren't supported."
    else
      throw new Error "Bad stream!"

  # Stream everything to phantomJS
  phantomStream = phantomic stringifyStream, options, cb

  # Create a stream with stringifyStream as the input and phantomStream as the output.
  # https://github.com/dominictarr/event-stream#duplex-writestream-readstream
  return es.duplex stringifyStream, phantomStream
*/



module.exports = function (options, callback) {

  var input = through2.obj(function(file, enc, cb) {
    if(typeof file.contents === 'undefined')
      cb(null, file);
    else if(file.isBuffer())
      cb(null, file.contents.toString());
    else if(file.isStream())
      throw new Error("Streams aren't supported yet.");
    else
      throw new Error("Bad stream!");
  });

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

  var output = through();
  var phantomOutput = through();
  var jsStream = through();
  jsStream.pause();
  var js = '';

  input.on('data', function (d) {
    js += d;
  });

  input.on('end', function () {
    var x = sourceMap.extract(js);
    if (x.map) {
      var sm = sourceMap.stream(x.map);
      phantomOutput.pipe(sm).pipe(output);
    } else {
      phantomOutput.pipe(output);
    }
    jsStream.queue(x.js);
    jsStream.queue(null);
  });

  httpServer(options.port, jsStream, function (err, server) {
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

  return es.duplex(input, output);
};

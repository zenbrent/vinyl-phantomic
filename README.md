# Vinyl Phantomic
## Forked from [mantoni's wonderful phantomic module](https://github.com/mantoni/phantomic).

[![SemVer]](http://semver.org)
[![License]](https://github.com/zenbrent/vinyl-phantomic/blob/master/LICENSE)



- Pipes vinyl streams to [PhantomJS](http://phantomjs.org)
- Accept `.js`, `.html`, and `.css` files. (forthcoming!)
- Accept other files with custom file handlers. (forthcoming!)
- Writes script console output to stdout
- Writes script errors to stderr
- Exit code 0 if nothing threw, otherwise 1

## Install

```
npm install -g vinyl-phantomic
```

## Usage

Phantomic does not include PhantomJS itself. Make sure the `phantomjs`
executable is in your `PATH` or specify with `--phantomjs`. On windows I had
to include a copy of phantomjs.exe in the directory I was running the node
script from.

## Exit detection

By default, phantomic will report an error if anything was logged to
`console.error`. Program termination is detected by observing delays in the
event queue and the last log statement that was received.

To make exit detection more reliable, [brout][] can be used. If brout is part
of the given script, run phantomic with `--brout` to install handlers for the
`out`, `err` and `exit` events. Also make sure `process.exit(code)` is called.

## API

You can use phantomic from your own node scripts like this:

```js
var vphantomic = require('vinyl-phantomic');
var gulp = require('gulp');
var streamqueue = require('streamqueue');

// Take streams of html, css, and JS files:
streamqueue(
  gulp.src('tests/*.js'),
  gulp.src('tests/*.css'),
  gulp.src('tests/*.html')
).pipe(

// pipe them to vinyl-phantomic
  vphantomic({
    debug : false,
    port  : 0,
    brout : false,
    onComplete: function (code) {
      process.exit(code);
    }

// and watch the errors fly!
).pipe(process.stdout);
```

## Run the test cases

```sh
$ npm install
$ gulp test
```

## Compatibility

- Node 0.10 or later
- PhantomJS 1.9

## License

MIT

[SemVer]: http://img.shields.io/:semver-%E2%9C%93-brightgreen.svg
[brout]: https://github.com/mantoni/brout.js

# Vinyl Phantomic
## Forked from [mantoni's wonderful phantomic module](https://github.com/mantoni/phantomic).

[![SemVer]](http://semver.org)
[![License]](https://github.com/zenbrent/vinyl-phantomic/blob/master/LICENSE)

- Pipes vinyl streams to [PhantomJS](http://phantomjs.org)
- Accept `.js` and `.html` files. `css` and custom file handlers forthcoming.
- Writes script console output to stdout
- Writes script errors to stderr
- Exit code 0 if nothing threw, otherwise 1

## Install

```
npm install -g vinyl-phantomic
```

## Usage

Vinyl-Phantomic includes PhantomJS as a dependency. On windows I still had
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
gulp.src([
  'tests/*.js',
  'tests/*.html'
])

// pipe them to vinyl-phantomic
.pipe(vphantomic({
  debug : false,
  port  : 8080,
  brout : false
}, function (code) {
  // callback when complete
  // FIXME: this should probably just be the stream end, not a seperate callback.
  process.exit(code);
})

// and watch the errors fly!
.pipe(process.stdout);
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
[License]: http://img.shields.io/npm/l/vinyl-phantomic.svg
[brout]: https://github.com/mantoni/brout.js

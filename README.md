# Vinyl Phantomic

## Forked from [mantoni's wonderful phantomic module](https://github.com/mantoni/phantomic).

[![SemVer]](http://semver.org)
[![License]](https://github.com/zenbrent/vinyl-phantomic/blob/master/LICENSE)

- Pipes vinyl streams to [PhantomJS](http://phantomjs.org)
- Accept `.js` and `.html` files. `css` and custom file handlers forthcoming.
- Writes script console output to stdout
- Writes script errors to stderr
- Exit code 0 if nothing threw, otherwise 1

## Probably not working right now

- The command-line API

## Todo

- Bring back sourcemap support!
- Better client configuration options.
- Faster loading by caching phantomjs instances and refreshing the page, only create a new instance if it crashes.
- Custom file type handlers:
  - Possible actions will include concat in page, execute script, serve a file, and control Phantom directly.
  - Use predicate functions/streams (not just file extensions) to decide which action to take on a file.
- Continuous file loading - right now, vinyl-phantomic doesn't load anything until the input stream closes.
  - Possibly serve each vinyl file individually and load it into the page.
  - Insert html code into the document, serve script and css files with `<script>` and `<css>` tags.
  - Loading shiz via websockets?
- Run tests on other browsers, not just Phantom.
  - Actual browsers, including Chrome, Safari, and IE.
  - Zombie.js
  - Casper.js (navigation and scripting for phantomjs.) This will be very useful when you can stream commands to Phantom.
- Update some of the code and modules so it's more concise and up-to-date.
- Write some tests showing different uses of vinyl-phantomic, e.g.
  - Gulp tests
  - Browserify
  - Different testing frameworks
- Fix and test the command line API. I don't use it so I have been neglecting it... shame on me. ;\_;
- Make vinyl-phantomic be more gulp-plugin-y: https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/README.md
- More robust handling of when to exit a phantom stream. Right now it has lots of timers... I don't think there is an obvious, better solution.

Pull requests welcome!

## Install

```
npm install vinyl-phantomic
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
var phantom = require('vinyl-phantomic');
var gulp = require('gulp');

// Take streams of html, css, and JS files:
gulp.src([
  'tests/*.js',
  'tests/*.html'
])

// pipe them to vinyl-phantomic
.pipe(phantom({
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

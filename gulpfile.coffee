# Nice little guide to gulp:
# http://hmphry.com/gulp/

_ = require 'lodash'
awatch = require 'gulp-autowatch'
gbuffer = require 'gulp-buffer'
gulp = require 'gulp'
map = require 'vinyl-map'
phantomic = require './lib/phantomic'
source = require 'vinyl-source-stream'
source = require 'vinyl-source-stream'
streamqueue = require 'streamqueue'
vbuffer = require 'vinyl-buffer'
mocha = require 'gulp-mocha'


# paths
awatchPaths =
  test: ['tests/**/*', 'lib/**/*', 'bin/**/*']

# javascript
gulp.task 'coffee', ->
  # Use https://www.npmjs.org/package/watchify for cacheing
  bCache = {}
  bundler = browserify otherPaths.clientEntry,
    debug: true
    insertGlobals: false
    cache: bCache
    extensions: ['.coffee']
  bundler
  .bundle()
  .pipe source "start.js"
  .pipe vbuffer()
  .pipe gulp.dest otherPaths.clientBuild
  .pipe reload()

gulp.task 'test', ->
  gulp.src 'tests/*.coffee', { read: false }
  .pipe mocha { reporter: 'spec' }

gulp.task 'watch', ->
  awatch gulp, awatchPaths

gulp.task 'default', [ 'test', 'watch']

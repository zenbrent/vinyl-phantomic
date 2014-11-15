###
# Brout doesn't come with a compiled version... this returns a file stream with brout.
###

browserify = require 'browserify'
source = require 'vinyl-source-stream'
gulpBuffer = require 'gulp-buffer'

module.exports = ->
  browserify 'brout/lib/brout.js'
  .bundle()
  .pipe source 'brout.js'
  .pipe gulpBuffer()


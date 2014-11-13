_ = require 'lodash'
browserify = require 'browserify'
coffeeify = require 'coffeeify'

# Bundle a file and it's dependencies with browserify. Returns an output stream,
# you can use vinyl-source-stream to convert it to a file object stream.
module.exports = (filename, options = {}) ->
  opts = _.extend
    debug: false
    extensions: ['.coffee']
    ignoreMissing: false
    fullPaths: true
    basedir: __dirname
  , options

  bundler = browserify filename, opts
  .transform coffeeify
  .bundle()


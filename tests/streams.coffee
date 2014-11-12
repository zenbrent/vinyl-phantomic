###
# This is mostly just so I remember how to test files... Also to test
# bufferStream.
###

_ = require 'lodash'

{ expect } = require 'chai'

vfs = require 'vinyl-fs'
map = require 'map-stream'
vmap = require 'vinyl-map'
path = require 'path'

bufferStream = require './fixtures/bufferStream'

describe 'using vinyl-fs and testing streams', ->
  it 'should list out the files in a directory', (done) ->

    intercept = bufferStream (file) -> path.relative __dirname, file.path

    vfs.src ['tests/js/*.js']
    .pipe map intercept
    .on 'error', (err) -> done err
    .on 'end', ->
      expect intercept.data
      .to.deep.equal [
        "js/async-long.js"
        "js/async.js"
        "js/browserify.js"
        "js/debugger.js"
        "js/error.js"
        "js/hello.js"
        "js/logerror.js"
        "js/logerrors.js"
        "js/sourcemaps-console.js"
        "js/sourcemaps-uncaught.js"
      ]
      done null


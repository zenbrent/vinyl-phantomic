###
# Sending mocha tests using brout.
###

_ = require 'lodash'

{ expect } = require './fixtures/chai'

gulpBuffer = require 'gulp-buffer'
map = require 'map-stream'
vfs = require 'vinyl-fs'

bufferStream = require './fixtures/bufferStream'

vphantom = require '../lib/vinylPhantomic'

describe.skip 'piping scripts to phantomjs', ->

  it 'should take one test', (done) ->
    intercept = bufferStream() # (file) -> file.contents

    vfs.src 'tests/mocha/basic.js'
    .pipe gulpBuffer()
    .pipe vphantom brout: true
    .pipe map intercept
    .on 'error', (err) -> done err
    .on 'end', ->
      expect(intercept.data.join '').to.equal 'Oh, hi!\n'
      done null

  it 'should take many tests', (done) ->


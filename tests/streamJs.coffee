###
# Tests describing sending scripts to phantomjs. This is essentially what
# phantomic does, except vinyl-phantomic is a through-stream.
###

_ = require 'lodash'

{ expect } = require './fixtures/chai'

gulpBuffer = require 'gulp-buffer'
map = require 'map-stream'
vfs = require 'vinyl-fs'

bufferStream = require './fixtures/bufferStream'

vphantom = require '../lib/vinylPhantomic'

describe 'piping scripts to phantomic', ->
  it.skip 'should work with errors', ->

  it 'should take one script', (done) ->
    intercept = bufferStream() # (file) -> file.contents

    vfs.src 'tests/js/async.js'
    .pipe gulpBuffer()
    .pipe vphantom()
    .pipe map intercept
    .on 'error', (err) -> done err
    .on 'end', ->
      expect(intercept.toString()).to.equal 'Oh, hi!\n'
      done null

  it 'should take many scripts', (done) ->
    intercept = bufferStream()

    vfs.src 'tests/log/*.js'
    .pipe gulpBuffer()
    .pipe vphantom()
    .pipe map intercept
    .on 'error', (err) -> done err
    .on 'end', ->
      # expect(intercept.data).to.have.length 7
      expect intercept.toString()
      .to.equal [
        'hello phantom.js'
        'Whoups!'
        '1', '2', '3'
        'Oh, hi!'
        '1', '2', '3', '4', '5', ''
      ].join '\n'
      done null

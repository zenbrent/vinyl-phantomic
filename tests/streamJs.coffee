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
        'hello phantom.js\n'
        'Whoups!\n'
        '1\n2\n3\n'
        'Oh, hi!\n'
        '1\n'
        '2\n'
        '3\n'
        '4\n'
        '5\n'
      ].join ''
      done null


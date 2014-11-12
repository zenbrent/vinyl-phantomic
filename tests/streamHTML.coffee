_ = require 'lodash'

{ expect } = require 'chai'

gulpBuffer = require 'gulp-buffer'
map = require 'map-stream'
vfs = require 'vinyl-fs'

bufferStream = require './fixtures/bufferStream'

vphantom = require '../lib/vinylPhantomic'

describe 'piping html to phantomic', ->
  it 'should take one html file', (done) ->
    intercept = bufferStream()

    vfs.src [
      'tests/html/someDivs.html'
      'tests/html/checkForElements.js'
    ]
    .pipe gulpBuffer()
    .pipe vphantom()
    .pipe map intercept
    .on 'error', (err) -> done err
    .on 'end', ->
      console.log 'data: <', intercept.toString(), '>'
      expect(intercept.toString()).to.equal [
        'something'
        'div by id'
        ''
      ].join '\n'
      done null

  it 'should take many html files', (done) ->

    intercept = bufferStream()

    vfs.src [
      'tests/html/someDivs.html'
      'tests/html/someScripts.html'
      'tests/html/checkForElements.js'
    ]
    .pipe gulpBuffer()
    .pipe vphantom()
    .pipe map intercept
    .on 'error', (err) -> done err
    .on 'end', ->
      console.log 'data: <', intercept.toString(), '>'
      expect(intercept.toString()).to.equal [
        'logging in html!'
        'something'
        'div by id'
        'template'
        ''
      ].join '\n'
      done null



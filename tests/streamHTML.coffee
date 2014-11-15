_ = require 'lodash'

{ expect } = require 'chai'

map = require 'map-stream'
vfs = require 'vinyl-fs'
streamqueue = require 'streamqueue'

brout = require './fixtures/broutStream'
bufferStream = require './fixtures/bufferStream'
testFiles = require './fixtures/testFiles'

vphantom = require '../lib/vinylPhantomic'

describe 'piping html to phantomjs', ->
  it 'should take one html file', (done) ->
    testFiles.glob [
      'tests/html/someDivs.html'
      'tests/html/checkForElements.js'
    ], (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal [
        'HTML elements:'
        'something'
        'div by id'
        ''
      ].join '\n'
      done null

  it 'should take many html files', (done) ->

    # Ordering isn't preserved, use multiple vfs.src's
    testFiles.stream streamqueue({objectMode: true},
        vfs.src 'tests/html/someScripts.html'
        vfs.src 'tests/html/someDivs.html'
        # brout()
        vfs.src 'tests/html/checkForElements.js'
    ), {brout: false}, (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal [
        'logging in html!'
        'HTML elements:'
        'something'
        'div by id'
        'template'
        ''
      ].join '\n'
      done null

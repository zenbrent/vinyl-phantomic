###
# Tests describing sending scripts to phantomjs. This is essentially what
# phantomic does, except vinyl-phantomic is a through-stream.
###

_ = require 'lodash'
map = require 'map-stream'

{ expect } = require './fixtures/chai'
testFiles = require './fixtures/testFiles'


describe 'piping scripts to phantomjs', ->
  it 'should allow text logging', (done) ->
    # assert "node bin/cmd.js < test/hello.js" "hello phantom.js"

    testFiles.glob 'tests/js/hello.js', (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal 'hello phantom.js\n'
      done null

  it 'should work with async code', (done) ->
    # assert "node bin/cmd.js < test/async.js" "Oh, hi!"

    testFiles.glob 'tests/js/async.js', (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal 'Oh, hi!\n'
      done null

  it 'should work with crazy async', (done) ->
    # assert "node bin/cmd.js < test/async-long.js" "1\n2\n3\n4\n5"

    testFiles.glob 'tests/js/async-long.js', (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal '1\n2\n3\n4\n5\n'
      done null

  it 'should grab error logging', (done) ->
    # assert "node bin/cmd.js < test/logerror.js" "Whoups!"
    # FIXME: This should grab the client's exit code. OR ideally
    # there should be input, output, and error streams to / from the client.
    # or a duplex stream

    testFiles.glob 'tests/js/logerror.js', (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal 'Whoups!\n'
      done null

  it 'should grab error with multiple errors', (done) ->
    # assert "node bin/cmd.js < test/logerrors.js" "1\n2\n3"

    testFiles.glob 'tests/js/logerror.js', (err, data) ->
      expect(err).to.not.exist
      expect(data.join '').to.equal 'Whoups!\n'
      done null

  it 'should take many scripts', (done) ->
    testFiles.glob 'tests/log/*.js', (err, data) ->
      expect(err).to.not.exist
      expect _.map data, (d) -> d.toString().trim '\n'
      .to.deep.equal [
        'hello phantom.js'
        'Whoups!\n1\n2\n3'
        'Oh, hi!'
        '1', '2', '3', '4', '5'
      ]
      done null

  it.skip 'should handle errors in the streams!', ->

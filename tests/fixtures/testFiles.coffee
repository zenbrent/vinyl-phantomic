_ = require 'lodash'
bufferStream = require './bufferStream'
vfs = require 'vinyl-fs'
map = require 'map-stream'

vphantom = require '../../lib/vinylPhantomic'

stream = (vfsStream, opts, done) ->
  if typeof opts is 'function'
    done = opts
    opts = null

  intercept = bufferStream() # (file) -> file.contents

  vfsStream
  .pipe vphantom opts
  .pipe map intercept
  .on 'error', (err) -> done err
  .on 'end', ->
    done null, intercept.data

glob = (glob, opts, done)->
  if typeof opts is 'function'
    done = opts
    opts = null

  stream vfs.src(glob), opts, done


module.exports = {stream, glob}

###
# Capture the output of a stream and send the rest of the data through.
# Great to test streams. Use with map-stream.
###

_ = require 'lodash'
identity = (v) -> v

module.exports = (handler) ->
  if not handler
    handler = identity

  dataFn = (data, cb) ->
    dataFn.data.push handler data
    cb null, data

  dataFn.data = []

  return dataFn

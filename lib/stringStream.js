var fromStream = require('from2');

module.exports = function stringStream(string) {
  return fromStream.ctor(function(size, next) {
    // if there's no more content left in the string, close the stream.
    if (string.length <= 0) return this.push(null);

    // Pull in a new chunk of text, removing it from the string.
    var chunk = string.slice(0, size);
    string = string.slice(size);

    // Emit "chunk" from the stream.
    next(null, chunk);
  });
};

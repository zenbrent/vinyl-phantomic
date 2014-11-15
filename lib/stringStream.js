var fromStream = require('from2');

/**
 * Pass in a string to get a function that makes a pipe to send that string.
 */
module.exports = function stringStream(string) {
  return function() {
    var stringBuffer = string;
    return fromStream(function(size, next) {
      // if there's no more content left in the string, close the stream.
      if (stringBuffer.length <= 0) return this.push(null);

      // Pull in a new chunk of text, removing it from the string.
      var chunk = stringBuffer.slice(0, size);
      stringBuffer = stringBuffer.slice(size);

      // Emit "chunk" from the stream.
      next(null, chunk);
    });
  };
};


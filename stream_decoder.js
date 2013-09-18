var util = require('util');
var helpers = require('./helpers');
var Writable = require('stream').Writable;

function StreamDecoder(emitter) {
  Writable.apply(this);
  this.emitter = emitter;
}

util.inherits(StreamDecoder, Writable);

StreamDecoder.prototype.createCallback = function(id) {
  var self = this;
  return function() {
    var args = helpers.parseArgs(arguments);
    self.emit('reply', id, args);
  }
}

StreamDecoder.prototype.handleData = function(data) {
  var args = data.args;
  if (data.replies) {
    args = args.concat(this.createCallback(data.id));
  }
  this.emitter.emit.apply(this.emitter, args);
}

StreamDecoder.prototype._write = function(chunk, enc, next) {
  var self = this;
  var arr = chunk.toString().split("\n")
  arr.forEach(function(line) {
    line && self.handleData(JSON.parse(line.trim()));
  });
  next();
}

module.exports = StreamDecoder;

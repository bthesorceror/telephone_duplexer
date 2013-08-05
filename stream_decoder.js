var util = require('util');
var helpers = require('./helpers');

function StreamDecoder(stream, emitter) {
  this.stream = stream;
  this.emitter = emitter;
  this.setupEvents();
}

util.inherits(StreamDecoder, require('events').EventEmitter);

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

StreamDecoder.prototype.createDataParser = function() {
  var self = this;
  return function(raw_data) {
    var arr = raw_data.toString().split("\n")
    arr.forEach(function(line) {
      line && self.handleData(JSON.parse(line.trim()));
    });
  }
}

StreamDecoder.prototype.setupEvents = function() {
  this.stream.on('data', this.createDataParser());
}

module.exports = StreamDecoder;

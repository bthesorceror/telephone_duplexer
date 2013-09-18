var uuid    = require('uuid');
var helpers = require('./helpers');
var Readable = require('stream').Readable;

function StreamEncoder(emitter, options) {
  Readable.apply(this);
  options = options || {};
  this.emitter = emitter;
  this.timeout = options['timeout'] || 60000;
  this.timeouts = {};
}

(require('util')).inherits(StreamEncoder, Readable);

StreamEncoder.prototype.needsCallback = function(args) {
  var last = args[args.length -1];
  return (typeof(last) == 'function');
}

StreamEncoder.prototype.buildData = function(id, replies, args) {
  var data = {
    id: id,
    replies: replies,
    args: args
  }

  return JSON.stringify(data);
}

StreamEncoder.prototype.addTimeout = function(id, cb) {
  var self = this;
  var timeout = setTimeout(function() {
    self.emitter.removeListener(id, cb);
    self.removeTimeout(id);
  }, self.timeout);
  this.timeouts[id] = timeout;
}

StreamEncoder.prototype.removeTimeout = function(id) {
  delete this.timeouts[id];
}

StreamEncoder.prototype.close = function() {
  for (key in this.timeouts) {
    clearTimeout(this.timeouts[key]);
  };
}

StreamEncoder.prototype.send = function() {
  var id = uuid.v1();
  var replies = false;
  var args = helpers.parseArgs(arguments);

  if (this.needsCallback(args)) {
    replies = true;
    var cb = args.pop();

    this.emitter.on(id, cb);
    this.addTimeout(id, cb);
  }

  this.push(this.buildData(id, replies, args) + "\n");
}

StreamEncoder.prototype._read = function() {}

module.exports = StreamEncoder;

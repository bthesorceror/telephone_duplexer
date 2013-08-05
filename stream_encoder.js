var uuid    = require('uuid');
var helpers = require('./helpers');

function StreamEncoder(stream, emitter, options) {
  options = options || {};
  this.stream = stream;
  this.emitter = emitter;
  this.timeout = options['timeout'] || 60000;
  this.timeouts = {};
}

StreamEncoder.prototype.needsCallback = function(args) {
  var last = args.slice(-1)[0];
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
  var self = this;
  Object.keys(this.timeouts).forEach(function(key) {
    clearTimeout(self.timeouts[key]);
  });
}

StreamEncoder.prototype.emit = function() {
  var id = uuid.v1();
  var replies = false;
  var args = helpers.parseArgs(arguments);

  if (this.needsCallback(args)) {
    replies = true;
    var cb = args.splice(-1)[0];

    this.emitter.on(id, cb);
    this.addTimeout(id, cb);
  }

  this.stream.write(this.buildData(id, replies, args) + "\n");
}

module.exports = StreamEncoder;


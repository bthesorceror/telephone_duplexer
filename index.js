var NosyNeighbor = require('nosy_neighbor'),
    uuid         = require('uuid'),
    util         = require('util'),
    EventEmitter = require('events').EventEmitter;

function StreamEncoder(stream, emitter, options) {
  options = options || {};
  this.stream = stream;
  this.emitter = emitter;
  this.timeout = options['timeout'] || 60000;
}

StreamEncoder.prototype.needsCallback = function(args) {
  var last = args.slice(-1)[0];
  return (typeof(last) == 'function');
}

StreamEncoder.prototype.parseArguments = function(args) {
  return Array.prototype.slice.call(args, 0);
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
  setTimeout(function() {
    self.emitter.removeListener(id, cb);
  }, self.timeout);
}

StreamEncoder.prototype.emit = function() {
  var id = uuid.v1();
  var replies = false;
  var args = this.parseArguments(arguments);

  if (this.needsCallback(args)) {
    replies = true;
    var cb = args.splice(-1)[0];

    this.emitter.on(id, cb);
    this.addTimeout(id, cb);
  }

  this.stream.write(this.buildData(id, replies, args));
}

function StreamDecoder(stream, emitter) {
  this.stream = stream;
  this.emitter = emitter;
  this.setupEvents();
}


util.inherits(StreamDecoder, EventEmitter);

StreamDecoder.prototype.createCallback = function(id) {
  var self = this;
  return function() {
    var args = Array.prototype.slice.call(arguments, 0);
    self.emit('reply', id, args);
  }
}

StreamDecoder.prototype.createDataParser = function() {
  var self = this;
  return function(raw_data) {
    var data = JSON.parse(raw_data.toString());
    var args = data.args;
    if (data.replies) {
      args = args.concat(self.createCallback(data.id));
    }
    self.emitter.emit.apply(self.emitter, args);
  }
}

StreamDecoder.prototype.setupEvents = function() {
  this.stream.on('data', this.createDataParser());
}


function TelephoneDuplexer(stream, options) {
  options = options || {};
  this.callback_timeout = options['callback_timeout'];
  this.stream = stream;
  this.setupIncoming();
  this.setupOutgoing();
  this.delegateEvents();
}

TelephoneDuplexer.prototype.delegateEvents = function() {
  var self = this;
  ['end', 'error', 'close'].forEach(function(event) {
    self.stream.on(event, function() {
      args = Array.prototype.slice.call(arguments, 0);
      self.events().emit.apply(self.events(), [event].concat(args));
    });
  });
}

TelephoneDuplexer.prototype.close = function() {
  this.stream.end();
}

TelephoneDuplexer.prototype.onEvent = function(cb) {
  this.nosyNeighbor().onEvent(cb);
}

TelephoneDuplexer.prototype.nosyNeighbor = function() {
  this._nosy = this._nosy || (new NosyNeighbor());
  return this._nosy;
}

TelephoneDuplexer.prototype.setupOutgoing = function() {
  var opts = {
    timeout: this.callback_timeout
  };
  this.outgoing = new StreamEncoder(this.stream, this.incoming, opts);
}

TelephoneDuplexer.prototype.setupIncoming = function() {
  var self = this;
  this.incoming = new EventEmitter();
  this.nosyNeighbor().peek(this.incoming);

  var decoder = (new StreamDecoder(this.stream, this.incoming, this));

  decoder.on('reply', function(id, args) {
    self.emit.apply(self, [id].concat(args));
  });
}

TelephoneDuplexer.prototype.events = function() {
  this._events = this._events || new EventEmitter();
  return this._events;
}

TelephoneDuplexer.prototype.on = function() {
  this.incoming.on.apply(this.incoming, arguments);
}

TelephoneDuplexer.prototype.emit = function() {
  this.outgoing.emit.apply(this.outgoing, arguments);
}

TelephoneDuplexer.prototype.setMaxListeners = function(count) {
  this.incoming.setMaxListeners(count);
}

TelephoneDuplexer.prototype.removeAllListeners = function() {
  this.incoming.removeAllListeners();
}

TelephoneDuplexer.prototype.removeListener = function() {
  this.incoming.removeListener.apply(this.incoming, arguments);
}

module.exports = TelephoneDuplexer;

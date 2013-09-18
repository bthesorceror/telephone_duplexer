var NosyNeighbor = require('nosy_neighbor'),
    EventEmitter = require('events').EventEmitter,
    StreamEncoder = require('./stream_encoder'),
    StreamDecoder = require('./stream_decoder');

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
      self.outgoing.close();
      args = Array.prototype.slice.call(arguments, 0);
      self.events().emit.apply(self.events(), [event].concat(args));
    });
  });
}

TelephoneDuplexer.prototype.close = function() {
  this.outgoing.close();
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

  var decoder = new StreamDecoder(this.incoming);

  this.stream.pipe(decoder);

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

TelephoneDuplexer.prototype.once = function() {
  this.incoming.once.apply(this.incoming, arguments);
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

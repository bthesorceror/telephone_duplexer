var EventEmitter = require('events').EventEmitter,
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

TelephoneDuplexer.prototype.setupOutgoing = function() {
  var opts = {
    timeout: this.callback_timeout
  };
  this.outgoing = new StreamEncoder(this.emitter, opts);
  this.outgoing.pipe(this.stream);
}

TelephoneDuplexer.prototype.setupIncoming = function() {
  var self = this;
  this.emitter = new EventEmitter();

  var decoder = new StreamDecoder(this.emitter);

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
  this.emitter.on.apply(this.emitter, arguments);
}

TelephoneDuplexer.prototype.once = function() {
  this.emitter.once.apply(this.emitter, arguments);
}

TelephoneDuplexer.prototype.emit = function() {
  this.outgoing.send.apply(this.outgoing, arguments);
}

TelephoneDuplexer.prototype.setMaxListeners = function(count) {
  this.emitter.setMaxListeners(count);
}

TelephoneDuplexer.prototype.removeAllListeners = function() {
  this.emitter.removeAllListeners();
}

TelephoneDuplexer.prototype.removeListener = function() {
  this.emitter.removeListener.apply(this.emitter, arguments);
}

module.exports = TelephoneDuplexer;

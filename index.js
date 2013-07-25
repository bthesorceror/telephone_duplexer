var emitstream   = require('emit-stream'),
    json         = require('JSONStream'),
    NosyNeighbor = require('./nosy_neighbor'),
    EventEmitter = require('events').EventEmitter;

function TelephoneDuplexer(stream) {
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

TelephoneDuplexer.prototype.emitIncoming = function() {
  var self = this;
  return function(event, args) {
    var params = ['incoming', event].concat(args);
    self.events().emit.apply(self.events(), params);
  }
}

TelephoneDuplexer.prototype.nosyNeighbor = function() {
  this._nosy = this._nosy || (new NosyNeighbor(this.emitIncoming()));
  return this._nosy;
}

TelephoneDuplexer.prototype.setupOutgoing = function() {
  this.outgoing = new EventEmitter();
  emitstream(this.outgoing).pipe(json.stringify(false)).pipe(this.stream);
}

TelephoneDuplexer.prototype.setupIncoming = function() {
  this.incoming = emitstream(this.stream.pipe(json.parse()));
  this.nosyNeighbor().peek(this.incoming);
}

TelephoneDuplexer.prototype._handler = function(self, emit) {
  return function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('incoming');
    self.events().emit.apply(self.events(), args);
    emit.apply(self.incoming, arguments);
  }
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

var emitstream   = require('emit-stream'),
    json         = require('JSONStream'),
    EventEmitter = require('events').EventEmitter;

function TelephoneDuplexer(stream) {
  var self = this;
  this.stream = stream;
  this.setupIncoming();
  this.setupOutgoing();
}

TelephoneDuplexer.prototype.setupOutgoing = function() {
  this.outgoing = new EventEmitter();
  emitstream(this.outgoing).pipe(json.stringify(false)).pipe(this.stream);
}

TelephoneDuplexer.prototype.setupIncoming = function() {
  this.incoming = emitstream(this.stream.pipe(json.parse()));
  this.incoming.emit = this._handler(this, this.incoming.emit);
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

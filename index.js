var emitstream   = require('emit-stream'),
    json         = require('JSONStream'),
    EventEmitter = require('events').EventEmitter;

function TelephoneDuplexer(stream) {
  var self = this;
  this.stream = stream;
  this.events = new EventEmitter();
  this.incoming = emitstream(stream.pipe(json.parse([true])));
  this.outgoing = new EventEmitter();
  emitstream(this.outgoing).pipe(json.stringify()).pipe(stream);
  var emit = this.incoming.emit;

  this.incoming.emit = function() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('incoming');
    self.events.emit.apply(self.events, args);
    emit.apply(self.incoming, arguments);
  }
}

TelephoneDuplexer.prototype.on = function() {
  this.incoming.on.apply(this.incoming, arguments);
}

TelephoneDuplexer.prototype.emit = function() {
  this.outgoing.emit.apply(this.outgoing, arguments);
}

module.exports = TelephoneDuplexer;

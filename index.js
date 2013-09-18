var EventEmitter = require('events').EventEmitter,
    StreamEncoder = require('./stream_encoder'),
    StreamDecoder = require('./stream_decoder');

function TelephoneDuplexer(stream, options) {
  options = options || {};

  this.callback_timeout = options['callback_timeout'];
  this.stream           = stream;
  this.emitter          = new EventEmitter();

  this.setupIncoming();
  this.setupOutgoing();
  this.delegateEvents();
}

TelephoneDuplexer.prototype.delegateEvents = function() {
  var self = this;
  self.stream.on('error', function(err) {
    self.emitter.emit('error', err);
  });

  ['end', 'close'].forEach(function(event) {
    self.stream.on(event, function() {
      self.outgoing.close();
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

  var decoder = new StreamDecoder(this.emitter);

  this.stream.pipe(decoder);

  decoder.on('reply', function(id, args) {
    self.emit.apply(self, [id].concat(args));
  });
}

var methods = ['on', 'once', 'setMaxListeners',
               'removeAllListeners', 'removeListener'];

methods.forEach(function(method) {
  TelephoneDuplexer.prototype[method] = function() {
    this.emitter[method].apply(this.emitter, arguments);
  }
});

TelephoneDuplexer.prototype.emit = function() {
  this.outgoing.send.apply(this.outgoing, arguments);
}
module.exports = TelephoneDuplexer;

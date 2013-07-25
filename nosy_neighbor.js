function NosyNeighbor(callback) {
  this.callback = callback;
}

NosyNeighbor.prototype.peek = function(emitter) {
  var self = this,
      emit = emitter.emit;

  emitter.emit = function() {
    var args = Array.prototype.splice.call(arguments, 0),
        event = args.splice(0, 1)[0];
    self.callback(event, args);
    emit.apply(emitter, [event].concat(args));
  }
}

module.exports = NosyNeighbor;


var tape = require('tape'),
    Telephone = require('./index');

var NopStream = function () {
  this.readable = true;
  this.writable = true;
};

require('util').inherits(NopStream, require('stream'));

NopStream.prototype.write = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.emit.apply(this, ['data'].concat(args))
};

NopStream.prototype.end = function () {
  var args = Array.prototype.slice.call(arguments, 0);
  this.emit.apply(this, ['end'].concat(args))
};

(function() {
  tape("streams can chat", function(t) {
    var stream = new NopStream();

    var tele1 = new Telephone(stream),
        tele2 = new Telephone(stream),
        tele3 = new Telephone(stream);

    t.plan(3);

    tele1.on('message1', function(msg) {
      t.equal(msg, "BLAH", "Tele 1 recieved event");
    });

    tele3.on('message1', function(msg) {
      t.equal(msg, "BLAH", "Tele 3 recieved event");
    });

    tele2.emit('message1', 'BLAH');

    tele2.on('message2', function(msg) {
      t.equal(msg, "BLAH2", "Tele 2 recieved event");
    });

    tele1.emit('message2', 'BLAH2');
  });

  tape("generic 'incoming' event", function(t) {
    var stream = new NopStream();

    var tele1 = new Telephone(stream),
        tele2 = new Telephone(stream);

    t.plan(2);

    tele1.onEvent(function(event, msg) {
      t.equal(event, 'message1', 'corrent event');
      t.deepEqual(msg, ['BLAH', 'BLAH!'], 'correct arguments');
    });

    tele2.emit('message1', 'BLAH', 'BLAH!');
  });

  tape("events with callbacks", function(t) {
    var stream = new NopStream();

    var tele1 = new Telephone(stream);
    var tele3 = new Telephone(stream);
    var tele2 = new Telephone(stream, { callback_timeout: 100 });

    t.plan(3);

    tele1.on('message1', function(msg, reply) {
      t.deepEqual(msg, 'BLAH', 'correct argument');
      reply('Brandon');
    });

    tele3.on('message1', function(msg, reply) {
      reply('Brandon');
    });

    tele2.emit('message1', 'BLAH', function(name) {
      t.equal(name, 'Brandon', 'gets correct callback');
    });
  });

  tape("closing stream", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(1);

    tele1.stream.end = function() {
      t.ok(true, "'end' was called on stream")
    }

    tele1.close();
  });

  tape("setting max listeners on incoming", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(2);
    t.ok(tele1.incoming.setMaxListeners, 'function exists');

    tele1.incoming.setMaxListeners = function(count) {
      t.equal(count, 15, 'maxListeners is delegated.');
    }

    tele1.setMaxListeners(15);
  });

  tape("removing specific listener", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(3);
    t.ok(tele1.incoming.removeListener, 'function exists');

    tele1.incoming.removeListener = function(event, cb) {
      t.equal(cb, 'cb', 'correct callback');
      t.equal(event, 'event', 'correct event');
    }

    tele1.removeListener('event', 'cb');
  });

  tape("removing all listeners", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(2);
    t.ok(tele1.incoming.removeAllListeners, 'function exists');

    tele1.incoming.removeAllListeners = function() {
      t.ok(true, 'listeners removed');
    }

    tele1.removeAllListeners();
  });

  tape("delegates 'end' event", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(1);

    tele1.events().on('end', function() {
      t.ok(true, 'end event was received');
    });

    stream.emit('end');
  });

  tape("delegates 'close' event", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(1);

    tele1.events().on('close', function() {
      t.ok(true, 'close event was received');
    });

    stream.emit('close');
  });

  tape("delegates 'error' event", function(t) {
    var stream = new NopStream(),
        tele1  = new Telephone(stream);

    t.plan(1);

    tele1.events().on('error', function() {
      t.ok(true, 'error event was received');
    });

    stream.emit('error');
  });

})();

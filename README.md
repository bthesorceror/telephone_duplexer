Telephone Duplexer
==================

Bi-direction event emitter over a stream

[![Build Status](https://travis-ci.org/bthesorceror/telephone_duplexer.png?branch=master)](https://travis-ci.org/bthesorceror/telephone_duplexer)

Example
-------

```javascript

var Telephone = require('telephone_duplexer'),
    net = require('net');

var server = net.createServer(function(socket) {
  var tele = new Telephone(socket);

  tele.on('client', function(msg, reply) {
    console.log('SERVER: ' + msg);
    reply("Tyler Durden");
  });

  tele.onEvent(function(event, args) {
    console.log('EVENT: ' + event + ' MESSAGE: ' + args[0]);
  });

  setInterval(function() {
    tele.emit('server', 'I AM YOUR SERVER LUKE!');
  }, 3000);
});

server.listen(5001);

var client = net.createConnection({host: 'localhost', port: 5001}, function() {
  var tele = new Telephone(client);

  tele.on('server', function(msg) {
    console.log('CLIENT: ' + msg);
  });

  tele.onEvent(function(event, args) {
    console.log('EVENT: ' + event + ' MESSAGE: ' + args[0]);
  });

  setInterval(function() {
    tele.emit('client', 'USE THE FORCE', function(name) {
      console.log("CALLBACK: my name is " + name);
    });
  }, 3000);
});

```

Output
------

```
EVENT: client MESSAGE: USE THE FORCE
SERVER: USE THE FORCE
EVENT: server MESSAGE: I AM YOUR SERVER LUKE!
CLIENT: I AM YOUR SERVER LUKE!
EVENT: bb2c7ba0-fdec-11e2-a66f-4b3f63c4cb06 MESSAGE: Tyler Durden
CALLBACK: my name is Tyler Durden
EVENT: client MESSAGE: USE THE FORCE
SERVER: USE THE FORCE
EVENT: server MESSAGE: I AM YOUR SERVER LUKE!
CLIENT: I AM YOUR SERVER LUKE!
EVENT: bcf68d40-fdec-11e2-a66f-4b3f63c4cb06 MESSAGE: Tyler Durden
CALLBACK: my name is Tyler Durden
```

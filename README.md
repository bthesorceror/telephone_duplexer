Telephone Duplexer
==================

Bi-direction event emitter over a stream using Substack's emit-stream

[![Build Status](https://travis-ci.org/bthesorceror/telephone_duplexer.png?branch=master)](https://travis-ci.org/bthesorceror/telephone_duplexer)

Example
-------

```javascript

var Telephone = require('./index'),
    net = require('net');

var server = net.createServer(function(socket) {
  var tele = new Telephone(socket);

  tele.on('client', function(msg) {
    console.log('SERVER: ' + msg);
  });

  tele.events().on('incoming', function(event, message) {
    console.log('EVENT: ' + event + ' MESSAGE: ' + message);
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

  tele.events().on('incoming', function(event, message) {
    console.log('EVENT: ' + event + ' MESSAGE: ' + message);
  });

  setInterval(function() {
    tele.emit('client', 'USE THE FORCE');
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
EVENT: client MESSAGE: USE THE FORCE
SERVER: USE THE FORCE
EVENT: server MESSAGE: I AM YOUR SERVER LUKE!
CLIENT: I AM YOUR SERVER LUKE!
EVENT: client MESSAGE: USE THE FORCE
SERVER: USE THE FORCE
EVENT: server MESSAGE: I AM YOUR SERVER LUKE!
CLIENT: I AM YOUR SERVER LUKE!
```

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
SERVER: USE THE FORCE
CLIENT: I AM YOUR SERVER LUKE!
CALLBACK: my name is Tyler Durden
SERVER: USE THE FORCE
CLIENT: I AM YOUR SERVER LUKE!
CALLBACK: my name is Tyler Durden
```

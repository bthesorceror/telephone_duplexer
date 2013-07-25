var Telephone = require('./index'),
    net = require('net');

var server = net.createServer(function(socket) {
  var tele = new Telephone(socket);

  tele.on('client', function(msg) {
    console.log('SERVER: ' + msg);
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
    tele.emit('client', 'USE THE FORCE');
  }, 3000);
});

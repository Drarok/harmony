var http = require('http');

var Harmony = require('./src/Harmony');
var harmonyInstance = new Harmony(__dirname + '/config/collections.json');

// This function is required to ensure 'this' is valid in the instance.
var server = http.createServer(function (req, res) {
  harmonyInstance.handleRequest(req, res);
});

server.listen(8008, '127.0.0.1');
console.log('HTTP server running on http://127.0.0.1:8008');

var http = require('http');
var url = require('url');
var mysql = require('mysql');
var Server = require('./src/server');
var servers = {};

servers.mysql = new Server('mysql');

function handleRequest(req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello, world!');
    var query = url.parse(req.url, true).query;
    console.log(query);
}

http.createServer(handleRequest).listen(8008, '127.0.0.1');

console.log('HTTP server running on http://127.0.0.1:8008');

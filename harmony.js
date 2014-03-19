var http = require('http');
var url = require('url');
var mysql = require('mysql');
var MySQL = require('./src/Server/MySQL');
var SQLite = require('./src/Server/SQLite');

var collections = {
    support: {
        servers: {
            mysql: new MySQL('127.0.0.1', 'root', '', {database: 'test'}),
            sqlite: new SQLite('/tmp/harmony.sqlite3')
        },
        objects: {
            customers: ['mysql', 'sqlite']
        }
    }
};

function handleRequest(req, res) {
    var parsed = parseRequest(req);

    if (! (parsed.collection in collections)) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'not_found', reason: 'no_such_collection'}));
        return;
    }

    var collection = collections[parsed.collection];

    if (! (parsed.object in collection.objects)) {
        res.writeHead(404, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'not_found', reason: 'no_such_object'}));
        return;
    }

    var servers = collection.servers;
    var objectServers = collection.objects[parsed.object];

    res.writeHead(200, {'Content-Type': 'application/json'});

    var expected = 0;
    var actual = 0;

    var results = [];

    var callback = function (name, rows) {
        for (var i in rows) {
            var row = {_server: name};
            for (var k in rows[i]) {
                row[k] = rows[i][k];
            }
            results.push(row);
        }

        if (expected == ++actual) {
            res.end(JSON.stringify(results, null, '\t'));
        }
    };

    var callbackMaker = function (name, callback) {
        return function (rows) {
            callback(name, rows);
        };
    };

    for (var i in objectServers) {
        var name = objectServers[i];
        var server = servers[name];
        ++expected;
        server.getTable(parsed.object, parsed.query, callbackMaker(name, callback));
    }
}

function parseRequest(req) {
    var parsed = url.parse(req.url, true);
    var pathParts = parsed.pathname.split('/');

    return {
        collection: pathParts[1],
        object: pathParts[2],
        query: parsed.query
    };
}

http.createServer(handleRequest).listen(8008, '127.0.0.1');

console.log('HTTP server running on http://127.0.0.1:8008');

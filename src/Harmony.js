var url = require('url');

function Harmony(configPath) {
  this.collections = this.createCollections(configPath);
}

Harmony.prototype.handleRequest = function (req, res) {
  var parsed = this.parseRequest(req);

  if (parsed.collection === '_all_collections') {
    this.writeAllCollections(res);
    return;
  }

  if (!(parsed.collection in this.collections)) {
    this.writeNotFoundError(res, 'no_such_collection');
    return;
  }

  var collection = this.collections[parsed.collection];

  if (parsed.object === '_all_objects') {
    this.writeAllObjects(res, collection.objects);
    return;
  }

  if (!(parsed.object in collection.objects)) {
    this.writeNotFoundError(res, 'no_such_object');
    return;
  }

  this.dispatch(res, collection, parsed.object, parsed.query);
};

Harmony.prototype.dispatch = function (res, collection, object, query) {
  var expected = 0;
  var actual = 0;

  var error = false;
  var results = [];

  var callback = function (name, err, rows) {
    var result = { server: name };

    if (err) {
      error = true;
      result.error = err;
    } else {
      result.rows = rows;
    }

    results.push(result);

    if (expected == ++actual) {
      res.writeHead(error ? 500 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(results, null, '\t'));
    }
  };

  var callbackMaker = function (name, callback) {
    return function (err, rows) {
      callback(name, err, rows);
    };
  };

  var serverNames = collection.objects[object];

  for (var i in serverNames) {
    ++expected;
    var name = serverNames[i];
    var server = collection.servers[name];
    server.getTable(object, query, callbackMaker(name, callback));
  }
};

Harmony.prototype.writeAllCollections = function (res) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  var result = [];
  for (var k in this.collections) {
    result.push(k);
  }
  res.end(JSON.stringify(result));
};

Harmony.prototype.writeAllObjects = function (res, objects) {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  var result = [];
  for (var k in objects) {
    result.push(k);
  }
  res.end(JSON.stringify(result));
};

Harmony.prototype.writeNotFoundError = function (res, reason) {
  this.writeError(res, 404, 'not_found', reason);
};

Harmony.prototype.writeError = function (res, status, error, reason) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: error, reason: reason }));
};

Harmony.prototype.parseRequest = function (req) {
  var parsed = url.parse(req.url, true);
  var pathParts = parsed.pathname.split('/');

  return {
    collection: pathParts[1],
    object: pathParts[2],
    query: parsed.query
  };
};

Harmony.prototype.createCollections = function (configPath) {
  var fs = require('fs');
  var factory = require('./Server').factory;

  var config = fs.readFileSync(configPath);
  var json = JSON.parse(config);

  var validateObjects = function (collection) {
    return function (server) {
      if (!(server in collection.servers)) {
        throw 'No such server \'' + server + '\' in collection \'' + c + '\', object \'' + object + '\'.';
      }
    };
  };

  for (var c in json) {
    var collection = json[c];

    // Validate the objects' servers before we start creating Server instances.
    for (var object in collection.objects) {
      collection.objects[object].forEach(validateObjects(collection));
    }

    // Create the server objects, replacing the config object.
    for (var s in collection.servers) {
      var server = collection.servers[s];
      collection.servers[s] = factory(
        server.type, server.hostname, server.username,
        server.password, server.options
        );
    }
  }

  return json;
};

module.exports = Harmony;

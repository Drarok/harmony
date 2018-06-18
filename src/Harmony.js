const fs = require('fs');
const url = require('url');
const util = require('util');

const Server = require('./Server');

class Harmony {
  constructor(configPath) {
    this.collections = this.createCollections(configPath);
  }

  handleRequest(req, res) {
    let parsed = this.parseRequest(req);

    if (parsed.collection === '_all_collections') {
      this.writeAllCollections(res);
      return;
    }

    if (!(parsed.collection in this.collections)) {
      this.writeNotFoundError(res, 'no_such_collection');
      return;
    }

    let collection = this.collections[parsed.collection];

    if (parsed.object === '_all_objects') {
      this.writeAllObjects(res, collection.objects);
      return;
    }

    if (!(parsed.object in collection.objects)) {
      this.writeNotFoundError(res, 'no_such_object');
      return;
    }

    this.dispatch(res, collection, parsed.object, parsed.query);
  }

  dispatch(res, collection, object, query) {
    let promises = collection.objects[object].map(name => {
      return new Promise(resolve => {
        collection.servers[name].getTable(object, query, (err, rows) => {
          let result = { server: name };

          if (err) {
            result.error = err;
          } else {
            result.rows = rows;
          }

          resolve(result);
        });
      });
    });

    Promise.all(promises)
      .then(results => {
        let hasError = results.some(result => result.error);
        res.writeHead(hasError ? 500 : 200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(results, null, '  '));
      })
      .catch(err => {
        console.error(err, err.stack);

        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end();
      });
  }

  writeAllCollections(res) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    let result = [];
    for (let k in this.collections) {
      result.push(k);
    }
    res.end(JSON.stringify(result));
  }

  writeAllObjects(res, objects) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    let result = [];
    for (let k in objects) {
      result.push(k);
    }
    res.end(JSON.stringify(result));
  }

  writeNotFoundError(res, reason) {
    this.writeError(res, 404, 'not_found', reason);
  }

  writeError(res, status, error, reason) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error, reason: reason }));
  }

  parseRequest(req) {
    let parsed = url.parse(req.url, true);
    let pathParts = parsed.pathname.split('/');

    return {
      collection: pathParts[1],
      object: pathParts[2],
      query: parsed.query
    };
  }

  createCollections(configPath) {
    let config = fs.readFileSync(configPath);
    let json;

    try {
      json = JSON.parse(config);
    } catch (e) {
      throw new Error('Config file is not valid JSON.');
    }

    for (let c in json) {
      let collection = json[c];

      // Validate the objects' servers before we start creating Server instances.
      for (let object in collection.objects) {
        collection.objects[object].forEach((server) => {
          if (!(server in collection.servers)) {
            throw new Error(util.format(
              'No such server \'%s\' in collection \'%s\', object \'%s\'.',
              server,
              c,
              object
            ));
          }
        });
      }

      // Create the server objects, replacing the config object.
      for (let s in collection.servers) {
        let server = collection.servers[s];
        collection.servers[s] = Server.factory(
          server.type, server.hostname, server.username,
          server.password, server.options
        );
      }
    }

    return json;
  }
}

module.exports = Harmony;

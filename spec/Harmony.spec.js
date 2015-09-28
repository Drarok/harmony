var http = require('./helpers/http');

describe('Harmony', function () {
  var Harmony = require('../src/Harmony');

  describe('constructor', function () {
    it('should fail if config does not exist', function () {
      var error = function () {
        new Harmony('./no/such/path');
      };

      expect(error).toThrowError(Error, 'ENOENT, no such file or directory \'./no/such/path\'');
    });

    it('should fail if config isn\'t JSON', function () {
      var error = function () {
        new Harmony(__dirname + '/assets/collections_invalid.json');
      };

      expect(error).toThrowError(Error, 'Config file is not valid JSON.');
    });

    it('should fail if config is invalid', function () {
      var error = function () {
        new Harmony(__dirname + '/assets/collections_missing_server.json');
      };

      expect(error).toThrowError(Error, 'No such server \'mysql\' in collection \'collection\', object \'table\'.');
    });

    it('should succeed given a valid config', function () {
      var harmony = new Harmony(__dirname + '/assets/collections_valid.json');

      expect(Object.keys(harmony.collections)).toEqual(['collection1', 'collection2']);
    });
  });

  describe('handleRequest', function () {
    var harmony;
    var res;

    beforeEach(function () {
      harmony = new Harmony(__dirname + '/assets/collections_valid.json');
      spyOn(harmony, 'dispatch');
      expect(harmony.dispatch).not.toHaveBeenCalled();

      res = http.response();
    });

    afterEach(function () {
      expect(res.headers['Content-Type']).toEqual('application/json');
    });

    it('should output all collections', function () {
      var req = http.request('/_all_collections');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(JSON.stringify(['collection1', 'collection2']));
    });

    it('should error when collection does not exist', function () {
      var req = http.request('/invalid_collection');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual(JSON.stringify({
        error: 'not_found',
        reason: 'no_such_collection'
      }));
    });

    it('should output all objects for a collection', function () {
      var req = http.request('/collection1/_all_objects');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(JSON.stringify([
        'table1',
        'table2',
        'table3'
      ]));
    });

    it('should error when object does not exist', function () {
      var req = http.request('/collection1/invalid_object');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual(JSON.stringify({
        error: 'not_found',
        reason: 'no_such_object'
      }));
    });
  });
});

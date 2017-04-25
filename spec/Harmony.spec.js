var fs = require('fs');
var http = require('./helpers/http');

describe('Harmony', () => {
  var Harmony = require('../src/Harmony');

  beforeAll(function (done) {
    console.log('Copying sqlite3 asset');

    var asset = fs.createReadStream(__dirname + '/assets/harmony.sqlite3');
    asset.pipe(fs.createWriteStream('/tmp/harmony.sqlite3'));
    asset.on('end', () => {
      console.log('Copy complete');
      done();
    });
  });

  describe('constructor', () => {
    it('should fail if config does not exist', () => {
      var error = () => {
        new Harmony('./no/such/path');
      };

      expect(error).toThrowError(Error, /^ENOENT/);
    });

    it('should fail if config isn\'t JSON', () => {
      var error = () => {
        new Harmony(__dirname + '/assets/collections_invalid.json');
      };

      expect(error).toThrowError(Error, 'Config file is not valid JSON.');
    });

    it('should fail if config is invalid', () => {
      var error = () => {
        new Harmony(__dirname + '/assets/collections_missing_server.json');
      };

      expect(error).toThrowError(Error, 'No such server \'mysql\' in collection \'collection\', object \'table\'.');
    });

    it('should succeed given a valid config', () => {
      var harmony = new Harmony(__dirname + '/assets/collections_valid.json');

      expect(Object.keys(harmony.collections)).toEqual(['collection1', 'collection2']);
    });
  });

  describe('handleRequest', () => {
    var harmony;
    var res;

    beforeEach(() => {
      harmony = new Harmony(__dirname + '/assets/collections_valid.json');
      spyOn(harmony, 'dispatch');
      expect(harmony.dispatch).not.toHaveBeenCalled();

      res = http.response();
    });

    afterEach(() => {
      expect(res.headers && res.headers['Content-Type']).toEqual('application/json');
    });

    it('should output all collections', () => {
      var req = http.request('/_all_collections');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(JSON.stringify(['collection1', 'collection2']));
    });

    it('should error when collection does not exist', () => {
      var req = http.request('/invalid_collection');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual(JSON.stringify({
        error: 'not_found',
        reason: 'no_such_collection'
      }));
    });

    it('should output all objects for a collection', () => {
      var req = http.request('/collection1/_all_objects');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(JSON.stringify([
        'table1',
        'table2',
        'table3'
      ]));
    });

    it('should error when object does not exist', () => {
      var req = http.request('/collection1/invalid_object');
      harmony.handleRequest(req, res);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual(JSON.stringify({
        error: 'not_found',
        reason: 'no_such_object'
      }));
    });

    describe('dispatch', () => {
      it('should return data', function (done) {
        res.on('end', () => {
          var data = [
            {
              server: 'sqlite',
              rows: [
                {
                  id: 1,
                  name: 'Customer1'
                },
                {
                  id: 2,
                  name: 'Customer2'
                }
              ]
            }
          ];

          expect(res.statusCode).toBe(200);
          expect(res.body).toEqual(JSON.stringify(data, null, '  '));
          done();
        });

        harmony.dispatch.and.callThrough();

        var req = http.request('/collection1/table3');
        harmony.handleRequest(req, res);

        expect(harmony.dispatch).toHaveBeenCalled();
      });
    });
  });
});

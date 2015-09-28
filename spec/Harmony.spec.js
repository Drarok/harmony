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

  describe('other stuff', function () {
    beforeEach(function () {
      console.log('beforeEach other stuff');
    });

    it('should behave...', function () {
    });
  });
});

var Server = require('../Server.js');
var parse = require('csv-parse');

function CSV() {
  Server.apply(this, Array.prototype.slice.call(arguments));

  // Fake connection so isConnected() always returns true.
  this.connection = true;
}

CSV.prototype = new Server();

CSV.prototype._getTable = function (name, query, callback) {
  var _this = this;

  if (!(name in this.options.paths)) {
    return callback('No such table: ' + name);
  }

  var queryColumns = [];
  for (var column in query) {
    if (column[0] == '_') {
      continue;
    }

    queryColumns.push(column);
  }

  var where = this.parseQuery(query);

  var columns;
  var data = [];

  var index = 0;

  var input = require('fs').createReadStream(this.options.paths[name]);

  input
  .pipe(parse({ delimiter: this.options.delimiter || ',' }))
  .on('data', function (row) {
    ++index;

    if (columns === undefined) {
      columns = row;

      queryColumns.every(function (column) {
        if (columns.indexOf(column) === -1) {
          callback({
            message: 'Nonexistent column: ' + column
          });
          callback = false;
          input.close();
          return false;
        } else {
          return true;
        }
      });

      return;
    }

    var keyedRow = {};

    row.forEach(function (value, index) {
      keyedRow[columns[index]] = value;
    });

    if (where === false) {
      data.push(keyedRow);
    } else if (where(keyedRow)) {
      data.push(keyedRow);
    }
  })
  .on('end', function () {
    if (callback === false) {
      return;
    }

    if (query._sort) {
      var sort = _this.parseSort(query._sort);
      if (sort.direction === 'DESC') {
        sort.direction = [1, -1];
      } else {
        sort.direction = [-1, 1];
      }

      data.sort(function (a, b) {
        if (a[sort.column] == b[sort.column]) {
          return 0;
        }

        return a[sort.column] < b[sort.column] ? sort.direction[0] : sort.direction[1];
      });
    }

    if (query._limit) {
      data = data.slice(0, query._limit);
    }

    callback(undefined, data);
  });
};

CSV.prototype.parseQuery = function (query) {
  // If there's no query, don't filter at all.
  if (Object.keys(query).length === 0) {
    return false;
  }

  return function (row) {
    var match = true;

    for (var column in query) {
      // Ignore option keys.
      if (column.substr(0, 1) == '_') {
        continue;
      }

      var value = query[column];
      if (value.indexOf('~') !== 0) {
        match = row[column] == value.replace(/^\\~/, '~');
      } else {
        var clean = value.substr(1).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        clean = clean.replace(/%/g, '.*');
        var regexp = new RegExp('^' + clean + '$', 'i');
        match = Boolean(row[column].match(regexp));
      }

      if (!match) {
        break;
      }
    }

    return match;
  };
};

module.exports = CSV;

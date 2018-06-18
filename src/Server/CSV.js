const fs = require('fs');

const parse = require('csv-parse');

const Server = require('../Server.js');

class CSV extends Server {
  isConnected() {
    return true;
  }

  _getTable(name, query, callback) {
    if (!(name in this.options.paths)) {
      return callback('No such table: ' + name);
    }

    let queryColumns = [];
    for (let column in query) {
      if (column[0] == '_') {
        continue;
      }

      queryColumns.push(column);
    }

    let where = this.parseQuery(query);

    let columns;
    let data = [];

    let input = fs.createReadStream(this.options.paths[name]);

    input
    .pipe(parse({ delimiter: this.options.delimiter || ',' }))
    .on('data', row => {
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

      let keyedRow = {};

      row.forEach(function (value, index) {
        keyedRow[columns[index]] = value;
      });

      if (where === false) {
        data.push(keyedRow);
      } else if (where(keyedRow)) {
        data.push(keyedRow);
      }
    })
    .on('end', () => {
      if (callback === false) {
        return;
      }

      if (query._sort) {
        let sort = this.parseSort(query._sort);
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
  }

  parseQuery(query) {
    // If there's no query, don't filter at all.
    if (Object.keys(query).length === 0) {
      return false;
    }

    return function (row) {
      let match = true;

      for (let column in query) {
        // Ignore option keys.
        if (column.substr(0, 1) == '_') {
          continue;
        }

        let value = query[column];
        if (value.indexOf('~') !== 0) {
          match = row[column] == value.replace(/^\\~/, '~');
        } else {
          let clean = value.substr(1).replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
          clean = clean.replace(/%/g, '.*');
          let regexp = new RegExp('^' + clean + '$', 'i');
          match = Boolean(row[column].match(regexp));
        }

        if (!match) {
          break;
        }
      }

      return match;
    };
  }
}

module.exports = CSV;

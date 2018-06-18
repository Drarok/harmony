const sqlite3 = require('sqlite3');

const Server = require('../Server.js');

class SQLite extends Server {
  connect(callback) {
    this.connection = new sqlite3.Database(
      this.hostname,
      sqlite3.OPEN_READONLY,
      callback
    );
  }

  _getTable(name, query, callback) {
    let sql = 'SELECT * FROM ' + this.escapeIdentifier(name);

    let where = this.parseQuery(query);
    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    if (query._sort) {
      let sort = this.parseSort(query._sort);
      sql += ' ORDER BY ' + this.escapeIdentifier(sort.column) + ' ' + sort.direction;
    }

    if (query._limit !== undefined) {
      sql += ' LIMIT ' + parseInt(query._limit);
    }

    this.connection.all(sql, callback);
  }

  // TODO: Proper escaping.
  escapeIdentifier(id) {
    return `[${id}]`;
  }

  escapeValue(value) {
    return '\'' + value.replace(/'/g, '\'\'') + '\'';
  }
}

module.exports = SQLite;

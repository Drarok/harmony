const mysql = require('mysql');

const Server = require('../Server.js');

class MySQL extends Server {
  connect(callback) {
    let config = {
      host: this.hostname,
      user: this.username,
      password: this.password,
      database: this.options.database
    };

    this.connection = mysql.createConnection(config);
    this.connection.connect(callback);
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

    this.connection.query(sql, callback);
  }

  // TODO: Proper escaping.
  escapeIdentifier(id) {
    return '`' + id + '`';
  }

  escapeValue(value) {
    return this.connection.escape(value);
  }
}

module.exports = MySQL;

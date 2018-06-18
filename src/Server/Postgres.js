const pg = require('pg');

const Server = require('../Server.js');

class Postgres extends Server {
  connect(callback) {
    let conString = 'postgres://';

    if (this.username) {
      conString += this.username;
    }

    if (this.password) {
      conString += ':' + this.password;
    }

    if (this.username || this.password) {
      conString += '@';
    }

    conString += this.hostname + '/' + this.options.database;

    this.connection = new pg.Client(conString);
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

    this.connection.query(sql, function (err, result) {
      if (err) {
        callback(err);
        return;
      } else {
        callback(undefined, result.rows);
      }
    });
  }

  // TODO: Proper escaping.
  escapeIdentifier(id) {
    return `"${id}"`;
  }

  escapeValue(value) {
    return '\'' + value.replace(/'/g, '\'\'') + '\'';
  }
}

module.exports = Postgres;

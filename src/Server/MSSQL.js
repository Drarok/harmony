const mssql = require('mssql');

const Server = require('../Server.js');

class MSSQL extends Server {
  connect(callback) {
    let config = {
      server: this.hostname,
      user: this.username,
      password: this.password,
      database: this.options.database,
      timeout: this.options.timeout ? this.options.timeout : 10000
    };

    this.connection = new mssql.Connection(config, callback);
  }

  _getTable(name, query, callback) {
    let sql = 'SELECT ';

    if (query._limit !== undefined) {
      sql += 'TOP ' + parseInt(query._limit) + ' ';
    }

    sql += '* FROM ' + this.escapeIdentifier(name);

    let where = this.parseQuery(query);
    if (where.length) {
      sql += ' WHERE ' + where.join(' AND ');
    }

    if (query._sort) {
      let sort = this.parseSort(query._sort);
      sql += ' ORDER BY ' + this.escapeIdentifier(sort.column) + ' ' + sort.direction;
    }

    let request = this.connection.request();
    request.query(sql, callback);
  }

  // TODO: Proper escaping.
  escapeIdentifier(id) {
    return `[${id}]`;
  }

  escapeValue(value) {
    return '\'' + value.replace(/'/g, '\'\'') + '\'';
  }

}

module.exports = MSSQL;

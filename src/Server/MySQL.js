var Server = require('../Server.js');

function MySQL() {
  Server.apply(this, Array.prototype.slice.call(arguments));
}

MySQL.prototype = new Server();

MySQL.prototype.connect = function (callback) {
  var config = {
    host: this.hostname,
    user: this.username,
    password: this.password,
    database: this.options.database
  };

  this.connection = require('mysql').createConnection(config);
  this.connection.connect(callback);
};

MySQL.prototype._getTable = function (name, query, callback) {
  var sql = 'SELECT * FROM ' + this.escapeIdentifier(name);

  var where = this.parseQuery(query);
  if (where.length) {
    sql += ' WHERE ' + where.join(' AND ');
  }

  if (query._sort) {
    var sort = this.parseSort(query._sort);
    sql += ' ORDER BY ' + this.escapeIdentifier(sort.column) + ' ' + sort.direction;
  }

  if (query._limit !== undefined) {
    sql += ' LIMIT ' + parseInt(query._limit);
  }

  this.connection.query(sql, callback);
};

// TODO: Proper escaping.
MySQL.prototype.escapeIdentifier = function (id) {
  return '`' + id + '`';
};

MySQL.prototype.escapeValue = function (value) {
  return this.connection.escape(value);
};

module.exports = MySQL;

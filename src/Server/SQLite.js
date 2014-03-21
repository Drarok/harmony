var Server = require('../Server.js');

function SQLite() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

SQLite.prototype = new Server();

SQLite.prototype.connect = function(callback) {
    var sqlite3 = require('sqlite3');
    this.connection = new sqlite3.Database(
        this.hostname,
        sqlite3.OPEN_READONLY,
        callback
    );
};

SQLite.prototype._getTable = function (name, query, callback) {
    var self = this;

    var sql = 'SELECT * FROM ' + this.escapeIdentifier(name);

    var where = this.parseQuery(query);
    if (where.length) {
        sql += ' WHERE ' + where.join(' AND ');
    }

    if (query._limit !== undefined) {
        sql += ' LIMIT ' + parseInt(query._limit);
    }

    this.connection.all(sql, function (err, rows) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(rows);
    });
};

// TODO: Proper escaping.
SQLite.prototype.escapeIdentifier = function (id) {
    return '"' + id + '"';
};

SQLite.prototype.escapeValue = function (value) {
    return '\'' + value.replace(/'/g, '\'\'') + '\'';
};

module.exports = SQLite;

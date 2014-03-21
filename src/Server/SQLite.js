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

module.exports = SQLite;

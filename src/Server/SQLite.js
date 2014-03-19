var Server = require('../Server.js');

function SQLite() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

SQLite.prototype = new Server();

SQLite.prototype.connect = function() {
    var sqlite3 = require('sqlite3');
    this.connection = new sqlite3.Database(
        this.hostname,
        sqlite3.OPEN_READONLY
    );
};

SQLite.prototype.getTable = function (name, query, callback) {
    if (! this.connection) {
        this.connect();
    }

    var sql = 'SELECT * FROM customers';
    this.connection.all(sql, function (err, rows) {
        if (err) {
            this.onError(err);
            return;
        }

        callback(rows);
    });
};

module.exports = SQLite;

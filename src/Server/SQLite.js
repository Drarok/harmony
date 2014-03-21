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

SQLite.prototype.getTable = function (name, query, callback) {
    var self = this;

    if (! this.connection) {
        this.connect(function (err) {
            if (err) {
                self.onError(err);
                return;
            }

            self.getTable(name, query, callback);
        });
        return;
    }

    var sql = 'SELECT * FROM customers';
    this.connection.all(sql, function (err, rows) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(rows);
    });
};

module.exports = SQLite;

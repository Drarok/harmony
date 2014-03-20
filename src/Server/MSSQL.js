var Server = require('../Server.js');

function MSSQL() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

MSSQL.prototype = new Server();

MSSQL.prototype.connect = function(callback) {
    var config = {
        server: this.hostname,
        user: this.username,
        password: this.password,
        database: this.options.database
    };

    var mssql = require('mssql');

    this.connection = new mssql.Connection(
        config,
        callback
    );
};

MSSQL.prototype.getTable = function (name, query, callback) {
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
    this.connection.query(sql, function (err, recordset) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(recordset);
    });
};

module.exports = MSSQL;

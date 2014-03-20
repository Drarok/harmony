var Server = require('../Server.js');

function MySQL() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

MySQL.prototype = new Server();

MySQL.prototype.connect = function(callback) {
    var config = {
        host: this.hostname,
        user: this.username,
        password: this.password,
        database: this.options.database
    };

    this.connection = require('mysql').createConnection(config);
    this.connection.connect(callback);
};

MySQL.prototype.getTable = function (name, query, callback) {
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
    this.connection.query(sql, function (err, rows) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(rows);
    });
};

module.exports = MySQL;

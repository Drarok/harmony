var Server = require('../Server.js');

function MySQL() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

MySQL.prototype = new Server();

MySQL.prototype.connect = function() {
    this.connection = require('mysql').createConnection({
        host: this.hostname,
        user: this.username,
        password: this.password,
        database: this.options.database
    });
};

MySQL.prototype.getTable = function (name, query, callback) {
    if (! this.connection) {
        this.connect();
    }

    var sql = 'SELECT * FROM customers';
    this.connection.query(sql, function (err, rows, fields) {
        if (err) {
            this.onError(err);
            return;
        }

        callback(rows, fields);
    });
};

module.exports = MySQL;

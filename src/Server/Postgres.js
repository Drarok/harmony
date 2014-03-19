var Server = require('../Server.js');

function Postgres() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

Postgres.prototype = new Server();

Postgres.prototype.connect = function() {
    var pg = require('pg');

    var conString = 'postgres://' + this.username + ':' + this.password;
    conString += '@' + this.hostname + '/' + this.options.database;

    this.connection = new pg.Client(conString);
};

Postgres.prototype.getTable = function (name, query, callback) {
    if (! this.connection) {
        this.connect();
    }

    var sql = 'SELECT * FROM customers';
    this.connection.query(sql, function (err, result) {
        if (err) {
            this.onError(err);
            return;
        }

        callback(result.rows);
    });
};

module.exports = Postgres;

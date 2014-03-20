var Server = require('../Server.js');

function Postgres() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

Postgres.prototype = new Server();

Postgres.prototype.connect = function(callback) {
    var pg = require('pg');

    var conString = 'postgres://';

    if (this.username) {
        conString += this.username;
    }

    if (this.password) {
        conString += ':' + this.password;
    }

    if (this.username || this.password) {
        conString += '@';
    }

    conString += this.hostname + '/' + this.options.database;

    this.connection = new pg.Client(conString);
    this.connection.connect(callback);
};

Postgres.prototype.getTable = function (name, query, callback) {
    if (! this.connection) {
        var self = this;
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
    this.connection.query(sql, function (err, result) {
        if (err) {
            this.onError(err);
            return;
        }

        callback(result.rows);
    });
};

module.exports = Postgres;

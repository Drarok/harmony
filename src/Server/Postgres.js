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

Postgres.prototype._getTable = function (name, query, callback) {
    var self = this;

    var sql = 'SELECT * FROM ' + this.escapeIdentifier(name);

    var where = this.parseQuery(query);
    if (where.length) {
        sql += ' WHERE ' + where.join(' AND ');
    }

    console.log(sql);

    this.connection.query(sql, function (err, result) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(result.rows);
    });
};

// TODO: Proper escaping.
Postgres.prototype.escapeIdentifier = function (id) {
    return '"' + id + '"';
};

Postgres.prototype.escapeValue = function (value) {
    return '\'' + value.replace('\'', '\'\'') + '\'';
};

module.exports = Postgres;

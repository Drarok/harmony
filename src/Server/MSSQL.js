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
        database: this.options.database,
        timeout: this.options.timeout ? this.options.timeout : 10000
    };

    var mssql = require('mssql');
    this.connection = new mssql.Connection(
        config,
        callback
    );
};

MSSQL.prototype._getTable = function (name, query, callback) {
    var self = this;

    var sql = 'SELECT ';

    if (query._limit !== undefined) {
        sql += 'TOP ' + parseInt(query._limit) + ' ';
    }

    sql += '* FROM ' + this.escapeIdentifier(name);

    var where = this.parseQuery(query);
    if (where.length) {
        sql += ' WHERE ' + where.join(' AND ');
    }

    var request = this.connection.request();
    request.query(sql, function (err, recordset) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(recordset);
    });
};

// TODO: Proper escaping.
MSSQL.prototype.escapeIdentifier = function (id) {
    return '[' + id + ']';
};

MSSQL.prototype.escapeValue = function (value) {
    return '\'' + value.replace(/'/g, '\'\'') + '\'';
};

module.exports = MSSQL;

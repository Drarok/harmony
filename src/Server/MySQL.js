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

MySQL.prototype._getTable = function (name, query, callback) {
    var self = this;

    var sql = 'SELECT * FROM ' + this.escapeIdentifier(name);

    var where = this.parseQuery(query);
    if (where.length) {
        sql += ' WHERE ' + where.join(' AND ');
    }

    console.log(sql);

    this.connection.query(sql, function (err, rows) {
        if (err) {
            self.onError(err);
            return;
        }

        callback(rows);
    });
};

// TODO: Proper escaping.
MySQL.prototype.escapeIdentifier = function (id) {
    return '`' + id + '`';
};

MySQL.prototype.escapeValue = function (value) {
    return '\'' + value.replace('\'', '\\\'') + '\'';
};

module.exports = MySQL;

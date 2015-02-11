var Server = require('../Server.js');

function CouchDB() {
    Server.apply(this, Array.prototype.slice.call(arguments));
}

CouchDB.prototype = new Server();

CouchDB.prototype.connect = function(callback) {
    var config = {
        host: this.hostname,
        user: this.username,
        password: this.password,
        database: this.options.database
    };

    var url = 'http://' + this.hostname;
    if (this.port) {
        url += ':' + this.port;
    }
    var nano = require('nano')(url);
    this.connection = ;
    this.connection.connect(callback);
};

CouchDB.prototype._getTable = function (name, query, callback) {
    var self = this;

    var sql = 'SELECT * FROM ' + this.escapeIdentifier(name);

    var where = this.parseQuery(query);
    if (where.length) {
        sql += ' WHERE ' + where.join(' AND ');
    }

    if (query._sort) {
        var sort = this.parseSort(query._sort);
        sql += ' ORDER BY ' + this.escapeIdentifier(sort.column) + ' ' + sort.direction;
    }

    if (query._limit !== undefined) {
        sql += ' LIMIT ' + parseInt(query._limit);
    }

    this.connection.query(sql, callback);
};

// TODO: Proper escaping.
CouchDB.prototype.escapeIdentifier = function (id) {
    return '`' + id + '`';
};

CouchDB.prototype.escapeValue = function (value) {
    return this.connection.escape(value);
};

module.exports = CouchDB;

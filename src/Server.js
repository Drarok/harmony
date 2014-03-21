function Server(hostname, username, password, options) {
    this.hostname = hostname;
    this.username = username;
    this.password = password;
    this.options = options;
}

Server.factory = function (type, hostname, username, password, options) {
    var ServerObject = require('./Server/' + type);
    return new ServerObject(hostname, username, password, options);
};

Server.prototype.connect = function(callback) {
    throw 'You must override connect() in your Server object.';
};

Server.prototype.isConnected = function () {
    return !! this.connection;
};

Server.prototype.getTable = function (name, query, callback) {
    var self = this;

    if (! this.isConnected()) {
        this.connect(function (err) {
            if (err) {
                self.onError(err);
                return;
            }

            self._getTable(name, query, callback);
        });
    } else {
        this._getTable(name, query, callback);
    }
};

Server.prototype._getTable = function (name, query, callback) {
    throw 'You must override _getTable() in your Server object.';
};

Server.prototype.parseQuery = function (query) {
    var where = [];

    for (var column in query) {
        var value = query[column];
        var clause = this.escapeIdentifier(column);
        if (value.indexOf('*') === -1) {
            clause = ' = ';
            clause += this.escapeValue(value);
        } else {
            clause += ' LIKE ';
            clause += this.escapeValue(value.replace(/\*/g, '%'));
        }
        where.push(clause);
    }

    return where;
};

Server.prototype.onError = function (err) {
    throw err;
};

module.exports = Server;

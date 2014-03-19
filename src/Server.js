function Server(hostname, username, password, options) {
    this.hostname = hostname;
    this.username = username;
    this.password = password;
    this.options = options;
}

Server.prototype.connect = function() {
    throw 'You must override connect() in your Server object.';
};

Server.prototype.getTable = function (name, query) {
    throw 'You must override getTable() in your Server object.';
};

Server.prototype.onError = function (err) {
    throw err;
};

module.exports = Server;

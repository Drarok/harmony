class Server {
  static factory(type, hostname, username, password, options) {
    const ServerObject = require('./Server/' + type);
    return new ServerObject(hostname, username, password, options);
  }

  constructor(hostname, username, password, options) {
    this.hostname = hostname;
    this.username = username;
    this.password = password;
    this.options = options;
  }

  // eslint-disable-next-line no-unused-vars
  connect(callback) {
    throw 'You must override connect() in your Server object.';
  }

  isConnected() {
    return !!this.connection;
  }

  getTable(name, query, callback) {
    if (!this.isConnected()) {
      this.connect(err => {
        if (err) {
          throw err;
        }

        this._getTable(name, query, callback);
      });
    } else {
      this._getTable(name, query, callback);
    }
  }

  // eslint-disable-next-line no-unused-vars
  _getTable(name, query, callback) {
    throw 'You must override _getTable() in your Server object.';
  }

  parseQuery(query) {
    let where = [];

    for (let column in query) {
      // Ignore option keys.
      if (column.substr(0, 1) == '_') {
        continue;
      }

      let value = query[column];
      let clause = this.escapeIdentifier(column);
      if (value.indexOf('~') !== 0) {
        clause += ' = ';
        clause += this.escapeValue(value.replace(/^\\~/, '~'));
      } else {
        clause += ' LIKE ';
        clause += this.escapeValue(value.substr(1));
      }
      where.push(clause);
    }

    return where;
  }

  parseSort(sort) {
    let sortMatches = sort.match(/([^\[\]]+)(?:\[(asc|desc)\])?/);

    let column = sortMatches[1];
    let direction = 'ASC';

    if (sortMatches[2]) {
      direction = sortMatches[2].toUpperCase() == 'DESC' ? 'DESC' : 'ASC';
    }

    return {
      column: column,
      direction: direction
    };
  }
}

module.exports = Server;

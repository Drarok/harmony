function Response() {
  this.statusCode = null;
  this.headers = null;
  this.body = null;
  this.events = {
    'end': []
  };
}

Response.prototype.writeHead = function (statusCode, headers) {
  this.statusCode = statusCode;
  if (headers) {
    this.headers = headers;
  }
};

Response.prototype.end = function (body) {
  this.body = body;
  this.emit('end');
};

Response.prototype.on = function (name, cb) {
  if (!this.events[name]) {
    throw new Error('Invalid event name: ' + name);
  }

  this.events[name].push(cb);
};

Response.prototype.emit = function (name) {
  if (!this.events[name]) {
    throw new Error('Invalid event name: ' + name);
  }

  var _this = this;
  this.events[name].forEach(function (cb) {
    cb(_this);
  });
};

module.exports = Response;

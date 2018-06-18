class Response {
  constructor() {
    this.statusCode = null;
    this.headers = null;
    this.body = null;
    this.events = {
      'end': []
    };
  }

  writeHead(statusCode, headers) {
    this.statusCode = statusCode;
    if (headers) {
      this.headers = headers;
    }
  }

  end(body) {
    this.body = body;
    this.emit('end');
  }

  on(name, cb) {
    if (!this.events[name]) {
      throw new Error('Invalid event name: ' + name);
    }

    this.events[name].push(cb);
  }

  emit(name) {
    if (!this.events[name]) {
      throw new Error('Invalid event name: ' + name);
    }

    this.events[name].forEach(cb => {
      cb(this);
    });
  }
}

module.exports = Response;

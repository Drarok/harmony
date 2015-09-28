function Response() {
  this.statusCode = null;
  this.headers = null;
  this.body = null;
}

Response.prototype.writeHead = function (statusCode, headers) {
  this.statusCode = statusCode;
  if (headers) {
    this.headers = headers;
  }
};

Response.prototype.end = function (body) {
  this.body = body;
};

module.exports = Response;

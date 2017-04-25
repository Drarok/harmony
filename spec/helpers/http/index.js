const Request = require('./request');
const Response = require('./response');

module.exports = {
  request: function (options) {
    return new Request(options);
  },
  response: function (options) {
    return new Response(options);
  }
};

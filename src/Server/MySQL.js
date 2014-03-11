var Server = require('../Server.js');

function MySQL() {
  Server.apply(this, Array.prototype.slice.call(arguments));
}

MySQL.prototype = new Server();

module.exports = MySQL;

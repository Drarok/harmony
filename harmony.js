const cluster = require('cluster');

const HOST = process.env.HOST || '127.0.0.1';
const PORT = process.env.PORT || 8008;

if (cluster.isMaster) {
  let cpuCount = require('os').cpus().length;

  console.log(`Starting Harmony server cluster (${cpuCount})`);

  for (let i = 0; i < cpuCount; ++i) {
    cluster.fork();
  }

  console.log(`Harmony running on http://${HOST}:${PORT}/`);
} else {
  const http = require('http');

  const Harmony = require('./src/Harmony');

  var harmonyInstance = new Harmony(__dirname + '/config/collections.json');

  // This function is required to ensure 'this' is valid in the instance.
  var server = http.createServer(function (req, res) {
    harmonyInstance.handleRequest(req, res);
  });

  server.listen(PORT, HOST);
}

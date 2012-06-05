var http = require('http');
var sys = require('util');
var get = require('request');

http.createServer(function(request, response) {
  // Fetching hostname from url (http://localhost:3000/dashlane.com)
  var hostname = request.url.substr(1);

  response.writeHead(200, {'Content-Type': 'text/plain'});

  // Load the web page
  get("http://" + hostname, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      response.end("Got response: " + body);
    } else {
      response.end("Got error: " + err);
    }
  });

}).listen(3000, '127.0.0.1');

sys.puts('Web service running at localhost:3000');
var http = require('http');
var sys = require('util');
var get = require('request');
var htmlparser = require("htmlparser");

http.createServer(function(request, response) {
  // Fetching hostname from url (http://localhost:3000/dashlane.com)
  var hostname = request.url.substr(1);

  // Default favicon paths
  var icons = ['/favicon.ico'];

  // Try to load the web page
  get("http://" + hostname, function(err, res, body) {
    if (!err && res.statusCode == 200) {
      // Parse the content
      var parser = new htmlparser.Parser(new htmlparser.DefaultHandler(function (error, dom) {
        if (error)
          output(0);
        else {
          sys.puts(sys.inspect(dom));
          output(0);
        }
      })).parseComplete(body);
    } else {
      output(0);
    }
  });

  // Find a valid favicon and send it back
  var output = function(i) {
    if (icons[i]) {
      sys.puts("Trying to fetch " + icons[i]);
      // Try to load the icon
      get({url: "http://" + hostname + icons[i], encoding: null}, function(err, res, body) {
        if (!err && res.statusCode == 200) {
          // Parse the content
          response.writeHead(res.statusCode, res.headers);
          response.end(body, 'binary');
        } else {
          output(i+1);
        }
      });
    } else {
      // None favicon left :'(
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.end("404 Not Found\n");
    }
  };

}).listen(3000, '127.0.0.1');

sys.puts('Web service running at localhost:3000');
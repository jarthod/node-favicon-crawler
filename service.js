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
        if (!error)
          find_icons(dom);
        output(0);
      })).parseComplete(body);
    } else {
      output(0);
    }
  });

  // Look for link and meta tag
  var find_icons = function(dom) {
    //sys.puts(sys.inspect(dom));
    dom.forEach(function(item) {
      if (item.name == 'html' || item.name == 'head')
        find_icons(item.children);
      if (item.name == 'meta' && item.attribs.itemprop == 'image')
        icons.unshift(item.attribs.content);
      if (item.name == 'link') {
        //sys.puts(item.raw);
        if (item.attribs.rel && item.attribs.rel == 'apple-touch-icon')
          icons.unshift(item.attribs.href);
        if (item.attribs.rel && item.attribs.rel.match(/icon/i))
          icons.unshift(item.attribs.href);
      }
    })
  }

  // Find a valid favicon and send it back
  var output = function(i) {
    sys.puts("Icons: " + sys.inspect(icons));
    if (icons[i]) {
      sys.puts("Trying to fetch " + icons[i]);
      var url = icons[i];
      if (!url.match(/^http/))
        url = "http://" + hostname + url;
      // Try to load the icon
      get({url: url, encoding: null}, function(err, res, body) {
        if (!err && res.statusCode == 200) {
          sys.puts(sys.inspect(res));
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
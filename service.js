var http = require('http');
var sys = require('util');
var get = require('request');
var htmlparser = require("htmlparser");
var memcache = require('memcache');

var cache = new memcache.Client(11211);
cache.on('error', function(e) { cache = null; sys.puts("Memcache caching disabled: " + e); });
cache.on('connect', function(e) { sys.puts("Memcache caching enabled!"); });
cache.connect();

http.createServer(function(request, response) {
  // Fetching hostname from url (ex: http://localhost:3000/dashlane.com)
  var hostname = request.url.substr(1);

  var process_request = function() {
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
      dom.forEach(function(item) {
        if (item.name == 'html' || item.name == 'head')
          find_icons(item.children);
        if (item.name == 'meta' && item.attribs.itemprop == 'image')
          icons.unshift(item.attribs.content);
        if (item.name == 'link' && item.attribs.rel && item.attribs.rel.match(/icon/i))
          icons.unshift(item.attribs.href);
      })
    }

    // Find a valid favicon and send it back
    var output = function(i) {
      if (icons[i]) {
        var url = icons[i];
        if (!url.match(/^http/))
          url = "http://" + hostname + url;
        // Try to load the icon
        get({url: url, encoding: null}, function(err, res, body) {
          if (!err && res.statusCode == 200) {
            // Forward answer
            response.writeHead(res.statusCode, res.headers);
            response.end(body, 'binary');
            // Store into cache
            if (cache) {
              data = {status: res.statusCode, headers: res.headers, body: body.toString('base64')};
              cache.set('node-favicon-crawler:' + hostname, JSON.stringify(data));
            }
          } else {
            output(i+1);
          }
        });
      } else {
        // None favicon left :'(
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('404 Not found\n');
        // Store into cache
        if (cache) {
          data = {status: 404, headers: {'Content-Type': 'text/plain'}};
          cache.set('node-favicon-crawler:' + hostname, JSON.stringify(data));
        }
      }
    };
  };

  // Try from cache
  if (cache) {
    cache.get('node-favicon-crawler:' + hostname, function(error, data) {
      if (data) {
        result = JSON.parse(data);
        response.writeHead(result['status'], result['headers']);
        if (result['body']) {
          body = new Buffer(result['body'], 'base64');
          response.end(body, 'binary');
        } else {
          response.end('404 Not found\n');
        }
      } else {
        // Not cached, process!
        process_request();
      }
    });
  } else {
    process_request();
  }

}).listen(3000, '127.0.0.1');

sys.puts('Web service running at localhost:3000');
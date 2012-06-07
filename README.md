node-favicon-crawler
====================

This is my first node.js application made from scratch.
It runs as a webservice and fetches the best icon it can for a given domain.

How to use it
-------------

Launch the web service

    > node service.js

Fetch an icon for `google.com`: 

    > curl -i localhost:3000/google.com

You can try in your browser to see the actual icon better ;)

Run the test suite
------------------

A small test suite is present, using `ruby` and `rspec`.
You can run it like this:

    > rspec

You should not be running the service, it will be launched automagically.
If you do not have rspec installed:

    > gem install rspec

If you do not have gem installed: [Install it with ruby](http://www.ruby-lang.org/en/downloads/)

More
----

The service will use a local `memcached` server if present to cache the results.
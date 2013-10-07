

http://randolf.jorberg.com/2008/12/07/free-alexa-1-million-top-sites-download/
http://s3.amazonaws.com/alexa-static/top-1m.csv.zip

ebay.com mobile doesn't seem to work right

+ [ ! -f desktop/secureserver.net.html ]
+ timeout -k 1s 30s /home/bramp/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs --config=config.json netsniff.js secureserver.net
FAIL to load the address
+ [ ! -f mobile/secureserver.net.html ]
+ timeout -k 1s 30s /home/bramp/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs --config=config.json netsniff.js secureserver.net --mobile
FAIL to load the address

curl --proxy localhost:8123
# Random Notes

./summary.js | sort | uniq -c | sort -n | tail -n100

http://randolf.jorberg.com/2008/12/07/free-alexa-1-million-top-sites-download/
http://s3.amazonaws.com/alexa-static/top-1m.csv.zip

ebay.com mobile doesn't seem to work right

+ [ ! -f desktop/secureserver.net.html ]
+ timeout -k 1s 30s /home/bramp/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs --config=config.json netsniff.js secureserver.net
FAIL to load the address
+ [ ! -f mobile/secureserver.net.html ]
+ timeout -k 1s 30s /home/bramp/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs --config=config.json netsniff.js secureserver.net --mobile
FAIL to load the address

curl --proxy localhost:3128

+ [ ! -f desktop/phonearena.com.html ]
+ timeout -k 1s 30s /home/bramp/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs --config=config.json netsniff.js phonearena.com
PhantomJS has crashed. Please read the crash reporting guide at https://github.com/ariya/phantomjs/wiki/Crash-Reporting and file a bug report at https://github.com/ariya/phantomjs/issues/new with the crash dump file attached: /tmp/4d7cdb9c-6618-18aa-19b9b9f9-3ff657f0.dmp
timeout: the monitored command dumped core

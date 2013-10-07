#!/bin/sh
set -o xtrace

PHANTOM="$HOME/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs"
CMD="timeout -k 1s 30s $PHANTOM --config=config.json netsniff.js"

awk -F, '{print $2}' top-1m.csv | while read host; do
	if [ ! -f desktop/$host.html ]; then
		$CMD $host;
	fi

	if [ ! -f mobile/$host.html ]; then
		$CMD $host --mobile;
	fi

done

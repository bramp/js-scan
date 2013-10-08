#!/bin/bash
set -o xtrace

export PHANTOM="$HOME/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs"
export CMD="timeout -k 1s 30s $PHANTOM --config=config.json netsniff.js"


function fetch {
	echo "Fetching $0"

	if [ ! -f desktop/$0.html ]; then
        	$CMD $0;
	fi

	if [ ! -f mobile/$0.html ]; then
        	$CMD $0 --mobile;
	fi
}
export -f fetch

awk -F, '{print $2}' top-1m.csv | parallel -j8 --progress fetch :::: -

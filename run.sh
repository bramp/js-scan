#!/bin/bash
set -o xtrace

export PHANTOM="$HOME/vendor/phantomjs-1.9.2-linux-x86_64/bin/phantomjs"
export CMD="timeout -k 1s 45s $PHANTOM --config=config.json netsniff.js"


function fetch {
	echo "Fetching $0"
	KEY=$(echo $0 | cut -c 1-3)

	if [ ! -f desktop/$KEY/$0.html ]; then
        	$CMD $0;
	fi

	if [ ! -f mobile/$KEY/$0.html ]; then
        	$CMD $0 --mobile;
	fi
}
export -f fetch

awk -F, '{print $2}' top-1m.csv | parallel -j8 --progress fetch :::: - | tee log

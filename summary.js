#!/usr/bin/nodejs
/**
 * Scans the desktop/mobile directory and generates summarys
 * By Andrew Brampton 2013
 * npm install walk
 */

var walk  = require('walk'),
    fs    = require('fs');
    util  = require('util'),
   crypto = require('crypto'),
       _  = require('underscore'),
   guess  = require('./guesser'),
     lazy = require('lazy');

function summarise_har(json) {

	var log = json.log;
	var page = log.pages[0];

	// Stupid squid proxy shows error pages for some invalid sites
	if (page.title === "ERROR: The requested URL could not be retrieved")
		return null;

	var site = {
		name: page.id.replace(/^http:\/\//i, ''),
		title: page.title,

		dateFetched: page.startedDateTime,
		loadTime: page.pageTimings.onLoad,

		byCount: {
			html: 0,
			image: 0,
			css: 0,
			js: 0,
			other: 0,
		},

		bySize: {
			html: 0,
			image: 0,
			css: 0,
			js: 0,
			other: 0,
		},			

		js: [],
		css: [],
		//resources: [],
	};

	log.entries.forEach(function foreachEntries(entry) {
		var url = entry.response.redirectURL || entry.request.url;
		var type = entry.response.content.mimeType || '';
		var size = entry.response.content.size || 0;

        if (url.match(/(^data:.*)/i)) {
            url = url.substr(0, 64);
        }

		// for this we don't need optional parts
		type = type.replace(/;.*/, '').trim().toLowerCase();
		content = null;

		if (/^image\//.test(type)) {
			typeKey = 'image';
		} else if (type == 'application/x-javascript' || type == 'text/javascript' || type == 'application/javascript') {
			typeKey = 'js';
			content = guess.guess_js(url);
			site.js = site.js.concat(content);

		} else if (type == 'text/css') {
			typeKey = 'css';
			content = guess.guess_css(url);
			site.css = site.css.concat(content);

		} else if (type == 'text/html') {
			typeKey = 'html';

			content = guess.guess_js(url);
			site.js = site.js.concat(content);

			content = guess.guess_css(url);
			site.css = site.css.concat(content);

		} else {
			typeKey = 'other';
		}


		//if (content)
		//	console.log(url, content);

		/*
		site.resources.push({
			url: url,
			type: type,
			size: size,
			content: content,
		});
		*/

		site.byCount[typeKey] ++;
		site.bySize[typeKey] += size;
	});

	site.js  = _.uniq(site.js, function(a) { return a.name; } );
	site.css = _.uniq(site.css, function(a) { return a.name; });

	return site;
}

function summarise_har_file(filename) {
	try {
		var json = JSON.parse( fs.readFileSync(filename) );
		var site = summarise_har(json);
		if (site) {
			process.stdout.write('"' + site.name + '" : ' + JSON.stringify(site) + ",\n");;
		}
	} catch (err) {
		 process.stderr.write(err + ' while processing ' + filename + "\n");
	}
}

console.log('{');

new lazy(fs.createReadStream('top-1m.csv'))
    .lines
    .forEach(function(line){
    	var parts = String(line).split(',');
    	var host = parts[1];
    	summarise_har_file('desktop/' + host.substring(0, 3) + '/' + host + '.har' );
    });

console.log('}');

/*
// Walker options
var walker  = walk.walk('desktop', { followLinks: false });

walker.on('file', function(root, stat, next) {
	var match = /(.+)\.har$/.exec(stat.name);
	if (match) {

		// Process this file
		var host = match[1];
		var filename = root + '/' + stat.name;
		summarise_har_file(filename);
	}

	next();
});

walker.on('end', function() {

	//console.log(output);
	console.log('}');

	process.exit(code=0);
});
*/
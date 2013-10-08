#!/usr/bin/nodejs
/**
 * Scans the desktop/mobile directory and generates summarys
 * By Andrew Brampton 2013
 * npm install walk
 */

var walk  = require('walk'),
    fs    = require('fs');
    util  = require('util'),
    sh    = require('execSync');


// Escapes a shell argument, Not great but works
// http://stackoverflow.com/questions/1779858/how-do-i-escape-a-string-for-a-shell-command-in-nodejs-v8-javascript-engine
var escapeshell = function(cmd) {
	return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

function fetch_url(url) {
	var cmd = 'curl --proxy localhost:3128 ' + escapeshell(url) + ' 2>/dev/null | head | head -c1k';
	return sh.exec(cmd).stdout;
}

var js_libs_urls = {
	'google-analytics' : /google-analytics.com\/(?:urchin)|(?:ga)|(?:analytics).js$/,
	'newrelic' : /js-agent.newrelic.com\/nr-(\d+)/,
	'chartbeat' : /static.chartbeat.com\/js\/chartbeat.js$/,
	'scorecardresearch' : /b.scorecardresearch.com\/beacon.js$/,
	'jquery' : /jquery[-\/]([\d\.]+\d+).+js$/,
	'facebook-connect' : /connect.facebook.net\/en_US\/all.js$/,
	'twitter-widgets' : /platform.twitter.com\/widgets.js$/,
	'quantserve' : /\.quantserve.com\/quant.js$/,
	'google-plus' : /apis.google.com\/js\/plusone.js$/,
	'google-ads' : /google(?:adservices)|(?:syndication)|(?:tagservices).com/,
	'facebook' : /static..+.fbcdn.net\/rsrc.php/,
	'outbrain' : /widgets.outbrain.com\/outbrain.js$/,
	'kissmetrics' : /kissmetrics.com\/.+\.js$/,
	'addthis' : /ct1.addthis.com\/.+\.js$/,
	'disqus' : /disquscdn.com\/.*count.js$/,
	'linkedin' : /platform.linkedin.com\/in.js$/,
	'google-loader' : /www.google.com\/jsapi/,
	'pinterest' : /assets.pinterest.com\/js\/pinit.js$/,
	'sharethis' : /w.sharethis.com\/button\/buttons.js$/,
	'flashwrite' : /flashwrite_([\d_]+)\.js$/,
	'parsely' : /static.parsely.com\/p.js$/,
	'voicefive' : /b.voicefive.com\/.+\/rs.js$/,
	'adroll' : /\.adroll.com\/j\/roundtrip.js$/,
	'visualrevenue' : /\.visualrevenue.com\/vrs.js$/,
	'yandex-metrika' : /mc.yandex.ru\/metrika\/watch.js$/,
	'alexa' : /d31qbv1cthcecs.cloudfront.net\/atrk.js$/,
}

function guess_javascript(url) {

	// Check for simple URL matches
	for (var key in js_libs_urls) {
		if (!js_libs_urls.hasOwnProperty(key))
			continue;

		var reg = js_libs_urls[key];
		var m = reg.exec(url);
		if (m) {
			var lib = {
				library: key
			}
			if (m.length == 2) {
				lib.version = m[1];
			}
			return [lib];
		}
	};
	console.log(url);
	return;
	content = fetch_url(url);
	//console.log(content);
}

// Walker options
var walker  = walk.walk('desktop', { followLinks: false });

walker.on('file', function(root, stat, next) {
	var match = /(.+)\.har$/.exec(stat.name);
	if (match) {

		// Process this file
		var host = match[1];
		var filename = root + '/' + stat.name;

		var json = fs.readFileSync(filename);
		json = JSON.parse(json);

		var log = json.log;
		var page = log.pages[0];

		var site = {
			name: page.id,
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

			resources: [],
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

			if (/^image\//.test(type)) {
				typeKey = 'image';
			} else if (type == 'application/x-javascript' || type == 'text/javascript' || type == 'application/javascript') {
				typeKey = 'js';
				content = guess_javascript(url);
				console.log(content);
			} else if (type == 'text/html') {
				typeKey = 'html';
			} else if (type == 'text/css') {
				typeKey = 'css';
			} else {
				typeKey = 'other';
			}

			

			site.resources.push({
				url: url,
				type: type,
				size: size,
			});

			site.byCount[typeKey] ++;
			site.bySize[typeKey] += size;
		});
		//console.log(site);
	}

	next();
});

walker.on('end', function() {

	//console.log(output);

	process.exit(code=0);
});
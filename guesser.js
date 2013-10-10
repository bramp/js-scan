var fs = require('fs'),
    sh = require('execSync');

// Escapes a shell argument, Not great but works
// http://stackoverflow.com/questions/1779858/how-do-i-escape-a-string-for-a-shell-command-in-nodejs-v8-javascript-engine
var escapeshell = function(cmd) {
	return '"'+cmd.replace(/(["\s'$`\\])/g,'\\$1')+'"';
};

function md5(content) {
	return crypto.createHash('md5').update(content, 'utf8').digest('hex');
}

/*
function save_file(content, ext) {
	var hash = md5(content, 'utf8');

	fs.writeFile('test-data/' + hash + ext, content, {encoding: 'utf8', mode: 0444}, function (err) {
		if (err) throw err;
	});
}
*/

function fetch_url(url) {
	var hash = md5(url);
	var cache_file = "cache/" + hash.substring(0,3);

	try {
		fs.mkdirSync(cache_file);
	} catch (err) {} // Ignore errors

	cache_file = cache_file + "/" + hash;

	try {
		return fs.readFileSync(cache_file);
	} catch (err) {
		var cmd = 'curl --proxy localhost:3128 ' + escapeshell(url) + ' 2>/dev/null > ' + cache_file;
		sh.run(cmd);
	}

	return fs.readFileSync(cache_file);
}

var js_libs_urls = {
	'addthis' : /ct1.addthis.com\/.+\.js$/,
	'adroll' : /\.adroll.com\/j\/roundtrip.js$/,
	'alexa' : /d31qbv1cthcecs.cloudfront.net\/atrk.js$/,
	'chartbeat' : /static.chartbeat.com\/js\/chartbeat.js$/,
	'cloudflare' : /\/cdnjs.cloudflare.com\/ajax\/libs\/(\s+)\/([\d.]+\d+)\/.+\.js/,
	'disqus' : /disquscdn.com\/.*count.js$/,
	'facebook' : /static..+.fbcdn.net\/rsrc.php/,
	'facebook-connect' : /connect.facebook.net\/en_US\/all.js$/,
	'flashwrite' : /flashwrite_([\d_]+)\.js$/,
	'google-ads' : /google(?:adservices)|(?:syndication)|(?:tagservices).com/,
	'google-analytics' : /google-analytics.com\/(?:urchin)|(?:ga)|(?:analytics).js$/,
	'google-loader' : /www.google.com\/jsapi/,
	'google-plus' : /apis.google.com\/js\/plusone.js$/,
	'jquery' : /jquery[-\/]([\d.]+\d+).+js$/,
	'jquery-lightbox' : /jquery.lightbox-([\d.]+\d+).+js$/,
	'jquery-touchwipe' : /jquery.touchwipe\.([\d.]+\d+)\.js$/,
	'kissmetrics' : /kissmetrics.com\/.+\.js$/,
	'linkedin' : /platform.linkedin.com\/in.js$/,
	'newrelic' : /js-agent.newrelic.com\/nr-(\d+)/,
	'outbrain' : /widgets.outbrain.com\/outbrain.js$/,
	'parsely' : /static.parsely.com\/p.js$/,
	'pinterest' : /assets.pinterest.com\/js\/pinit.js$/,
	'quantserve' : /\.quantserve.com\/quant.js$/,
	'scorecardresearch' : /b.scorecardresearch.com\/beacon.js$/,
	'sharethis' : /w.sharethis.com\/button\/buttons.js$/,
	'twitter-widgets' : /platform.twitter.com\/widgets.js$/,
	'visualrevenue' : /\.visualrevenue.com\/vrs.js$/,
	'voicefive' : /b.voicefive.com\/.+\/rs.js$/,
	'yandex-metrika' : /mc.yandex.ru\/metrika\/watch.js$/,
};


var js_libs_content = {
	'comscore-siterecruit' : /COMSCORE.SiteRecruit.Broker.config\s*=\s*{\s*version:\s*"([\d.]+\d+)"/m,
	'comscore-beacon' : /COMSCORE.beacon=/,
	'modernizr' : /Modernizr ([\d.]+\d+)/,
	'webtrends' : /Copyright 2009-\d+ Webtrends Inc./,
	'colorbox' : /ColorBox v([\d.]+\d+)/,
	'cookie' : /Cookie plugin ([\d.]+\d+)/,
	'drupal-ajax' : /Drupal.ajax/,
	'facebook-connect' : /try {window.FB \|\| \(function\(window\)/,
	'highslide' : /Highslide JS[\s\S]{,255}Version: ([\d.]+\d+)/m,
	'jquery' : /\*!? jQuery(?: JavaScript Library)? v?([\d.]+\d+)/,
	'jquery-blockui' : /jQuery blockUI plugin[\s\S]{,255}Version ([\d.]+\d+)/m,
	'jquery-fancybox' : /fancyBox - jQuery Plugin[\s\S]{,255}version: ([\d.]+\d+)/m,
	'jquery-fancybox_req' : /fancybox_req - jQuery Plugin[\s\S]{,255}version: ([\d.]+\d+)/m,
	'jquery-idtabs' : /idTabs ~ Sean Catchpole - Version ([\d.]+\d+)/,
	'jquery-lazyload' : /Lazy Load - jQuery plugin[\s\S]{,255}\* Version:\s+([\d.]+\d+)/m,
	'jquery-migrate' : /jQuery Migrate v([\d.]+\d+)/,
	'jquery-nivo-slider' : /jQuery Nivo Slider v([\d.]+\d+)/,
	'jquery-outside-events' : /jQuery outside events - v([\d.]+\d+)/,
	'jquery-pajinate' : /jquery.pajinate.js - version ([\d.]+\d+)/,
	'jquery-smart-banner' : /jQuery Smart Banner/,
	'jquery-switchable' : /jQuery Switchable v([\d.]+\d+)/,
	'jquery-ui' : /jQuery UI (?:- v)?([\d.]+\d+(?:rc\d)?)/,
	'json3' : /JSON v(3\.\d\.\d)/,
	'mootools' : /MooTools={version:"([\d.]+\d+)"/,
	'prototype' : /Prototype\s*=\s*{\s*Version:\s*'([\d.]+\d+)'/,
	'sarissa' : /Sarissa.VERSION="([\d.]+\d+)"/,
	'scriptaculous' : /Scriptaculous\s*=\s*{\s*Version:\s*'([\d.]+\d+)'/,
	'seajs' : /seajs.version="([\d.]+\d+)"/,
	'sessioncam' : /sessionCamRecorder.initialise/,
	'sizzle' : /Sizzle CSS Selector Engine(?: - v([\d.]+\d+))?/,
	'swfobject' : /SWFObject v([\d.]+\d+)/,
	'yui' : /developer.yahoo.net\/yui\/license.txt\s+version: ([\d.]+\d+)/m,
	'zendesk' : /Zendesk Feedback Tab version ([\d.]+\d+)/,
	'zeroclipboard' : /ZeroClipboard={version:"([\d.]+\d+)"/,
 	'bootstrap-tooltip' : /bootstrap-tooltip.js v([\d.]+\d+)/,
 	'dust' : /dust.register=/,
 	'fiber' : /Fiber.min.js ([\d.]+\d+)/,
 	'gibberish-aes' : /Gibberish-AES \(c\)/,
 	'inject' : /context.Inject.version="v([\d.]+\d+)"/, // by LinkedIn
 	'jquery-cycle' : /jQuery Cycle Plugin[\s\S]{,255}Version: ([\d.]+\d+)/m,
 	'jquery-event-drag' : /jquery.event.drag/,
 	'jquery-kinslideshow' : /jquery.KinSlideshow.js[\s\S]{,255}@version ([\d.]+\d+)/m,
 	'jquery-swfobject' : /jQuery SWFObject v([\d.]+\d+)/,
 	'json2' : /json2.js\s+([\d\-]+\d+)/m,
 	'md5' : /RFC 1321.[\s\S]{,255}Version ([\d.]+\d+)/m,
 	'twitter-text-js' : /twitter-text-js ([\d.]+\d+)/,
 	'underscore' : /Underscore.js ([\d.]+\d+)/,
}


var css_libs_urls = {
	'jqueryui' : /jqueryui\/([\d.]+\d+).+css$/,
	'jquery-lightbox' : /jquery.lightbox-([\d.]+\d+).+css$/,
	'cloudflare' : /\/cdnjs.cloudflare.com\/ajax\/libs\/(\s+)\/([\d.]+\d+)\/.+\.css/,
	'google-fonts' : /\/\/fonts.googleapis.com\/css/,
}

var css_libs_content = {}

function guess(library, max) {
	max = max || Number.MAX_VALUE;

	return function(input) {
		matches = [];
		for (var key in library) {
			if (!library.hasOwnProperty(key))
				continue;

			var m = library[key].exec(input);
			if (m) {
				var lib = {
					name: key
				}
				if (m.length == 2) {
					lib.ver = m[1];
				} else if (m.length == 3) {
					lib.name = m[1];
					lib.ver = m[2];
				}
				matches.push(lib);
				if (matches.length >= max)
					break;
			}
		}

		return matches;
	}
}

/**
 * Returns an array of guessed javascript libraries at this URL
 */
var guess_js_by_url = exports.guess_js_by_url = guess(js_libs_urls, 1);
var guess_js_by_content = exports.guess_js_by_content = guess(js_libs_content);

var guess_css_by_url = exports.guess_css_by_url     = guess(css_libs_urls, 1);
var guess_css_by_content = exports.guess_css_by_content = guess(css_libs_content);

/**
 * Returns an array of guessed css libs at this URL
 */
exports.guess_js = function guess_js(url) {

	var g = guess_js_by_url(url);
	if (g.length > 0)
		return g;

	content = fetch_url(url);
	return guess_js_by_content(content);
}


/**
 * Returns an array of guessed css libs at this URL
 */
exports.guess_css = function guess_css(url) {

	var g = guess_css_by_url(url);
	if (g.length > 0)
		return g;

	content = fetch_url(url);
	return guess_css_by_content(content);
}

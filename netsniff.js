var fs = require('fs');

var DEBUG = false;

if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

function createHAR(address, title, startTime, resources) {
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        // Exclude Data URI from HAR file because
        // they aren't included in specification
        //if (request.url.match(/(^data:.*)/i)) {
        //    return;
        //}
        if (request.url.match(/(^data:.*)/i)) {
            request.url = request.url.substr(0, 64);
        }

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: startReply.redirectURL ? startReply.redirectURL : "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: 0,
                connect: 0,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: 0
            },
            pageref: address
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {
                    onLoad: page.endTime - page.startTime
                }
            }],
            entries: entries
        }
    };
}

var page = require('webpage').create(),
    system = require('system');

if (system.args.length === 1) {
    console.log('Usage: netsniff.js <some URL>');
    phantom.exit(1);
} else {

    var type = 'desktop'
    var host = system.args[1];
    var ua = 'Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.6.0';

    if (system.args.length > 2 && system.args[2] == '--mobile') {
        type = 'mobile';
        ua = 'Mozilla/5.0 (iPhone; U; CPU iPhone OS 3_0 like Mac OS X; en-us) AppleWebKit/528.18 (KHTML, like Gecko) Version/4.0 Mobile/7A341 Safari/528.16 PhantomJS/1.6.0'
    }

    page.settings.userAgent = ua;
    page.address = "http://" + host;
    page.resources = [];

    phantom.onError = function(msg, trace) {
        var msgStack = ['PHANTOM ERROR: ' + msg];
        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function(t) {
                msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function + ')' : ''));
            });
        }
        console.error(msgStack.join('\n'));
        phantom.exit(1);
    };

    page.onLoadStarted = function () {
        if (DEBUG) console.log('Load Start');

        page.lastEvent = new Date();

        // Sometimes this method gets called twice :()
        if (!page.startTime)
            page.startTime = page.lastEvent;
    };

    page.onResourceRequested = function (req) {
        page.lastEvent = new Date();
        page.resources[req.id] = {
            request: req,
            startReply: null,
            endReply: null
        };
    };

    //page.onUrlChanged = function(targetUrl) {
    //    console.log('New URL: ' + targetUrl);
    //};

    page.onResourceReceived = function (res) {
        page.lastEvent = new Date();

        if (res.stage === 'start') {
            if (DEBUG) console.log('Start ' + res.url);
            page.resources[res.id].startReply = res;
        }
        if (res.stage === 'end') {
            if (DEBUG) console.log('End ' + res.url);
            page.resources[res.id].endReply = res;
        }
    };

    page.open(page.address, function (status) {
        var har;
        if (status !== 'success') {
            console.log('FAIL to load ' + page.address + " : " + status);
            //phantom.exit(1);
        }
        //} else {
            // Page has finished loading
            page.endTime = new Date();
            if (DEBUG) console.log('Finished');

            var interval = window.setInterval(function () {
                var now = new Date();

                // Wait 2 second after last event, or a total of 30 seconds
                if ((now - page.startTime) > 30000 || (now - page.lastEvent) > 2000) {
                    window.clearInterval(interval);

                    page.title = page.evaluate(function () {
                        // TODO consider doing more complex javascript detection
                        return document.title;
                    });

                    var results_dir = type + "/" + host.substring(0, 3);

                    try {
                        fs.makeTree(results_dir);
                    } catch (err) {} // Do nothing

                    var results = results_dir + "/" + host

                    har = createHAR(page.address, page.title, page.startTime, page.resources);
                    page.render(results + '.png');
                    fs.write(results + '.har', JSON.stringify(har, undefined, 4), 'w');
                    fs.write(results + '.html', page.content, 'w');

                    phantom.exit();
                }

            }, 500);
        //}
    });
}

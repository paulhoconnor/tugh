var async       = require('async'),
    config      = require('./config'),
    logger      = config.getLogger('TestServer'),
    connect     = require('connect'),
    findandbind = require('findandbind'),
    nconf       = require('nconf'),
    util        = require('util'),
    request     = require('request');

nconf.env();
nconf.use('memory');

var Server = module.exports = function (options) {
    var proxyApp, testServerUrl,
        tughUrl = 'http://localhost:4501',
        self = this;

    options = options || {};

    // start the tugh restify app
    var app = require('../lib/app');

    /**
     * Sets up the test server and a proxy for doing any request pre-processing
     */
    this.start = function (callback) {
        // configure and start tugh server
        app.listen(config.getPort(), function (err, app) {
            if (err) {
                logger.error('Can\'t start the test server: ' +
                                                util.inspect(err, null, false));
                return callback(err);
            } else {

                // configure proxy server - hosts test middleware
                proxyApp = connect();
                proxyApp.use(function (req, res) {
                    req.pipe(request(tughUrl + req.url)).pipe(res);
                });

                var findAndBindOptions = {
                    start: 4502
                };

                // find a free port and start the proxy server
                findandbind(proxyApp, findAndBindOptions, function (err, port) {
                    self.url = 'http://localhost:' + port;
                    callback(err, self.url);
                });
            }
        });

    };

    this.stop = function (callback) {
        proxyApp.cancel();
        app.close(callback);
    };
};

if (require.main === module) {
    new Server({
        startPort: parseInt(process.argv[2], 10)
    }).start(function (err, url) {
        console.log('Test Server listening ', url);
    });
}

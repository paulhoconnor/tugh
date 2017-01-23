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

module.exports = function (options) {
    var testServerUrl,
        tughUrl = 'http://localhost:4501',
        self = this;

    options = options || {};

    // start the tugh restify app
    var app = require('../lib/app');

    /**
     * Set up the test server
     */
    this.start = function (callback) {
        // configure and start tugh server
        app.listen(config.getPort(), function (err, app) {
            if (err) {
                logger.error('Can\'t start the test server: ' +
                                                util.inspect(err, null, false));
                return callback(err);
            } else {
                self.url = 'http://localhost:4501';
                callback(err, self.url);
            }
        });

    };

    this.stop = function (callback) {
        app.close(callback);
    };
};

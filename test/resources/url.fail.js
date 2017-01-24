var config      = require('../config'),
    request     = require('request'),
    TestServer  = require('../testServer'),
    assert      = require('assert'),
    util        = require('util'),
    Dao         = require('../../lib/daos/url'),
    Url         = require('url');

var getUrl = function (path, resource) {
    var url;
    if (resource) {
        url = util.format('%s/%s/%s', config.getTestServerUrl(), path,
            resource);
    } else {
        url = util.format('%s/%s', config.getTestServerUrl(), path);
    }

    return url;
};

describe('Url resources - system errors', function () {

    var test_server;

    before(function (done) {
        test_server = new TestServer();
        test_server.start(function (err) {
            done(err);
        });
    });

    before(function (done) {
        config.getLocalDB().stop(done);
    });

    after(function (done) {
        config.getLocalDB().start(done);
    });

    after(function (done) {
        test_server.stop(done);
    });

    var test_url = 'http://foo.com/bar/baz?t=100',
        test_code;

    it('Echange url for code - should get server error', function (done) {
        request({
                url: getUrl('url'),
                method: 'POST',
                json: {url: test_url}
            }, function (err, http_resp, body) {
                assert(http_resp.statusCode, 500);
                assert(body.message, 'InternalServerError');
                done(err);
            });
    });

});

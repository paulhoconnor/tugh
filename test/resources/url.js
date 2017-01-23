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

describe('Url resources', function () {

    var test_server;

    before(function (done) {
        test_server = new TestServer();
        test_server.start(function (err, url) {
            config.setTestServerUrl(url);
            done(err);
        });
    });

    after(function (done) {
        test_server.stop(done);
    });

    var test_url = 'http://foo.com/bar/baz?t=100',
        test_code;

    it('Echange url for code - invalid body', function (done) {
        request({
                url: getUrl('url'),
                method: 'POST',
                json: true,
                body: 'foo'
            }, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 400);
                assert.equal(body.name, 'ClientError');
                assert.equal(body.message, 'Invalid request body');
                done(err);
            });
    });

    it('Echange url for code - invalid url', function (done) {
        request({
                url: getUrl('url'),
                method: 'POST',
                json: {url: 'foobar'}
            }, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 400);
                assert.equal(body.name, 'ClientError');
                assert.equal(body.message, 'Invalid URL: foobar');
                done(err);
            });
    });

    it('Echange url for code', function (done) {
        request({
                url: getUrl('url'),
                method: 'POST',
                json: {url: test_url}
            }, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 200);
                test_code = body.code;
                done(err);
            });
    });

    it('get url for code', function (done) {
        request({
                url: getUrl('url', test_code),
                method: 'GET',
                json: true
            }, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 200);
                assert.equal(body.url, test_url);
                done(err);
            });
    });

    it('try to get url for invalid code -should 404', function (done) {
        request({
                url: getUrl('url', 'foobar'),
                method: 'GET',
                json: true
            }, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 404);
                assert.equal(body.name, 'NotFoundError');
                done(err);
            });
    });

    it('code/url exchange - redirect to url', function (done) {
        request({
                url: getUrl(test_code),
                followRedirect: false}, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 303);
                assert.equal(http_resp.headers.location, test_url);
                done();
            });
    });

    it('code/url exchange - invalid code - should 404', function (done) {
        request({
                url: getUrl('foobar'),
                method: 'GET',
                json: true
            }, function (err, http_resp, body) {
                assert.equal(http_resp.statusCode, 404);
                assert.equal(body.name, 'NotFoundError');
                done(err);
            });
    });

});

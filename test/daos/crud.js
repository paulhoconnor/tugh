var config      = require('../config'),
    assert      = require('assert'),
    util        = require('util'),
    errors      = require('../../lib/utils/errors'),
    Dao         = require('../../lib/daos/url');

require('sugar').extend();

describe('dao crud ops ', function () {

    var dao,
        test_url = 'http://bar.com';

    before(function (done) {
        dao = Dao.get();
        done();
    });

    it('save with no params - expecting ClientError', function (done) {
        dao.saveUrl().then(function(url) {
            assert(false, 'should be NotFoundError');
            done();
        }, function (err) {
            assert(err instanceof errors.ClientError);
            done();
        });
    });

    it('getUrlForCode with no params - expecting ClientError', function (done) {
        dao.getUrlForCode().then(function(url) {
            assert(false, 'should be NotFoundError');
            done();
        }, function (err) {
            assert(err instanceof errors.ClientError);
            done();
        });
    });

    it('save code & url', function (done) {
        dao.saveUrl('foo', test_url).then(function() {
            done();
        }, done);
    });

    it('retrieved url for saved code', function (done) {
        dao.getUrlForCode('foo').then(function(url) {
            assert.equal(url, test_url);
            done();
        }, done);
    });

    it('query for unknown code - should return NotFoundError', function (done) {
        dao.getUrlForCode('bar').then(function(url) {
            assert(false, 'should be NotFoundError');
            done();
        }, function (err) {
            assert(err instanceof errors.NotFoundError);
            done();
        });
    });

    it('save duplicate code - should return DuplicateError', function (done) {
        dao.saveUrl('foo', test_url).then(function(url) {
            assert(false, 'should be NotFoundError');
            done();
        }, function (err) {
            assert(err instanceof errors.DuplicateError);
            done();
        });
    });
});

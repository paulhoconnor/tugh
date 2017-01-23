var config      = require('../config'),
    assert      = require('assert'),
    util        = require('util'),
    errors      = require('../../lib/utils/errors'),
    Dao         = require('../../lib/daos/url'),
    localDB     = require('../../lib/daos/url');

require('sugar').extend();

describe('dao crud ops - database down', function () {

    var dao,
        test_url = 'http://bar.com';

    before(function (done) {
        config.getLocalDB().stop(done);
    });

    after(function (done) {
        config.getLocalDB().start(done);
    });

    before(function (done) {
        dao = Dao.get();
        done();
    });

    it('save code & url - expecting InternalServerError', function (done) {
        dao.saveUrl('foo', test_url).then(function() {
            assert(false, 'no error');
            done();
        }, function(err) {
            assert(err instanceof errors.InternalServerError);
            done();
        });
    });

    it('retrieved url for saved code - expecting InternalServerError',
                                                            function (done) {
        dao.getUrlForCode('foo').then(function(url) {
            assert(false, 'no error');
            done();
        }, function(err) {
            assert(err instanceof errors.InternalServerError);
            done();
        });
    });

    it('config db - expecting InternalServerError', function (done) {
        dao.configDB().then(function(url) {
            assert(false, 'no error');
            done();
        }, function(err) {
            assert(err instanceof errors.InternalServerError);
            done();
        });
    });
});

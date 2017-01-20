var config      = require('../config'),
    assert      = require('assert'),
    util        = require('util'),
    Controller  = require('../../lib/controllers/url'),
    test_url    = 'http://foo.com/bar?baz=bim';

require('sugar').extend();

describe('url shortening control', function () {

    var codes = [],
        dao,
        controller,
        test_code;

    describe('generate unique code slugs', function () {

        before(function (done) {
            controller = Controller.get();
            done();
        });

        it('generate 1000 code slugs', function (done) {
            var i;
            for (i=0; i<1000; i++) {
                codes.push(controller.generateCode());
            }
            assert.equal(codes.length, 1000);
            done();
        });

        it('salt the test with 2 duplicate codes', function (done) {
            codes.push('foo', 'foo');
            assert.equal(codes.length, 1002);
            done();
        });

        it('make sure codes are unique strings', function (done) {
            var check_codes = codes.unique(function(code) {
                if (typeof code !== 'string') {
                    return null; // will be compacted out later
                } else {
                    return code;
                }
            }).compact(); // remove all nulls
            assert.equal(check_codes.length, codes.length-1); // one foo removed
            assert.equal(check_codes.find('foo'), 'foo');
            done();
        });

        it('save url', function (done) {
            controller.saveUrl(test_url)
            .then(function(code) {
                assert(code);
                assert(code.length >= 7);
                test_code = code;
                done();
            }, done);
        });

        it('get url', function (done) {
            controller.getUrlForCode(test_code)
            .then(function(url) {
                assert.equal(url, test_url);
                done();
            }, done);
        });
    });
});

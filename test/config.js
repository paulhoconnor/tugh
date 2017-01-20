var config      = require('../lib/config'),
    dynalite    = require('dynalite'),
    fs          = require('fs'),
    mockery     = require('mockery'),
    Dao         = require('../lib/daos/url');

module.exports = config;

var TestServer = require('./testServer'),
    testServer = new TestServer(),
    testServerUrl,
    dao;

config.getTestServerUrl = function() {
    return testServerUrl;
};

var dynaliteServer = dynalite({path: './localdb', createTableMs: 1});

before(function (done) {
    mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false
    });
    mockery.registerMock('../config', config);
    mockery.registerMock('./config', config);
    done();
});

before(function (done) {
    dynaliteServer.listen(4567, function (err) {
        if (!err) {
            config.setDBUrl('http://localhost:4567');
        }
        done(err);
    });
});

before(function (done) {
    dao = Dao.get();
    dao.createDB().then(function () {
        done();
    }, done);
});

after(function (done) {
    dao.deleteLocalDB().then(function () {
        done();
    }, done);
});

before(function (done) {
    testServer.start(function (err, url) {
        testServerUrl = url;
        done(err);
    });
});

after(function (done) {
    testServer.stop(done);
});

after(function (done) {
    dynaliteServer.close(done);
});

after(function (done) {
    mockery.disable();
    done();
});

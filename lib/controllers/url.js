var config              = require('../config'),
    UrlDao              = require('../daos/url'),
    async               = require('async'),
    util                = require('util'),
    cuid                = require('cuid'),
    Q                   = require('q');

var UrlController = function (options) {
    var logger      = config.getLogger('controllers/url'),
        urlDao;

    if (options && options.user && false) { //TBC
        urlDao   = UrlDao.getForUser(options.user);
    } else {
        urlDao   = UrlDao.get();
    }

    this.generateCode = function () {
        return cuid.slug();
    };

    this.saveUrl = function (url) {

        logger.info('saveUrl');
        logger.debug('.....' + url);

        var code = this.generateCode();
        return urlDao.saveUrl(code, url).then(function () {
            return Q.resolve(code);
        });
    };

    // pass through but maybe later we will add instrumentation, etc.
    this.getUrlForCode = function (code) {

        logger.info('getUrlForCode');
        logger.debug('.....' + code);

        return urlDao.getUrlForCode(code);
    };
};

module.exports = {

    get: function (options) {
        return new UrlController(options);
    }
};

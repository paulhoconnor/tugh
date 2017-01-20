var config                      = require('../config'),
    Dao                         = require('../daos/url'),
    Controller                  = require('../controllers/url'),
    httpHandle                  = require('../utils/httpHandler'),
    async                       = require('async'),
    validators                  = require('../utils/validators'),
    util                        = require('util'),
    controllerMiddleware        = require('../middleware/controller')
                                                                (Controller),
    daoMiddleware               = require('../middleware/dao')(Dao);

module.exports = function (app) {

    var logger = config.getLogger('url api');

    app.use(daoMiddleware);
    app.use(controllerMiddleware);

    app.get('/url/:code', function (req, res) {
        /**
         * Retreives a url associated with a code
         * in a json object - no redirect
         *  Params
         *      - code : string
         */
        logger.info('GET /url/' + req.params.code);
        req.controller.getUrlForCode(decodeURIComponent(req.params.code))
        .then(function (result) {
            logger.info('GET /url/' + req.params.code + ' done');
            logger.debug('.....result = ' + util.inspect(result, false, null));
            httpHandle(res)(null, {url: result});
        }, function (err) {
            logger.error('GET /url/' + req.params.code + ' error: ' +
                                                util.inspect(err, false, null));
            httpHandle(res)(err);
        }).done();
    });

    app.get('/:code', function (req, res) {
        /**
         * Retreives a url associated with a code in the url
         *  Params
         *      - code : string
         */
        logger.info('GET /' + req.params.code);
        req.controller.getUrlForCode(decodeURIComponent(req.params.code))
        .then(function (result) {
            logger.info('GET /' + req.params.code + ' done');
            logger.debug('.....result = ' + util.inspect(result, false, null));
            httpHandle(res, 303)(null, result);
        }, function (err) {
            logger.error('GET /' + req.params.code + ' error: ' +
                                                util.inspect(err, false, null));
            httpHandle(res)(err);
        }).done();
    });

    app.post('/url', function (req, res) {
        /**
         *  Exchange a long url for a code which will resolve it later
         *  Params
         *      - body
         *           {'longUrl': <url>}
         *  Returns
         *           {'code': <code>}
         */

        logger.info('POST /url');
        async.waterfall([
            validators.validateRequestBody.bind(null, req.body),
            validators.validateUrl.bind(null, req.body.url),
            function (callback) {
                req.controller.saveUrl(req.body.url)
                .then(function (result) {
                    logger.info('POST /url done');
                    logger.debug('.....result = ' + util.inspect(result, false,
                                                                        null));
                    callback(null, result);
                }, function (err) {
                    logger.error('POST /api error: ' + util.inspect(err, false,
                                                                        null));
                    callback(err);
                }).done();
            }
        ], function (err, result) {
                httpHandle(res)(err, {code: result});
            });
    });
};

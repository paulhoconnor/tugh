var config      = require('../config'),
    util        = require('util'),
    fs          = require('fs'),
    rmdir       = require('rmdir'),
    exec        = require('child_process').exec,
    logger      = config.getLogger('daos/url'),
    dbConn      = require('../dbs/dynamo/connect'),
    errors      = require('../utils/errors'),
    Q           = require('q'),
    db;

require('sugar');

var UrlDao = function (options) {

    db = dbConn();

    this.saveUrl = function (code, url) {
        logger.info('saveUrl: saving ' + code);
        logger.debug('.....' + url);

        var deferred = Q.defer();

        if (!code || !url) {
            deferred.reject(new errors.ClientError());

            return deferred.promise;
        }

        var params = {
                        TableName: config.getTableName(),
                        Item: {
                            code: {S: code},
                            url: {S: url}
                        },
                        ConditionExpression: 'attribute_not_exists(code)'
                    };

        db.putItem(params, function (err, result) {
            logger.debug('.....result = ' + util.inspect(result, false, null));
            if (err) {
                logger.error(util.inspect(err, false, null));
                if (err.code &&
                            err.code === 'ConditionalCheckFailedException') {
                    err = new errors.DuplicateError();
                } else {
                    err = new errors.InternalServerError(util.inspect(
                                                            err, false, null));
                }
                return deferred.reject(err);
            }
            deferred.resolve(result);
        });

        return deferred.promise;
    };

    this.getUrlForCode = function (code) {
        logger.info('getUrlForCode: querying url for code ' + code);

        if (!code) {
            let deferred = Q.defer();
            deferred.reject(new errors.ClientError());

            return deferred.promise;
        }

        var params = {
                    TableName: config.getTableName(),
                    KeyConditionExpression: 'code = :c ',
                    ExpressionAttributeValues: {
                        ':c': {S: code},
                    },
                };

        var deferred = Q.defer();
        db.query(params, function (err, result) {
            logger.debug('.....result = ' + util.inspect(result, false, null));
            if (err) {
                logger.error(util.inspect(err, false, null));
                err = new errors.InternalServerError(
                                                util.inspect(err, false, null));
                return deferred.reject(err);
            } else if (result.Items.length === 0) {
                return deferred.reject(new errors.NotFoundError());
            }
            deferred.resolve(result.Items[0].url.S);
        });

        return deferred.promise;
    };

    this.configDB = function () {
        logger.info('configDB');

        var deferred = Q.defer();
        dbConn.configDB(function(err, result) {
            if (err) {
                return deferred.reject(new errors.InternalServerError(
                                            util.inspect(err, false, null)));
            }
            deferred.resolve(result);
        });

        return deferred.promise;
    };

    this.deleteLocalDB = function () {
        logger.info('deleteLocalDB');

        var deferred = Q.defer();
        rmdir(__dirname + '/../../localdb', function(err) {
            if (err) {
                return deferred.reject(err);
            }
            deferred.resolve();
        });
        return deferred.promise;
    };
};

module.exports = {
    get: function (options) {
        return new UrlDao(options);
    }
};

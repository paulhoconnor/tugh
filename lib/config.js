var nconf       = require('nconf'),
	log4js      = require('log4js'),
	util		= require('util'),
	Q           = require('q'),
	region 		= 'us-west-2',
	PORT		= 8081,
	tableName  	= 'shorts',
	dbUrl 		= 'https://dynamodb.' + region + '.amazonaws.com';



// setup nconf
nconf.overrides().argv().env({separator: '.'}).defaults();
this.get = nconf.get.bind(nconf);

var setDBUrl = module.exports.setDBUrl = function (url) {
	dbUrl = url;
};

var getDBUrl = module.exports.getDBUrl = function () {
	return dbUrl;
};

var isLocalDB = module.exports.isLocalDB = function() {
		if (nconf.get('localMode')) {
			return true;
		} else {
			return false;
		}
};

var getDBRegion = module.exports.getDBRegion = function () {
	return region;
};

var getPort = module.exports.getPort = function() {
	return PORT;
};

var getTableName = module.exports.getTableName = function() {
	return tableName;
};

var getLogger = module.exports.getLogger = function (name) {
        /**
         * Returns a log4js logger.  The level will be set from configuration
         * properties.  If loggers.{name}.level is not found, then
         * loggers.*.level will be used.  If that is not available, no level
         * will be set.
         */
        var logger = log4js.getLogger(name);

        var level = this.get(util.format('loggers:%s:level', name)) ||
            this.get('loggers:*:level');

        if (level) {
            logger.setLevel(level);
        }

        return logger;
    };

var config  = require('./lib/config'),
    async   = require('async'),
    logger  = config.getLogger('index');

async.waterfall([
    /*function (callback) {
        require('mongoose').connect(config.getMongoUrl(), callback);
    },*/
    function (callback) {
        require('./app').listen(config.getPort(), callback);
    }
], function (err) {
    if (err) {
        logger.error('application failed to initialize correctly');
        logger.error(err);
        return process.exit(1);
    }
    logger.info('listening on port %s', config.getPort());
});

var config      = require('./lib/config'),
    async       = require('async'),
    nconf       = require('nconf'),
    util        = require('util'),
    connect     = require('./lib/dbs/dynamo/connect'),
    logger      = config.getLogger('index');

nconf.overrides().argv().env({separator: '.'}).defaults();

async.series([
    function(callback) {
        if (nconf.get('localMode')) { // use local database
            var LocalDB = require('./lib/dbs/dynamo/localdb'),
                localdb = new LocalDB();
            localdb.start(function (err, res) {
                if (err) {
                    return callback(err);
                }
                connect.configDB(callback);
            });
        } else {
            callback();
        }
    },
    function (callback) {
        require('./lib/app').listen(config.getPort(), callback);
    }
], function (err) {
    if (err) {
        logger.error('tugh failed to initialize correctly: ' +
                                            util.inspect(err, null, false));
    } else {
        console.log('tugh listening on port %s', config.getPort());
    }
});

var config      = require('./lib/config'),
    async       = require('async'),
    nconf       = require('nconf'),
    util        = require('util'),
    LocalDB     = require('./lib/dbs/dynamo/localdb'),
    connect     = require('./lib/dbs/dynamo/connect'),
    logger      = config.getLogger('index');

nconf.overrides().argv().env({separator: '.'}).defaults();

console.log(111111111);
async.series([
    function(callback) {
        console.log(22222222222222222222222);
        if (nconf.get('localMode')) { // use local database
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
        console.log(33333333333333333333);
        callback();
        //app.listen(config.getPort(), callback);
    }
], function (err) {
    if (err) {
        logger.error('tugh failed to initialize correctly: ' +
                                            util.inspect(err, null, false));
    } else {
        console.log('tugh NOT listening on port %s', config.getPort());
    }
});

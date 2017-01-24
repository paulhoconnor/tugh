var config 		= require('../../config'),
	logger 		= config.getLogger('dynamoDB config'),
	fs 			= require('fs'),
	util 		= require('util'),
	nconf 		= require('nconf'),
 	AWS 		= require('aws-sdk'),
	dynamo;

function configDynamo() {
	var opts = {region: config.getDBRegion(),
					maxRetries: 2,
					httpOptions: { timeout: 500 }
				};

	if (config.isLocalDB()) {
		opts.accessKeyId = 'myKeyId';
        opts.secretAccessKey = 'secretKey'	;
	}

    AWS.config.update(opts);

    var dynamo = new AWS.DynamoDB({endpoint:
                        new AWS.Endpoint(config.getDBUrl())});

	logger.info('DynamoDB connection configured...');
	return dynamo;
}

module.exports = function() {
	return dynamo || (dynamo = configDynamo());
};

var descTugh =  module.exports.descTugh = function(callback) {
	logger.info('descTugh');
	configDynamo().describeTable({TableName: 'shorts'}, function (err, res) {
		callback(err, res);
	});
};

var createTugh = module.exports.createTugh = function(callback) {
	logger.info('createTugh');
    var tableSchema = JSON.parse(fs.readFileSync(__dirname + '/table.json',
																	'utf-8'));
	var db = configDynamo();
    db.createTable(tableSchema, function(err, res) {
        if (err) {
            callback(err);
        }
        db.waitFor('tableExists', {TableName: config.getTableName()},
                                                    function(err, data) {
			callback(err, data);

        });
    });
};

var configDB = module.exports.configDB = function(callback) {
	logger.info('configDB');
	descTugh(function(err, result) {
		if (err && err.code === 'ResourceNotFoundException') {
			createTugh(callback);
		} else if (err) {
			logger.error('error describing table: ' +
												util.inspect(err, null, false));
			callback(err);
		} else {
			logger.info('DB already exists');
			callback();
		}
	});

};

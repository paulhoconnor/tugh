var config 		= require('../../config'),
	logger 		= config.getLogger('dynamoDB config'),
	fs 			= require('fs'),
	util 		= require('util'),
 	AWS 		= require('aws-sdk');

function getAccessKeyId() {
		return process.env.AWSDYNAMOACCESS || 'myKeyId';
}

function getSecretAccessKey() {
		return process.env.AWSDYNAMOSECRET || 'secretKey';
}

function configDynamo() {
    AWS.config.update({ accessKeyId: getAccessKeyId(),
                    secretAccessKey: getSecretAccessKey(),
					region: config.getDBRegion(),
					maxRetries: 2,
					httpOptions: { timeout: 500 }});
    var dynamo = new AWS.DynamoDB({endpoint:
                        new AWS.Endpoint(config.getDBUrl())});

	return dynamo;
}

module.exports = function() {
	logger.info('DynamoDB connection configured...');

	return configDynamo();
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

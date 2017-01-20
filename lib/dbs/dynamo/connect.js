var config 		= require('../../config'),
	logger 		= config.getLogger('dynamoDB config'),
 	AWS 		= require('aws-sdk');

module.exports = function() {
    AWS.config.update({ accessKeyId: 'myKeyId',
                    secretAccessKey: 'secretKey',
					region: config.getDBRegion() });
    var dynamo = new AWS.DynamoDB({endpoint:
                        new AWS.Endpoint(config.getDBUrl())});

	logger.info('DynamoDB connection configured...');

	return dynamo;
};

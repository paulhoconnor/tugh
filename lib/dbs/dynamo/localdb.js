var config 		= require('../../config'),
	logger 		= config.getLogger('dynamoDB config'),
 	dynalite 	= require('dynalite');

module.exports = function() {
	var dynaliteServer = dynalite({path: './localdb', createTableMs: 1});

	this.start = function(callback) {
		logger.info('Using local Dynalite DB');
	    dynaliteServer.listen(4567, function (err) {
		    if (!err) {
		        config.setDBUrl('http://localhost:4567');
		    }
	    	callback(err);
	    });
	};

	this.stop = function(callback) {
		dynaliteServer.close(callback);
	};
};

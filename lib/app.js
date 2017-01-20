var config				= require('./config'),
	restify				= require('restify'),
	fs					= require('fs');

require('sugar');

var app = module.exports = restify.createServer();

app.use(restify.bodyParser({ mapParams: true }));
app.use(restify.queryParser());

require('./resources/url')(app);

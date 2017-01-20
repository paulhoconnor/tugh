var errors      = require('./errors'),
    validUrl    = require('valid-url');

var validateRequestBody = module.exports.validateRequestBody =
    function (body, callback) {
        if (typeof body !== 'object') {
            return callback(new errors.ClientError('Invalid request body'));
        }

        callback();
    };

var validateUrl = module.exports.validateUrl = function (url, callback) {
    console.log('url = ' + url);
    if (!validUrl.isWebUri(url)) {
        console.log('bad url');
        var err = new errors.ClientError('Invalid URL: ' + url);
        console.log(err);
        return callback(new errors.ClientError('Invalid URL: ' + url));
    }

    callback();
};

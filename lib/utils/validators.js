var errors      = require('./errors'),
    validUrl    = require('valid-url');

var validateRequestBody = module.exports.validateRequestBody = function (body,
                                                                    callback) {
        if (!body || typeof body !== 'object') {
            return callback(new errors.ClientError('Invalid request body'));
        }
        callback(null, body);
    };

// validates that a properly formed url field is present in the input object
var validateUrl = module.exports.validateUrl = function (obj, callback) {
    var url;
    if (!obj || !(url = obj.url) || !validUrl.isWebUri(obj.url)) {
        return callback(new errors.ClientError('Invalid URL: ' + url));
    }

    callback();
};

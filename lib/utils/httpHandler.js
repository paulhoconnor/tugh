var util    = require('util'),
    errors  = require('./errors');

var httpify = function (err) {

    if (err instanceof errors.NotFoundError) {
        err.statusCode = 404;
    } else if (err instanceof errors.ClientError) {
        err.statusCode = 400;
    } else if (err instanceof errors.DuplicateError) { // should never happen
        err.statusCode = 500; // ---------------------------------^
    } else if (err instanceof errors.InternalServerError) {
        err.statusCode = 500;
    } else if (!err.statusCode) {
        err.statusCode = 400;
    }

    return err;
};

var handle = module.exports = function (res, successCode) {
    /**
     * HTTP error handler.
     *
     * Facility for catching errors from internal components such as daos and
     * controllers. Converts error objects to http versions if sending
     * to response.
     *
     * Variants:
     *
     *   handle(res)                         - sends error or result to
     *                                         response object (200 is success
     *                                         code)
     *
     *   handle(res, 201)                    - sends error or result to
     *                                         response object, using 201 on
     *                                         success
     *
     *   handle(res).on('error', callback)   - does not send errors to response,
     *                                         instead triggers `callback`
     *   handle(res).on('success', callback) - does not send result to
     *                                         response, instead triggers
     *                                         `callback`
     *
     * Example:
     *
     *   app.get('/', function (req, res) {
     *       // executes `get` on dao, calling `errCallback` on error and
     *       // `successCallback` on success
     *
     *       dao.get(handle(res).on('error',   errCallback)
     *                          .on('success', successCallback));
     *   });
     */
    var fun = function () {
        var args = [].slice.call(arguments);
        var error = arguments[0];

        if (error) {
            if (fun.error) {
                return fun.error.apply(error);
            }

            var err = httpify(error);
            // Avoid restify's automatic handling of Error types
            return res.send(err.statusCode,
                {
                    message: err.message,
                    type: err.type,
                    name: err.name,
                    source: err.source && {
                        message: err.source.message
                    }
                }
            );
        }

        if (fun.success) {
            return fun.success.apply(null, args.slice(1));
        }

        res.send(successCode || 200, arguments[1]);
    };

    fun.on = function (topic, callback) {
        fun[topic] = callback;
        return fun;
    };

    return fun;
};

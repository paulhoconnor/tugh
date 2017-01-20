/**
 * Adds a dao instance to the request.
 *      - If options.supportUser is set then DaoFactory.getForUser will be
 *          called with the tentantId from req.params (if present)
 * @param DaoFactory Must implement the get method and optionally the getUser
 *          method for user and/or tenant processing (**TBC**)
 * @param options
 *           supportUser - enable super user capabilities
 */
module.exports = function (DaoFactory, options) {
    options = options || {};
    return function (req, res, next) {
        if (options.supportUser && req.params.user) { //TBC
            req.dao = DaoFactory.getForUser(req.user);
        } else {
            req.dao = DaoFactory.get();
        }
        next();
    };
};

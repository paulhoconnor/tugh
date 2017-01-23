module.exports = function (controller, options) {
    options = options || {};
    return function (req, res, next) {
        if (options.supportUser && req.params.user) { //TBC
            //req.controller = controller.getForUser(req.user);
        } else {
            req.controller = controller.get();
        }

        next();
    };
};

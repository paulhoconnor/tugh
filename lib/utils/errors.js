class BaseError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}

class ClientError extends BaseError {}
module.exports.ClientError = ClientError;

class NotFoundError extends BaseError {}
module.exports.NotFoundError = NotFoundError;

class DuplicateError extends BaseError {}
module.exports.DuplicateError = DuplicateError;

class InternalServerError extends BaseError {}
module.exports.InternalServerError = InternalServerError;

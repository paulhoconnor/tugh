class BaseError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = (new Error(message)).stack
    }
  }
}

module.exports.ClientError = class ClientError extends BaseError {}
module.exports.NotFoundError = class NotFoundError extends BaseError {}
module.exports.DuplicateError = class DuplicateError extends BaseError {}
module.exports.InternalServerError = class InternalServerError extends BaseError {}

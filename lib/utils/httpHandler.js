const errors = require('./errors')

const httpify = function (err) {
  if (err instanceof errors.NotFoundError) {
    err.statusCode = 404
  } else if (err instanceof errors.ClientError) {
    err.statusCode = 400
  } else if (err instanceof errors.DuplicateError) { // should never happen
    err.statusCode = 500 // ---------------------------------^
  } else if (err instanceof errors.InternalServerError) {
    err.statusCode = 500
  } else if (!err.statusCode) {
    err.statusCode = 400
  }

  return err
}

module.exports = function (res, successCode) {
  const fun = function () {
    var args = [].slice.call(arguments)
    var error = arguments[0]

    if (error) {
      if (fun.error) {
        return fun.error.apply(error)
      }

      const err = httpify(error)
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
      )
    }

    if (fun.success) {
      return fun.success.apply(null, args.slice(1))
    }

    res.send(successCode || 200, arguments[1])
  }

  fun.on = function (topic, callback) {
    fun[topic] = callback
    return fun
  }

  return fun
}

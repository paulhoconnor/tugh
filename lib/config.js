const nconf = require('nconf')
const log4js = require('log4js')
const util = require('util')
const region = 'us-west-2'
const PORT = 8081
const tableName = 'shorts'
let dbUrl = 'https://dynamodb.' + region + '.amazonaws.com'

// setup nconf
nconf.overrides().argv().env({separator: '.'}).defaults()
this.get = nconf.get.bind(nconf)

module.exports.setDBUrl = function (url) {
  dbUrl = url
}

module.exports.getDBUrl = function () {
  return dbUrl
}

module.exports.isLocalDB = function () {
  if (nconf.get('localMode')) {
    return true
  } else {
    return false
  }
}

module.exports.getDBRegion = function () {
  return region
}

module.exports.getPort = function () {
  return PORT
}

module.exports.getTableName = function () {
  return tableName
}

module.exports.getLogger = function (name) {
        /**
         * Returns a log4js logger.  The level will be set from configuration
         * properties.  If loggers.{name}.level is not found, then
         * loggers.*.level will be used.  If that is not available, no level
         * will be set.
         */
  const logger = log4js.getLogger(name)

  const level = this.get(util.format('loggers:%s:level', name)) ||
            this.get('loggers:*:level')

  if (level) {
    logger.setLevel(level)
  }

  return logger
}

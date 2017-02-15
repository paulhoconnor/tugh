const config = require('../config')
const util = require('util')
const rmdir = require('rmdir')
const logger = config.getLogger('daos/url')
const dbConn = require('../dbs/dynamo/connect')
const errors = require('../utils/errors')
const path = require('path')
const DAOBase = require('./base')

class UrlDao extends DAOBase {
  constructor (options) {
    super(options)
    this.db = dbConn()
  }

  saveUrl (code, url) {
    logger.info('saveUrl: saving ' + code)
    logger.debug('.....' + url)

    return new Promise((resolve, reject) => {
      if (!code || !url) {
        return reject(new errors.ClientError())
      }

      let params = {
        TableName: config.getTableName(),
        Item: {
          code: {S: code},
          url: {S: url}
        },
        ConditionExpression: 'attribute_not_exists(code)'
      }

      this.db.putItem(params, (err, result) => {
        if (err) {
          logger.error(util.inspect(err, false, null))
          if (err.code && err.code === 'ConditionalCheckFailedException') {
            err = new errors.DuplicateError()
          } else {
            err = new errors.InternalServerError(util.inspect(err, false, null))
          }
          console.log(err)
          reject(err)
        }
        logger.debug('.....result = ' + util.inspect(result, false, null))
        resolve(result)
      })
    })
  }

  getUrlForCode (code) {
    logger.info('getUrlForCode: querying url for code ' + code)

    return new Promise((resolve, reject) => {
      if (!code) {
        return reject(new errors.ClientError())
      }

      let params = {
        TableName: config.getTableName(),
        KeyConditionExpression: 'code = :c ',
        ExpressionAttributeValues: {
          ':c': {S: code}
        }
      }

      this.db.query(params, function (err, result) {
        logger.debug('.....result = ' + util.inspect(result, false, null))
        if (err) {
          logger.error(util.inspect(err, false, null))
          err = new errors.InternalServerError(util.inspect(err, false, null))
          return reject(err)
        } else if (result.Items.length === 0) {
          return reject(new errors.NotFoundError())
        }
        resolve(result.Items[0].url.S)
      })
    })
  }

  configDB () {
    logger.info('configDB')

    return new Promise((resolve, reject) => {
      dbConn.configDB(function (err, result) {
        if (err) {
          return reject(new errors.InternalServerError(util.inspect(err, false, null)))
        }
        resolve(result)
      })
    })
  }

  deleteLocalDB () {
    logger.info('deleteLocalDB')

    return new Promise((resolve, reject) => {
      rmdir(path.join(__dirname, '../../localdb'), function (err) {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }
}

module.exports = {
  get: function (options) {
    return new UrlDao(options)
  }
}

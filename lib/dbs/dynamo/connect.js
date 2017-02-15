const config = require('../../config')
const logger = config.getLogger('dynamoDB config')
const fs = require('fs')
const util = require('util')
const path = require('path')
const AWS = require('aws-sdk')
let dynamo

function configDynamo () {
  let opts = {region: config.getDBRegion(),
    maxRetries: 2,
    httpOptions: { timeout: 500 }
  }

  if (config.isLocalDB()) {
    opts.accessKeyId = 'myKeyId'
    opts.secretAccessKey = 'secretKey'
  }

  AWS.config.update(opts)

  let dynamo = new AWS.DynamoDB({endpoint:
                        new AWS.Endpoint(config.getDBUrl())})

  logger.info('DynamoDB connection configured...')
  return dynamo
}

module.exports = function () {
  return dynamo || (dynamo = configDynamo())
}

const descTugh = module.exports.descTugh = function (callback) {
  logger.info('descTugh')
  configDynamo().describeTable({TableName: 'shorts'}, function (err, res) {
    callback(err, res)
  })
}

const createTugh = module.exports.createTugh = function (callback) {
  logger.info('createTugh')
  var tableSchema = JSON.parse(fs.readFileSync(path.join(__dirname, 'table.json'), 'utf-8'))
  var db = configDynamo()
  db.createTable(tableSchema, function (err, res) {
    if (err) {
      callback(err)
    }
    db.waitFor('tableExists', {TableName: config.getTableName()},
                                                    function (err, data) {
                                                      callback(err, data)
                                                    })
  })
}

module.exports.configDB = function (callback) {
  logger.info('configDB')
  descTugh(function (err, result) {
    if (err && err.code === 'ResourceNotFoundException') {
      createTugh(callback)
    } else if (err) {
      logger.error('error describing table: ' + util.inspect(err, null, false))
      callback(err)
    } else {
      logger.info('DB already exists')
      callback()
    }
  })
}

/* eslint-env mocha */

const config = require('../lib/config')
const mockery = require('mockery')
const LocalDB = require('../lib/dbs/dynamo/localdb')
const Dao = require('../lib/daos/url')

module.exports = config

let testServerUrl
let localdb
let dao

config.getTestServerUrl = function () {
  return testServerUrl
}

config.setTestServerUrl = function (url) {
  testServerUrl = url
}

config.getLocalDB = function () {
  return localdb
}

config.isLocalDB = function () {
  return true
}

before(function (done) {
  mockery.enable({
    warnOnReplace: false,
    warnOnUnregistered: false
  })
  mockery.registerMock('../config', config)
  mockery.registerMock('./config', config)
  done()
})

before(function (done) {
  localdb = new LocalDB()
  localdb.start(done)
})

before(function (done) {
  dao = Dao.get()
  dao.configDB().then(function () {
    done()
  }, done)
})

after(function (done) {
  localdb.stop(function (err) {
    if (err) {
      return done(err)
    }
    dao.deleteLocalDB().then(function () {
      done()
    }, done)
  })
})

after(function (done) {
  mockery.disable()
  done()
})

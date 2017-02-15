const config = require('./config')
const logger = config.getLogger('TestServer')
const nconf = require('nconf')
const util = require('util')

nconf.env()
nconf.use('memory')

module.exports = function (options) {
  options = options || {}

    // start the tugh restify app
  const app = require('../lib/app')

    /**
     * Set up the test server
     */
  this.start = function (callback) {
        // configure and start tugh server
    app.listen(config.getPort(), function (err, app) {
      if (err) {
        logger.error('Can\'t start the test server: ' +
                                                util.inspect(err, null, false))
        return callback(err)
      } else {
        config.setTestServerUrl('http://localhost:' + config.getPort())
        callback(err)
      }
    })
  }

  this.stop = function (callback) {
    app.close(callback)
  }
}

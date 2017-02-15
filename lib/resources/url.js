const config = require('../config')
const Dao = require('../daos/url')
const Controller = require('../controllers/url')
const httpHandle = require('../utils/httpHandler')
const async = require('async')
const validators = require('../utils/validators')
const util = require('util')
const controllerMiddleware = require('../middleware/controller')(Controller)
const daoMiddleware = require('../middleware/dao')(Dao)

module.exports = function (app) {
  const logger = config.getLogger('url api')

  app.use(daoMiddleware)
  app.use(controllerMiddleware)

  app.get('/url/:code', function (req, res) {
        /**
         * Retreives a url associated with a code
         * in a json object - no redirect
         *  Params
         *      - code : string
         */
    logger.info('GET /url/' + req.params.code)
    req.controller.getUrlForCode(decodeURIComponent(req.params.code))
        .then(function (result) {
          logger.info('GET /url/' + req.params.code + ' done')
          logger.debug('.....result = ' + util.inspect(result, false, null))
          httpHandle(res)(null, {url: result})
        }, err => {
          logger.error('GET /url' + req.params.code + ' error: ' + util.inspect(err, false, null))
          httpHandle(res)(err)
        }).catch(err => {
          logger.error('GET /url ' + util.inspect(err, null, false))
        })
  })

  app.get('/:code', function (req, res) {
        /**
         * Retreives a url associated with a code in the url
         *  Params
         *      - code : string
         */
    logger.info('GET /' + req.params.code)
    if (!req.params.code) {
      var body = '<html><body>Welcome to tugh - for usage please see ' +
                        'the <a href="https://github.com/paulhoconnor/tugh' +
                        '#api">API guide</a></body></html>'
      res.writeHead(200, {
        'Content-Length': Buffer.byteLength(body),
        'Content-Type': 'text/html'
      })
      res.write(body)
      res.end()
    } else {
      req.controller.getUrlForCode(decodeURIComponent(req.params.code))
            .then(function (result) {
              logger.info('GET /' + req.params.code + ' done')
              logger.debug('.....result = ' + util.inspect(result, false,
                                                                        null))

              res.setHeader('location', result)
              httpHandle(res, 303)(null)
            }, err => {
              logger.error('GET /' + req.params.code + ' error: ' + util.inspect(err, false, null))
              httpHandle(res)(err)
            }).catch(err => {
              logger.error('GET / ' + util.inspect(err, null, false))
            })
    }
  })

  app.post('/url', function (req, res) {
        /**
         *  Exchange a long url for a code which will resolve it later
         *  Params
         *      - body
         *           {url': <url>}
         *  Returns
         *           {'code': <code>}
         */

    logger.info('POST /url')
    async.waterfall([
      validators.validateRequestBody.bind(null, req.body),
      validators.validateUrl.bind(null),
      function (callback) {
        req.controller.saveUrl(req.body.url)
                .then(function (result) {
                  logger.info('POST /url done')
                  logger.debug('.....result = ' + util.inspect(result,
                                                            false, null))
                  callback(null, result)
                }, callback).catch(err => {
                  logger.error('POST /url ' + util.inspect(err, null, false))
                })
      }
    ], function (err, result) {
      httpHandle(res)(err, {code: result})
    })
  })
}

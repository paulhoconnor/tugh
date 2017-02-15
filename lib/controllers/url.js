const config = require('../config')
let UrlDao = require('../daos/url')
const cuid = require('cuid')

let UrlController = function (options) {
  let logger = config.getLogger('controllers/url')
  let urlDao

  if (options && options.user) { // TBC
    urlDao = UrlDao.getForUser(options.user)
  } else {
    urlDao = UrlDao.get()
  }

  this.generateCode = function () {
    return cuid.slug()
  }

  this.saveUrl = function (url) {
    logger.info('saveUrl')
    logger.debug('.....' + url)

    var code = this.generateCode()
    return urlDao.saveUrl(code, url).then(function () {
      return Promise.resolve(code)
    })
  }

    // pass through but maybe later we will add instrumentation, etc.
  this.getUrlForCode = function (code) {
    logger.info('getUrlForCode')
    logger.debug('.....' + code)

    return urlDao.getUrlForCode(code)
  }
}

module.exports = {

  get: function (options) {
    return new UrlController(options)
  }
}

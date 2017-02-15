/* eslint-env mocha */

const config = require('../config')
const request = require('request')
const TestServer = require('../testServer')
const assert = require('assert')
const util = require('util')

var getUrl = function (path, resource) {
  let url
  if (resource) {
    url = util.format('%s/%s/%s', config.getTestServerUrl(), path,
            resource)
  } else {
    url = util.format('%s/%s', config.getTestServerUrl(), path)
  }

  return url
}

describe('Url resources - system errors', () => {
  let testServer

  before(done => {
    testServer = new TestServer()
    testServer.start(function (err) {
      done(err)
    })
  })

  before(done => {
    config.getLocalDB().stop(done)
  })

  after(done => {
    config.getLocalDB().start(done)
  })

  after(done => {
    testServer.stop(done)
  })

  let testUrl = 'http://foo.com/bar/baz?t=100'

  it('Echange url for code - should get server error', done => {
    request({
      url: getUrl('url'),
      method: 'POST',
      json: {url: testUrl}
    }, (err, httpResp, body) => {
      assert(httpResp.statusCode, 500)
      assert(body.message, 'InternalServerError')
      done(err)
    })
  })
})

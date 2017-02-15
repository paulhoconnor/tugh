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

describe('Url resources', () => {
  let testServer

  before(done => {
    testServer = new TestServer()
    testServer.start(function (err) {
      done(err)
    })
  })

  after(done => {
    testServer.stop(done)
  })

  let testUrl = 'http://foo.com/bar/baz?t=100'
  let testCode

  it('Echange url for code - invalid body', done => {
    request({
      url: getUrl('url'),
      method: 'POST',
      json: true,
      body: 'foo'
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 400)
      assert.equal(body.name, 'ClientError')
      assert.equal(body.message, 'Invalid request body')
      done(err)
    })
  })

  it('Echange url for code - invalid url', done => {
    request({
      url: getUrl('url'),
      method: 'POST',
      json: {url: 'foobar'}
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 400)
      assert.equal(body.name, 'ClientError')
      assert.equal(body.message, 'Invalid URL: foobar')
      done(err)
    })
  })

  it('Echange url for code', done => {
    request({
      url: getUrl('url'),
      method: 'POST',
      json: {url: testUrl}
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 200)
      testCode = body.code
      done(err)
    })
  })

  it('get url for code', done => {
    request({
      url: getUrl('url', testCode),
      method: 'GET',
      json: true
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 200)
      assert.equal(body.url, testUrl)
      done(err)
    })
  })

  it('try to get url for invalid code -should 404', done => {
    request({
      url: getUrl('url', 'foobar'),
      method: 'GET',
      json: true
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 404)
      assert.equal(body.name, 'NotFoundError')
      done(err)
    })
  })

  it('code/url exchange - redirect to url', done => {
    request({
      url: getUrl(testCode),
      followRedirect: false
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 303)
      assert.equal(httpResp.headers.location, testUrl)
      done(err)
    })
  })

  it('code/url exchange - invalid code - should 404', done => {
    request({
      url: getUrl('foobar'),
      method: 'GET',
      json: true
    }, (err, httpResp, body) => {
      assert.equal(httpResp.statusCode, 404)
      assert.equal(body.name, 'NotFoundError')
      done(err)
    })
  })
})

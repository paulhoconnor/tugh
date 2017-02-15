/* eslint-env mocha */

const assert = require('assert')
const Controller = require('../../lib/controllers/url')
const testUrl = 'http://foo.com/bar?baz=bim'

require('sugar').extend()

describe('url shortening control', function () {
  let codes = []
  let controller
  let testCode

  describe('generate unique code slugs', function () {
    before(function (done) {
      controller = Controller.get()
      done()
    })

    it('generate 1000 code slugs', done => {
      var i
      for (i = 0; i < 1000; i++) {
        codes.push(controller.generateCode())
      }
      assert.equal(codes.length, 1000)
      done()
    })

    it('salt the test with 2 duplicate codes', done => {
      codes.push('foo', 'foo')
      assert.equal(codes.length, 1002)
      done()
    })

    it('make sure codes are unique strings', done => {
      var checkCodes = codes.unique(code => {
        if (typeof code !== 'string') {
          return null // will be compacted out later
        } else {
          return code
        }
      }).compact() // remove all nulls
      assert.equal(checkCodes.length, codes.length - 1) // one foo removed
      assert.equal(checkCodes.find('foo'), 'foo')
      done()
    })

    it('save url', done => {
      controller.saveUrl(testUrl)
            .then(code => {
              console.log(code)
              assert(code)
              assert(code.length >= 7)
              testCode = code
              done()
            }, done)
    })

    it('get url', done => {
      controller.getUrlForCode(testCode)
            .then(url => {
              assert.equal(url, testUrl)
              done()
            }, done)
    })
  })
})

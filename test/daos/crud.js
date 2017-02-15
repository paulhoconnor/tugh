/* eslint-env mocha */

const assert = require('assert')
const errors = require('../../lib/utils/errors')
const Dao = require('../../lib/daos/url')

require('sugar').extend()

describe('dao crud ops ', function () {
  let dao
  let testUrl = 'http://bar.com'

  before(function (done) {
    dao = Dao.get()
    done()
  })

  it('ensure base extension', done => {
    assert.equal(dao.getName(), 'base')
    done()
  })

  it('save with no params - expecting ClientError', done => {
    dao.saveUrl().then(url => {
      assert(false, 'should be NotFoundError')
      done()
    }, err => {
      assert(err instanceof errors.ClientError)
      done()
    })
  })

  it('getUrlForCode with no params - expecting ClientError', done => {
    dao.getUrlForCode().then(url => {
      assert(false, 'should be NotFoundError')
      done()
    }, err => {
      assert(err instanceof errors.ClientError)
      done()
    })
  })

  it('save code & url', done => {
    dao.saveUrl('foo', testUrl).then(() => {
      done()
    }, done)
  })

  it('retrieved url for saved code', done => {
    dao.getUrlForCode('foo').then(url => {
      assert.equal(url, testUrl)
      done()
    }, done)
  })

  it('query for unknown code - should return NotFoundError', done => {
    dao.getUrlForCode('bar').then(url => {
      assert(false, 'should be NotFoundError')
      done()
    }, err => {
      assert(err instanceof errors.NotFoundError)
      done()
    })
  })

  it('save duplicate code - should return DuplicateError', done => {
    dao.saveUrl('foo', testUrl).then(url => {
      assert(false, 'should be NotFoundError')
      done()
    }, err => {
      assert(err instanceof errors.DuplicateError)
      done()
    })
  })
})

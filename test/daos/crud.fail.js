/* eslint-env mocha */

const config = require('../config')
const assert = require('assert')
const errors = require('../../lib/utils/errors')
const Dao = require('../../lib/daos/url')

require('sugar').extend()

describe('dao crud ops - database down', () => {
  let dao
  let testUrl = 'http://bar.com'

  before(done => {
    config.getLocalDB().stop(done)
  })

  after(done => {
    config.getLocalDB().start(done)
  })

  before(done => {
    dao = Dao.get()
    done()
  })

  it('save code & url - expecting InternalServerError', done => {
    dao.saveUrl('foo', testUrl).then(() => {
      assert(false, 'no error')
      done()
    }, function (err) {
      assert(err instanceof errors.InternalServerError)
      done()
    })
  })

  it('retrieved url for saved code - expecting InternalServerError', done => {
    dao.getUrlForCode('foo').then(url => {
      assert(false, 'no error')
      done()
    }, err => {
      assert(err instanceof errors.InternalServerError)
      done()
    })
  })

  it('config db - expecting InternalServerError', done => {
    dao.configDB().then(url => {
      assert(false, 'no error')
      done()
    }, err => {
      assert(err instanceof errors.InternalServerError)
      done()
    })
  })
})

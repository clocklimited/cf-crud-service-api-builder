const assert = require('assert')
const async = require('async')
const crudServiceApiBuilder = require('../api-builder')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('mc-logger')
const request = require('supertest')
const createService = require('./service')

describe('hooks', () => {
  let service = null
  let app = null

  beforeEach(done => {
    service = createService()
    app = express()
    app.use(bodyParser.json())
    const fixtures = [
      { _id: '1', name: 'a' },
      { _id: '2', name: 'b' }
    ]
    async.each(fixtures, service.create, done)
  })

  test('should be fired after multi GET', done => {
    const apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
    let hooked = false

    apiBuilder.hook('read:response', (data, cb) => {
      hooked = true
      assert.equal(Array.isArray(data), true, 'data should be an array')
      assert.equal(data.length, 2)
      cb(null, data)
    })

    request(app)
      .get('/things')
      .set('Accept', 'application/json')
      .send({})
      .expect(200)
      .end((error, res) => {
        if (error) return done(error)
        assert.equal(hooked, true, 'hook was not run')
        assert.equal(res.body.results.length, 2)
        done()
      })
  })

  test('should be fired after individual GET', done => {
    const apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
    let hooked = false

    apiBuilder.hook('read:response', (data, cb) => {
      hooked = true
      assert.equal(Array.isArray(data), false, 'data should not be an array')
      assert.equal(data._id, '1')
      cb(null, data)
    })

    request(app)
      .get('/things/1')
      .set('Accept', 'application/json')
      .send({})
      .expect(200)
      .end((error, res) => {
        if (error) return done(error)
        assert.equal(hooked, true, 'hook was not run')
        assert.equal(res.body._id, '1')
        done()
      })
  })

  test('should be fired before and after POST', done => {
    const apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
    let requestHooked = false
    let responseHooked = false

    apiBuilder.hook('create:request', (data, cb) => {
      requestHooked = true
      assert.equal(data._id, '3')
      cb(null, data)
    })

    apiBuilder.hook('create:response', (data, cb) => {
      responseHooked = true
      assert.equal(data._id, '3')
      cb(null, data)
    })

    request(app)
      .post('/things')
      .set('Accept', 'application/json')
      .send({ _id: '3', name: 'd' })
      .expect(201)
      .end((error, res) => {
        if (error) return done(error)
        assert.equal(requestHooked, true, 'request hook was not run')
        assert.equal(responseHooked, true, 'response hook was not run')
        assert.equal(res.body._id, '3')
        done()
      })
  })

  test('should be fired before and after PUT', done => {
    const apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
    let requestHooked = false
    let responseHooked = false

    apiBuilder.hook('update:request', (data, cb) => {
      requestHooked = true
      assert.equal(data.length, 1)
      assert.equal(data[0]._id, '2')
      cb(null, data)
    })

    apiBuilder.hook('update:response', (data, cb) => {
      responseHooked = true
      assert.equal(data.length, 1)
      assert.equal(data[0]._id, '2')
      cb(null, data)
    })

    request(app)
      .put('/things/2')
      .set('Accept', 'application/json')
      .send({ _id: '2', name: 'e' })
      .expect(200)
      .end((error, res) => {
        if (error) return done(error)
        assert.equal(requestHooked, true, 'request hook was not run')
        assert.equal(responseHooked, true, 'response hook was not run')
        assert.equal(res.body._id, '2')
        done()
      })
  })

  test('should be fired before and after PATCH', done => {
    const apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
    let requestHooked = false
    let responseHooked = false

    apiBuilder.hook('partialUpdate:request', (data, cb) => {
      requestHooked = true
      assert.equal(data._id, '2')
      cb(null, data)
    })

    apiBuilder.hook('partialUpdate:response', (data, cb) => {
      responseHooked = true
      assert.equal(data._id, '2')
      cb(null, data)
    })

    request(app)
      .patch('/things/2')
      .set('Accept', 'application/json')
      .send({ _id: '2', name: 'f' })
      .expect(200)
      .end((error, res) => {
        if (error) return done(error)
        assert.equal(requestHooked, true, 'request hook was not run')
        assert.equal(responseHooked, true, 'response hook was not run')
        assert.equal(res.body._id, '2')
        done()
      })
  })
})

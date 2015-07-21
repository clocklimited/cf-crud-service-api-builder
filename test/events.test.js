var assert = require('assert')
  , crudServiceApiBuilder = require('../api-builder')
  , express = require('express')
  , logger = require('mc-logger')
  , request = require('supertest')
  , service = require('./service')()
  , app = express()

app.use(express.json())

describe('events', function () {

  var apiBuilder = null

  before(function () {
    apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
  })

  it('should be emitted after a POST', function (done) {

    var eventFired = false
    apiBuilder.on('post', function (req, data) {
      eventFired = true
      assert(req, 'req is not present')
      assert.equal(data._id, '1')
    })

    request(app)
      .post('/things')
      .set('Accept', 'application/json')
      .send({})
      .expect(201)
      .end(function (error) {
        if (error) return done(error)
        assert.equal(eventFired, true, 'post event was not fired')
        done()
      })
  })

  it('should be emitted after a PUT', function (done) {
    var eventFired = false
    apiBuilder.on('put', function (req, data) {
      eventFired = true
      assert(req, 'req is not present')
      assert.equal(data._id, '1')
    })

    request(app)
      .put('/things/1')
      .set('Accept', 'application/json')
      .send({ _id: '1' })
      .expect(200)
      .end(function (error) {
        if (error) return done(error)
        assert.equal(eventFired, true, 'put event was not fired')
        done()
      })
  })

  it('should be emitted after a PATCH', function (done) {
    var eventFired = false
    apiBuilder.on('patch', function (req, data) {
      eventFired = true
      assert(req, 'req is not present')
      assert.equal(data._id, '1')
    })

    request(app)
      .patch('/things/1')
      .set('Accept', 'application/json')
      .send({ _id: '1' })
      .expect(200)
      .end(function (error) {
        if (error) return done(error)
        assert.equal(eventFired, true, 'patch event was not fired')
        done()
      })
  })

  it('should be emitted after a DELETE', function (done) {
    var eventFired = false
    apiBuilder.on('delete', function (req) {
      eventFired = true
      assert(req, 'req is not present')
    })

    request(app)
      .delete('/things/1')
      .set('Accept', 'application/json')
      .send({ _id: '1' })
      .expect(204)
      .end(function (error) {
        if (error) return done(error)
        assert.equal(eventFired, true, 'delete event was not fired')
        done()
      })
  })

})

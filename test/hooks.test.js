var assert = require('assert')
  , async = require('async')
  , crudServiceApiBuilder = require('../api-builder')
  , express = require('express')
  , bodyParser = require('body-parser')
  , logger = require('mc-logger')
  , request = require('supertest')
  , createService = require('./service')

describe('hooks', function () {

  var service = null
    , app = null

  beforeEach(function (done) {
    service = createService()
    app = express()
    app.use(bodyParser.json())
    var fixtures =
          [ { _id: '1', name: 'a' }
          , { _id: '2', name: 'b' }
          ]
    async.each(fixtures, service.create, done)
  })

  it('should be fired after multi GET', function (done) {

    var apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
      , hooked = false

    apiBuilder.hook('read:response', function (data, cb) {
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
      .end(function (error, res) {
        if (error) return done(error)
        assert.equal(hooked, true, 'hook was not run')
        assert.equal(res.body.results.length, 2)
        done()
      })
  })

  it('should be fired after individual GET', function (done) {
    var apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
      , hooked = false

    apiBuilder.hook('read:response', function (data, cb) {
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
      .end(function (error, res) {
        if (error) return done(error)
        assert.equal(hooked, true, 'hook was not run')
        assert.equal(res.body._id, '1')
        done()
      })
  })

  it('should be fired before and after POST', function (done) {

    var apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
      , requestHooked = false
      , responseHooked = false

    apiBuilder.hook('create:request', function (data, cb) {
      requestHooked = true
      assert.equal(data._id, '3')
      cb(null, data)
    })

    apiBuilder.hook('create:response', function (data, cb) {
      responseHooked = true
      assert.equal(data._id, '3')
      cb(null, data)
    })

    request(app)
      .post('/things')
      .set('Accept', 'application/json')
      .send({ _id: '3' })
      .expect(201)
      .end(function (error, res) {
        if (error) return done(error)
        assert.equal(requestHooked, true, 'request hook was not run')
        assert.equal(responseHooked, true, 'response hook was not run')
        assert.equal(res.body._id, '3')
        done()
      })
  })

  it('should be fired before and after PUT', function (done) {

    var apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
      , requestHooked = false
      , responseHooked = false

    apiBuilder.hook('update:request', function (data, cb) {
      requestHooked = true
      assert.equal(data.length, 1)
      assert.equal(data[0]._id, '2')
      cb(null, data)
    })

    apiBuilder.hook('update:response', function (data, cb) {
      responseHooked = true
      assert.equal(data.length, 1)
      assert.equal(data[0]._id, '2')
      cb(null, data)
    })

    request(app)
      .put('/things/2')
      .set('Accept', 'application/json')
      .send({ _id: '2' })
      .expect(200)
      .end(function (error, res) {
        if (error) return done(error)
        assert.equal(requestHooked, true, 'request hook was not run')
        assert.equal(responseHooked, true, 'response hook was not run')
        assert.equal(res.body._id, '2')
        done()
      })
  })

  it('should be fired before and after PATCH', function (done) {

    var apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
      , requestHooked = false
      , responseHooked = false

    apiBuilder.hook('partialUpdate:request', function (data, cb) {
      requestHooked = true
      assert.equal(data._id, '2')
      cb(null, data)
    })

    apiBuilder.hook('partialUpdate:response', function (data, cb) {
      responseHooked = true
      assert.equal(data._id, '2')
      cb(null, data)
    })

    request(app)
      .patch('/things/2')
      .set('Accept', 'application/json')
      .send({ _id: '2' })
      .expect(200)
      .end(function (error, res) {
        if (error) return done(error)
        assert.equal(requestHooked, true, 'request hook was not run')
        assert.equal(responseHooked, true, 'response hook was not run')
        assert.equal(res.body._id, '2')
        done()
      })
  })

})

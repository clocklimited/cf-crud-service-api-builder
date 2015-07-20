var createGetEndpoint = require('../../endpoints/get')
  , express = require('express')
  , createService = require('../service')
  , request = require('supertest')
  , logger = require('mc-logger')
  , assert = require('assert')
  , async = require('async')
  , extend = require('lodash.assign')
  , qs = require('querystring')

describe('GET endpoint', function () {

  describe('GET /prefix/:id', function () {

    var service

    before(function (done) {
      service = createService()
      service.create({ _id: '1', name: 'jim' }, done)
    })

    it('should respond with a 200 when service#read() returns an object', function (done) {
      var app = express()
      createGetEndpoint(service, '/things', app, logger, [])
      request(app)
        .get('/things/1')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err)
          assert.deepEqual(res.body, { _id: '1', name: 'jim' })
          done()
        })
    })

    it('should respond with a 404 when service.read() doesn’t return anything', function (done) {
      var app = express()
      createGetEndpoint(service, '/things', app, logger, [])
      request(app)
        .get('/things/2')
        .expect(404)
        .end(function(err) {
          if (err) return done(err)
          done()
        })
    })

    it('should respond with a 400 when service.read() errors', function (done) {

      function mockRead(id, cb) {
        cb(new Error('fail'))
      }

      var app = express()
      createGetEndpoint(extend({}, service, { read: mockRead }), '/things', app, logger, [])
      request(app)
        .get('/things/3')
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err)
          assert.deepEqual({ error: 'Error reading item from "thing" service' }, res.body)
          done()
        })

    })

  })

  describe('GET /prefix', function () {

    var service

    before(function (done) {
      service = createService()
      async.times(20, function (n, cb) {
        service.create({ _id: '' + n, name: 'jim-' + n }, cb)
      }, done)
    })

    it('should respond with a 200 and list of items when service.find() returns some objects', function (done) {

      var app = express()
      createGetEndpoint(service, '/things', app, logger, [])
      request(app)
        .get('/things')
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err)
          assert.equal(res.body.page, 1)
          assert.equal(res.body.pageSize, 50)
          assert.equal(res.body.totalItems, 20)
          assert.equal(res.body.results.length, 20)
          assert.deepEqual(res.body.results[9], { _id: '9', name: 'jim-9' })
          done()
        })

    })

    it('should respond with a 400 and list of items when service.find() errors', function (done) {

      function mockFind(query, options, cb) {
        cb(new Error('fail'))
      }

      var app = express()
      createGetEndpoint(extend({}, service, { find: mockFind }), '/things', app, logger, [])
      request(app)
        .get('/things')
        .expect(400)
        .end(function(err, res) {
          if (err) return done(err)
          assert.deepEqual({ error: 'Error finding items from "thing" service' }, res.body)
          done()
        })

    })

    // This is skipped because the save memory engine doesn't know how to handle { skip, limit } options
    it.skip('should successfully paginate requests', function (done) {

      var app = express()
      createGetEndpoint(service, '/things', app, logger, [])
      request(app)
        .get('/things?' + qs.stringify({ pagination: JSON.stringify({ page: 3, pageSize: 7 }) }))
        .expect(200)
        .end(function(err, res) {
          if (err) return done(err)
          assert.equal(res.body.page, 3)
          assert.equal(res.body.pageSize, 7)
          assert.equal(res.body.totalItems, 20)
          assert.equal(res.body.results.length, 6)
          assert.deepEqual(res.body.results[0], { _id: '14', name: 'jim-14' })
          assert.deepEqual(res.body.results[7], { _id: '19', name: 'jim-19' })
          done()
        })

    })

  })

})

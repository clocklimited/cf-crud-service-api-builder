const createGetEndpoint = require('../../endpoints/get')
const express = require('express')
const createService = require('../service')
const request = require('supertest')
const logger = require('mc-logger')
const assert = require('assert')
const async = require('async')
const extend = require('lodash.assign')
const qs = require('querystring')
const createPipe = require('piton-pipe').createPipe

const setup = cb => {
  const service = createService()
  service.create({ _id: '1', name: 'jim' }, () => {
    cb(null, service)
  })
}

describe('GET endpoint', () => {
  const hooks = { 'read:response': createPipe() }

  describe('GET /prefix/:id', () => {
    test(
      'should respond with a 200 when service#read() returns an object',
      done => {
        setup((ignore, service) => {
          const app = express()
          createGetEndpoint(service, '/things', app, logger, [], null, hooks)
          request(app)
            .get('/things/1')
            .expect(200)
            .end((err, res) => {
              if (err) return done(err)
              assert.deepEqual(res.body, { _id: '1', name: 'jim' })
              done()
            })
        })
      }
    )

    test(
      'should respond with a 404 when service.read() doesn’t return anything',
      done => {
        setup((ignore, service) => {
          const app = express()
          createGetEndpoint(service, '/things', app, logger, [], null, hooks)
          request(app)
            .get('/things/2')
            .expect(404)
            .end(err => {
              if (err) return done(err)
              done()
            })
        })
      }
    )

    test('should respond with a 400 when service.read() errors', done => {
      setup((ignore, service) => {
        function mockRead (id, cb) {
          cb(new Error('fail'))
        }

        const app = express()
        createGetEndpoint(extend({}, service, { read: mockRead }), '/things', app, logger, [])
        request(app)
          .get('/things/3')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err)
            assert.deepEqual({ error: 'Error reading item from "thing" service' }, res.body)
            done()
          })
      })
    })
  })

  describe('GET /prefix', () => {
    let service

    beforeAll(done => {
      service = createService()
      async.times(20, (n, cb) => {
        service.create({ _id: `${n}`, name: `jim-${n}` }, cb)
      }, done)
    })

    test(
      'should respond with a 200 and list of items when service.find() returns some objects',
      done => {
        const app = express()
        createGetEndpoint(service, '/things', app, logger, [], null, hooks)
        request(app)
          .get('/things')
          .expect(200)
          .end((err, res) => {
            if (err) return done(err)
            assert.equal(res.body.page, 1)
            assert.equal(res.body.pageSize, 50)
            assert.equal(res.body.totalItems, 20)
            assert.equal(res.body.results.length, 20)
            assert.deepEqual(res.body.results[9], { _id: '9', name: 'jim-9' })
            done()
          })
      }
    )

    test(
      'should respond with a 400 and list of items when service.find() errors',
      done => {
        function mockFind (query, options, cb) {
          cb(new Error('fail'))
        }

        const app = express()
        createGetEndpoint(extend({}, service, { find: mockFind }), '/things', app, logger, [])
        request(app)
          .get('/things')
          .expect(400)
          .end((err, res) => {
            if (err) return done(err)
            assert.deepEqual({ error: 'Error finding items from "thing" service' }, res.body)
            done()
          })
      }
    )

    // This is skipped because the save memory engine doesn't know how to handle { skip, limit } options
    test.skip('should successfully paginate requests', done => {
      const app = express()
      createGetEndpoint(service, '/things', app, logger, [], null, hooks)
      request(app)
        .get(`/things?${qs.stringify({ pagination: JSON.stringify({ page: 3, pageSize: 7 }) })}`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err)
          assert.equal(res.body.page, 3)
          assert.equal(res.body.pageSize, 7)
          assert.equal(res.body.totalItems, 20)
          assert.equal(res.body.results.length, 7)
          assert.deepEqual(res.body.results[0], { _id: '14', name: 'jim-14' })
          assert.deepEqual(res.body.results[7], { _id: '19', name: 'jim-19' })
          done()
        })
    })
  })
})

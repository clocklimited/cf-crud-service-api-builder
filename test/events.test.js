const assert = require('assert')
const async = require('async')
const crudServiceApiBuilder = require('../api-builder')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('mc-logger')
const request = require('supertest')
const createService = require('./service')

const setup = cb => {
  const app = express()
  app.use(bodyParser.json())
  const service = createService()
  const fixtures = [
    { _id: '1', name: 'a' },
    { _id: '2', name: 'b' }
  ]
  const api = crudServiceApiBuilder(service, '/things', app, logger, [], null)
  async.each(fixtures, service.create, error => {
    expect(error).toBeFalsy()
    cb(null, { app, api })
  })
}

describe('events', () => {
  test('should be emitted after a POST', done => {
    setup((error, res) => {
      expect(error).toBeFalsy()
      const { app, api } = res
      let eventFired = false
      api.on('create', (req, data) => {
        eventFired = true
        assert(req, 'req is not present')
        assert.equal(data._id, '3')
      })

      request(app)
        .post('/things')
        .set('Accept', 'application/json')
        .send({ _id: '3', name: 'a' })
        .expect(201)
        .end(error => {
          if (error) return done(error)
          assert.equal(eventFired, true, 'create event was not fired')
          done()
        })
    })
  })

  test('should be emitted after a PUT', done => {
    setup((error, res) => {
      expect(error).toBeFalsy()
      const { app, api } = res
      let eventFired = false
      api.on('update', (req, data) => {
        eventFired = true
        assert(req, 'req is not present')
        assert.equal(data._id, '1')
        assert.equal(data.name, 'd')
      })
      request(app)
        .put('/things/1')
        .set('Accept', 'application/json')
        .send({ _id: '1', name: 'd' })
        .expect(200)
        .end((error, body) => {
          if (error) return done(error)
          assert.equal(eventFired, true, 'update event was not fired')
          done()
        })
    })
  })

  test('should be emitted after a PATCH', done => {
    setup((error, res) => {
      expect(error).toBeFalsy()
      const { app, api } = res
      let eventFired = false
      api.on('partialUpdate', (req, data) => {
        eventFired = true
        assert(req, 'req is not present')
        assert.equal(data._id, '1')
      })

      request(app)
        .patch('/things/1')
        .set('Accept', 'application/json')
        .send({ _id: '1', name: 'd' })
        .expect(200)
        .end(error => {
          if (error) return done(error)
          assert.equal(eventFired, true, 'partialUpdate event was not fired')
          done()
        })
    })
  })

  test('should be emitted after a DELETE', done => {
    setup((error, res) => {
      expect(error).toBeFalsy()
      const { app, api } = res

      let eventFired = false
      api.on('delete', req => {
        eventFired = true
        assert(req, 'req is not present')
      })

      request(app)
        .delete('/things/1')
        .set('Accept', 'application/json')
        .send({ _id: '1', name: 'd' })
        .expect(204)
        .end(error => {
          if (error) return done(error)
          assert.equal(eventFired, true, 'delete event was not fired')
          done()
        })
    })
  })
})

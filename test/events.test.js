const assert = require('assert')
const crudServiceApiBuilder = require('../api-builder')
const express = require('express')
const bodyParser = require('body-parser')
const logger = require('mc-logger')
const request = require('supertest')
const service = require('./service')()
const app = express()

app.use(bodyParser.json())

describe('events', () => {
  let apiBuilder = null

  before(() => {
    apiBuilder = crudServiceApiBuilder(service, '/things', app, logger, [], null)
  })

  it('should be emitted after a POST', done => {
    let eventFired = false
    apiBuilder.on('create', (req, data) => {
      eventFired = true
      assert(req, 'req is not present')
      assert.equal(data._id, '1')
    })

    request(app)
      .post('/things')
      .set('Accept', 'application/json')
      .send({})
      .expect(201)
      .end(error => {
        if (error) return done(error)
        assert.equal(eventFired, true, 'create event was not fired')
        done()
      })
  })

  it('should be emitted after a PUT', done => {
    let eventFired = false
    apiBuilder.on('update', (req, data) => {
      eventFired = true
      assert(req, 'req is not present')
      assert.equal(data._id, '1')
    })

    request(app)
      .put('/things/1')
      .set('Accept', 'application/json')
      .send({ _id: '1' })
      .expect(200)
      .end(error => {
        if (error) return done(error)
        assert.equal(eventFired, true, 'update event was not fired')
        done()
      })
  })

  it('should be emitted after a PATCH', done => {
    let eventFired = false
    apiBuilder.on('partialUpdate', (req, data) => {
      eventFired = true
      assert(req, 'req is not present')
      assert.equal(data._id, '1')
    })

    request(app)
      .patch('/things/1')
      .set('Accept', 'application/json')
      .send({ _id: '1' })
      .expect(200)
      .end(error => {
        if (error) return done(error)
        assert.equal(eventFired, true, 'partialUpdate event was not fired')
        done()
      })
  })

  it('should be emitted after a DELETE', done => {
    let eventFired = false
    apiBuilder.on('delete', req => {
      eventFired = true
      assert(req, 'req is not present')
    })

    request(app)
      .delete('/things/1')
      .set('Accept', 'application/json')
      .send({ _id: '1' })
      .expect(204)
      .end(error => {
        if (error) return done(error)
        assert.equal(eventFired, true, 'delete event was not fired')
        done()
      })
  })
})

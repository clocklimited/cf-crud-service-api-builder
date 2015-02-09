var assert = require('assert')
  , parseQueryString = require('../parse-query-string')

describe('query string parser', function () {

  it('should call respond with an error if invalid json is passed to req.query.filter', function (done) {

    parseQueryString({ query: { filter: 'not json' } }, { status: mockStatus, json: mockEnd })

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }

  })

  it('should call respond with an error if invalid json is passed to req.query.pagination', function (done) {

    parseQueryString({ query: { pagination: 'not json' } }, { status: mockStatus, json: mockEnd })

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }

  })

  it('should call respond with an error if invalid json is passed to req.query.sort', function (done) {

    parseQueryString({ query: { sort: 'not json' } }, { status: mockStatus, json: mockEnd })

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }

  })

  it('should default req.query.keywords to empty string', function (done) {
    var req = { query: {} }
    parseQueryString(req, {}, function () {
      assert.equal('', req.query.keywords)
      done()
    })
  })

  it('should parse req.query.filter options', function (done) {
    var filter = { a: 10, b: 20, c: 'thirty' }
      , req = { query: { filter: JSON.stringify(filter) } }
    parseQueryString(req, {}, function () {
      assert.deepEqual(filter, req.query.filter)
      done()
    })
  })

  it('should parse req.query.sort options', function (done) {
    var sort = [ 'a', 'desc' ]
      , req = { query: { sort: JSON.stringify(sort) } }
    parseQueryString(req, {}, function () {
      assert.deepEqual([ sort ], req.query.sort)
      done()
    })
  })

  it('should default req.query.sort to undefined (not present)', function (done) {
    var req = { query: {} }
    parseQueryString(req, {}, function () {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  it('should default req.query.sort to undefined (object)', function (done) {
    var req = { query: { sort: JSON.stringify({}) } }
    parseQueryString(req, {}, function () {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  it('should default req.query.sort to undefined (empty array)', function (done) {
    var req = { query: { sort: JSON.stringify([]) } }
    parseQueryString(req, {}, function () {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  it('should default req.query.sort to undefined (number)', function (done) {
    var req = { query: { sort: '1' } }
    parseQueryString(req, {}, function () {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  it('should default req.query.sort direction to "asc"', function (done) {
    var req = { query: { sort: JSON.stringify([ 'a' ]) } }
    parseQueryString(req, {}, function () {
      assert.deepEqual([ [ 'a', 'asc' ] ], req.query.sort)
      done()
    })
  })

  it('should error if JSON is not an object or array', function (done) {
    parseQueryString({ query: { filter: JSON.stringify(5) } }, { status: mockStatus, json: mockEnd })

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }

  })

})

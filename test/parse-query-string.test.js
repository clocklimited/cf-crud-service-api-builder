const assert = require('assert')
const parseQueryString = require('../parse-query-string')

describe('query string parser', () => {
  test('should call respond with an error if invalid json is passed to req.query.filter', (done) => {
    parseQueryString(
      { query: { filter: 'not json' } },
      { status: mockStatus, json: mockEnd }
    )

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }
  })

  test('should call respond with an error if invalid json is passed to req.query.projection', (done) => {
    parseQueryString(
      { query: { projection: 'not json' } },
      { status: mockStatus, json: mockEnd }
    )

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }
  })

  test('should call respond with an error if invalid json is passed to req.query.pagination', (done) => {
    parseQueryString(
      { query: { pagination: 'not json' } },
      { status: mockStatus, json: mockEnd }
    )

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }
  })

  test('should call respond with an error if invalid json is passed to req.query.sort', (done) => {
    parseQueryString(
      { query: { sort: 'not json' } },
      { status: mockStatus, json: mockEnd }
    )

    function mockStatus(code) {
      assert.equal(400, code)
      return this
    }

    function mockEnd(error) {
      assert.equal('Invalid JSON', error.message)
      done()
    }
  })

  test('should default req.query.keywords to empty string', (done) => {
    const req = { query: {} }
    parseQueryString(req, {}, () => {
      assert.equal('', req.query.keywords)
      done()
    })
  })

  test('should parse req.query.filter options', (done) => {
    const filter = { a: 10, b: 20, c: 'thirty' }
    const req = { query: { filter: JSON.stringify(filter) } }
    parseQueryString(req, {}, () => {
      assert.deepEqual(filter, req.query.filter)
      done()
    })
  })

  test('should parse req.query.projection options', (done) => {
    const projection = { a: 1, b: 0, c: 1 }
    const req = { query: { projection: JSON.stringify(projection) } }
    parseQueryString(req, {}, () => {
      assert.deepEqual(projection, req.query.projection)
      done()
    })
  })

  test('should parse req.query.sort options', (done) => {
    const sort = ['a', 'desc']
    const req = { query: { sort: JSON.stringify(sort) } }
    parseQueryString(req, {}, () => {
      assert.deepEqual([sort], req.query.sort)
      done()
    })
  })

  test('should default req.query.sort to undefined (not present)', (done) => {
    const req = { query: {} }
    parseQueryString(req, {}, () => {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  test('should default req.query.sort to undefined (object)', (done) => {
    const req = { query: { sort: JSON.stringify({}) } }
    parseQueryString(req, {}, () => {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  test('should default req.query.sort to undefined (empty array)', (done) => {
    const req = { query: { sort: JSON.stringify([]) } }
    parseQueryString(req, {}, () => {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  test('should default req.query.sort to undefined (number)', (done) => {
    const req = { query: { sort: '1' } }
    parseQueryString(req, {}, () => {
      assert.equal(undefined, req.query.sort)
      done()
    })
  })

  test('should default req.query.sort direction to "asc"', (done) => {
    const req = { query: { sort: JSON.stringify(['a']) } }
    parseQueryString(req, {}, () => {
      assert.deepEqual([['a', 'asc']], req.query.sort)
      done()
    })
  })

  test('should error if JSON is not an object or array', (done) => {
    parseQueryString(
      { query: { filter: JSON.stringify(5) } },
      { status: mockStatus, json: mockEnd }
    )

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

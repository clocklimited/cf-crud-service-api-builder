const schemata = require('schemata')
const createFilterParser = require('../filter-parser')
const assert = require('assert')

const createSchema = () => schemata({
  name: 'Test',
  properties: {
    string: { type: String },
    date: { type: Date },
    bool: { type: Boolean },
    number: { type: Number },
    object: { type: Object },
    array: { type: Array },
    schemataArray: { type: schemata.Array(schemata({ name: 'Sub', properties: { key: 'value' } })) }
  }
})

describe('filter parser', () => {
  const filterParser = createFilterParser(createSchema())

  test('should correctly parse strings', () => {
    let params = { string: 'String' }
    params = filterParser(params)
    assert.equal('string', typeof params.string)
  })

  test('should correctly parse dates', () => {
    let params = { date: '2013-04-17T14:36:55.648Z' }
    params = filterParser(params)
    assert(params.date instanceof Date)
  })

  test('should correctly parse booleans', () => {
    let params = { bool: 'true' }
    params = filterParser(params)
    assert.equal('boolean', typeof params.bool)
  })

  test('should correctly parse numbers', () => {
    let params = { number: '100' }
    params = filterParser(params)
    assert.equal('number', typeof params.number)
  })

  test('should correctly parse objects', () => {
    let params = { object: { key: 'value' } }
    params = filterParser(params)
    assert.equal('object', typeof params.object)
  })

  test('should correctly parse arrays', () => {
    let params = { array: [ 1, 2, 3 ] }
    params = filterParser(params)
    assert(params.array instanceof Array)
  })

  test('should correctly parse array index queries', () => {
    let params = { 'array.5': 2 }
    params = filterParser(params)
    assert.equal('number', typeof params['array.5'])
  })

  test('should correctly parse array index queries with mongo operators', () => {
    let params = { 'array.5': { $exists: true } }
    params = filterParser(params)
    assert.equal('object', typeof params['array.5'])
  })

  test('should correctly parse schemata arrays', () => {
    let params = { schemataArray: [ { a: '1' }, { b: '2' } ] }
    params = filterParser(params)
    assert(params.schemataArray instanceof Array)
  })

  test('should correctly parse objects that are of type String', () => {
    let params = { string: { a: 1, b: 2 } }
    params = filterParser(params)
    assert.equal(typeof params.string.a, 'string')
  })

  test('should parse $size to number', () => {
    let params = { string: { $size: '0' } }
    params = filterParser(params)
    assert.equal(typeof params.string.$size, 'number')
  })

  test('should correctly parse arrays that are of type String', () => {
    let params = { string: [ 1, 2, 3 ] }
    params = filterParser(params)
    assert.equal('string', typeof params.string[0])
  })

  test('should not error on null', () => {
    const params = filterParser({ number: null })
    assert.equal(null, params.number)
  })

  test('should not throw for keys that start with $', () => {
    assert.doesNotThrow(() => {
      filterParser({ $or: [] })
    }, /Cannot read property 'type' of undefined/)
  })

  test('should work for keys that start with $', () => {
    let params = { $or: [ { string: 1 } ] }
    params = filterParser(params)
    assert.equal(typeof params.$or[0].string, 'string')
  })

  test('should recursively for keys that start with $', () => {
    let params = { $or: [ { string: { $in: [ 1 ] } }, { string: { $size: 0 } } ] }
    params = filterParser(params)
    assert.equal(params.$or[0].string.$in[0], '1')
    assert.equal(params.$or[1].string.$size, '0')
  })

  test('should correctly parse dates in mongo operators', () => {
    let params = { date: { $eq: '2013-04-17T14:36:55.648Z' } }
    params = filterParser(params)
    assert(params.date.$eq instanceof Date)
  })
})

const schemata = require('schemata')
const createFilterParser = require('../filter-parser')
const assert = require('assert')

describe('filter parser', () => {
  const filterParser = createFilterParser(createSchema())

  it('should correctly parse strings', () => {
    let params = { string: 'String' }
    params = filterParser(params)
    assert.equal('string', typeof params.string)
  })

  it('should correctly parse dates', () => {
    let params = { date: '2013-04-17T14:36:55.648Z' }
    params = filterParser(params)
    assert(params.date instanceof Date)
  })

  it('should correctly parse booleans', () => {
    let params = { bool: 'true' }
    params = filterParser(params)
    assert.equal('boolean', typeof params.bool)
  })

  it('should correctly parse numbers', () => {
    let params = { number: '100' }
    params = filterParser(params)
    assert.equal('number', typeof params.number)
  })

  it('should correctly parse objects', () => {
    let params = { object: { key: 'value' } }
    params = filterParser(params)
    assert.equal('object', typeof params.object)
  })

  it('should correctly parse arrays', () => {
    let params = { array: [ 1, 2, 3 ] }
    params = filterParser(params)
    assert(params.array instanceof Array)
  })

  it('should correctly parse schemata arrays', () => {
    let params = { schemataArray: [ { a: '1' }, { b: '2' } ] }
    params = filterParser(params)
    assert(params.schemataArray instanceof Array)
  })

  it('should correctly parse objects that are of type String', () => {
    let params = { string: { a: 1, b: 2 } }
    params = filterParser(params)
    assert.equal(typeof params.string.a, 'string')
  })

  it('should parse $size to number', () => {
    let params = { string: { $size: '0' } }
    params = filterParser(params)
    assert.equal(typeof params.string.$size, 'number')
  })

  it('should correctly parse arrays that are of type String', () => {
    let params = { string: [ 1, 2, 3 ] }
    params = filterParser(params)
    assert.equal('string', typeof params.string[0])
  })

  it('should not error on null', () => {
    let params = { number: null }
    params = filterParser(params)
    assert.equal(null, params.number)
  })

  it('should not throw for keys that start with $', () => {
    assert.doesNotThrow(() => {
      let params = { $or: [] }
      params = filterParser(params)
    }, /Cannot read property 'type' of undefined/)
  })

  it('should work for keys that start with $', () => {
    let params = { $or: [ { string: 1 } ] }
    params = filterParser(params)
    assert.equal(typeof params.$or[0].string, 'string')
  })

  it('should recursively for keys that start with $', () => {
    let params = { $or: [ { string: { $in: [ 1 ] } }, { string: { $size: 0 } } ] }
    params = filterParser(params)
    assert.equal(params.$or[0].string.$in[0], '1')
    assert.equal(params.$or[1].string.$size, '0')
  })
})

function createSchema () {
  return schemata(
    { string: { type: String },
      date: { type: Date },
      bool: { type: Boolean },
      number: { type: Number },
      object: { type: Object },
      array: { type: Array },
      schemataArray: { type: schemata.Array(schemata({})) }
    })
}

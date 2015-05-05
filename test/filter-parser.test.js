var schemata = require('schemata')
  , createFilterParser = require('../filter-parser')
  , assert = require('assert')

describe('filter parser', function () {

  var filterParser = createFilterParser(createSchema())

  it('should correctly parse strings', function () {
    var params = { string: 'String' }
    params = filterParser(params)
    assert.equal('string', typeof params.string)
  })

  it('should correctly parse dates', function () {
    var params = { date: '2013-04-17T14:36:55.648Z' }
    params = filterParser(params)
    assert(params.date instanceof Date)
  })

  it('should correctly parse booleans', function () {
    var params = { bool: 'true' }
    params = filterParser(params)
    assert.equal('boolean', typeof params.bool)
  })

  it('should correctly parse numbers', function () {
    var params = { number: '100' }
    params = filterParser(params)
    assert.equal('number', typeof params.number)
  })

  it('should correctly parse objects', function () {
    var params = { object: { key: 'value' } }
    params = filterParser(params)
    assert.equal('object', typeof params.object)
  })

  it('should correctly parse arrays', function () {
    var params = { array: [ 1, 2, 3 ] }
    params = filterParser(params)
    assert(params.array instanceof Array)
  })

  it('should correctly parse schemata arrays', function () {
    var params = { schemataArray: [ { a: '1' }, { b: '2' } ] }
    params = filterParser(params)
    assert(params.schemataArray instanceof Array)
  })

  it('should correctly parse objects that are of type String', function () {
    var params = { string: { a: 1, b: 2 } }
    params = filterParser(params)
    assert.equal('string', typeof params.string.a)
  })

  it('should correctly parse arrays that are of type String', function () {
    var params = { string: [ 1, 2, 3 ] }
    params = filterParser(params)
    assert.equal('string', typeof params.string[0])
  })

  it('should not error on null', function () {
    var params = { number: null }
    params = filterParser(params)
    assert.equal(null, params.number)
  })

  it('should not error on unknown property', function () {
    assert.doesNotThrow(function () {
      filterParser({ unknown: 'this should not error' })
    })
  })

  it('should not error on unknown nested property', function () {
    assert.doesNotThrow(function () {
      filterParser({ string: { unknown: { string: 'this should not error'} } })
    })
  })

  it('should strip unknown properties', function () {
    assert.deepEqual(filterParser({ unknown: 'this should not error' }), {})
  })

})

function createSchema() {
  return schemata(
    { string: { type: String }
    , date: { type: Date }
    , bool: { type: Boolean }
    , number: { type: Number }
    , object: { type: Object }
    , array: { type: Array }
    , schemataArray: { type: schemata.Array(schemata({})) }
    })
}

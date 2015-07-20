module.exports = createService

var Service = require('crud-service')
  , save = require('save')
  , schemata = require('schemata')
  , validity = require('validity')
  , logger = require('mc-logger')

function createService() {
  return new Service('thing', save('thing', { logger: logger }), createSchema())
}

function createSchema() {
  return schemata(
    { _id: { type: String }
    , name: { type: String, validators: [ validity.required ] }
    })
}

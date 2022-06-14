const createCrudService = require('crud-service')
const save = require('save')
const schemata = require('schemata')
const required = require('validity-required')
const logger = require('mc-logger')

const createSchema = () =>
  schemata({
    name: 'Thing',
    properties: {
      _id: {
        type: String
      },
      name: {
        type: String,
        validators: [required]
      }
    }
  })

const createService = () =>
  createCrudService('thing', save('thing', { logger }), createSchema())

module.exports = createService

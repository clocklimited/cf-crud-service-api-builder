const createCrudService = require('@clocklimited/crud-service')
const save = require('save')
const schemata = require('@clocklimited/schemata')
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

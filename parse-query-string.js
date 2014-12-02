module.exports = parseQueryString

var extend = require('lodash.assign')

function parseQueryString(req, res, next) {
  try {
    req.query.filter = parseQueryStringObject(req.query.filter, {})
    req.query.sort = parseSortOptions(req.query.sort)
    req.query.pagination = parseQueryStringObject(req.query.pagination
      , { page: 1
        , pageSize: 50
        }
      )
    req.query.keywords = req.query.keywords || ''
    next()
  } catch (e) {
    return res.status(400).json(new Error('Invalid JSON'))
  }
}

function parseQueryStringObject(parameter, defaultValue) {
  if (!parameter) return defaultValue
  var result = JSON.parse(parameter)
  if (typeof result !== 'object') throw new Error('Invalid parameter provided ' + result)
  return extend({}, defaultValue, result)
}

function parseSortOptions(parameter) {
  if (!parameter) return undefined
  var rawOptions = JSON.parse(parameter)
    , sort = 'asc'
  if (!Array.isArray(rawOptions)) return undefined
  if (!rawOptions.length) return undefined
  if (typeof rawOptions[1] !== 'undefined') sort = rawOptions[1]
  return [ [ rawOptions[0], sort ] ]
}

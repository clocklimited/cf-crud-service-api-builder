module.exports = get

var parseQueryString = require('../parse-query-string')
  , createfilterParser = require('../filter-parser')

function get(service, urlRoot, router, logger, middleware) {

  router.get(urlRoot + '/:id', middleware, function (req, res) {
    service.read(req.params.id, function (error, entity) {
      if (error) {
        logger.error(error.stack)
        return res.status(400).json({ error: 'Error reading item from "' + service.name + '" service' })
      }
      if (!entity) return res.status(404).json({ status: 'Not found' })
      res.json(entity)
    })
  })

  router.get(urlRoot, middleware, parseQueryString, function (req, res) {
    logger.debug('GET received', JSON.stringify(req.query))

    var options = { sort: req.query.sort }
    if (!isNaN(req.query.pagination.pageSize)) {
      options.limit = req.query.pagination.pageSize
      if (!isNaN(req.query.pagination.page)) {
        options.skip = (req.query.pagination.page - 1) * req.query.pagination.pageSize
      }
    }

    var parseFilter = createfilterParser(service.schema)
    req.query.filter = parseFilter(req.query.filter)

    service.find(req.query.filter, options, function (error, data) {
      if (error) {
        logger.error(error.stack)
        return res.status(400).json({ error: 'Error finding items from "' + service.name + '" service' })
      }
      service.count(req.query.filter, function (err, count) {
        if (error) {
          logger.error(error.stack)
          return res.status(400).json({ error: 'Error finding items from "' + service.name + '" service' })
        }
        res.json(
          { results: data
          , page: req.query.pagination.page
          , pageSize: req.query.pagination.pageSize
          , totalItems: count
          })
      })
    })
  })

}

const parseQueryString = require('../parse-query-string')
const createfilterParser = require('../filter-parser')

function get (service, urlRoot, router, logger, middleware, emit, hooks) {
  router.get(urlRoot + '/:id', middleware, function (req, res) {
    service.read(req.params.id, function (error, entity) {
      if (error) {
        logger.error(error.stack)
        return res.status(400).json({ error: 'Error reading item from "' + service.name + '" service' })
      }
      if (!entity) return res.status(404).json({ status: 'Not found' })
      hooks['read:response'].run(entity, function (error, postHookEntity) {
        if (error) {
          var message = 'Error running response hook for "' + service.name + '" service'
          return res.status(400).json({ error: message })
        }
        res.status(200).json(postHookEntity)
      })
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
      service.count(req.query.filter, function (error, count) {
        if (error) {
          logger.error(error.stack)
          return res.status(400).json({ error: 'Error finding items from "' + service.name + '" service' })
        }

        hooks['read:response'].run(data, function (error, postHookData) {
          if (error) {
            var message = 'Error running response hook for "' + service.name + '" service'
            return res.status(400).json({ error: message })
          }
          res.json(
            { results: postHookData,
              page: req.query.pagination.page,
              pageSize: req.query.pagination.pageSize,
              totalItems: count
            })
        })
      })
    })
  })
}

module.exports = get

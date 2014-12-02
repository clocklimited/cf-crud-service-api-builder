module.exports = post

function post(service, urlRoot, router, logger, middleware) {

  router.post(urlRoot, middleware, function (req, res) {
    logger.debug('POST received', JSON.stringify(req.body))
    service.create(req.body, function (error, newObject) {
      if (error) {
        res.status(400).json(error)
      } else {
        res.status(201).json(newObject)
      }
    })
  })

}

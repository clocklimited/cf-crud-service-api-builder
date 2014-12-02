module.exports = patch

function patch(service, urlRoot, router, logger, middleware) {

  router.patch(urlRoot + '/:id', middleware, function (req, res) {
    logger.debug('PATCH received', JSON.stringify(req.body))
    req.body._id = req.params.id
    service.partialUpdate(req.body, {}, function (error, updatedObject) {
      if (error) {
        res.status(400).json(error)
      } else {
        res.status(200).json(updatedObject)
      }
    })
  })

}

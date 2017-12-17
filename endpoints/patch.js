function patch (service, urlRoot, router, logger, middleware, emit, hooks) {
  router.patch(urlRoot + '/:id', middleware, function (req, res) {
    logger.debug('PATCH received', JSON.stringify(req.body))
    req.body._id = req.params.id

    hooks['partialUpdate:request'].run(req.body, function (error, postHookBody) {
      if (error) return res.status(400).json(error)
      service.partialUpdate(postHookBody, {}, function (error, updatedObject) {
        if (error) {
          res.status(400).json(error)
        } else {
          emit('partialUpdate', req, updatedObject)
          hooks['partialUpdate:response'].run(updatedObject, function (error, postHookUpdatedObject) {
            if (error) return res.status(400).json(error)
            res.status(200).json(postHookUpdatedObject)
          })
        }
      })
    })
  })
}

module.exports = patch

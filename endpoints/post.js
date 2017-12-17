function post (service, urlRoot, router, logger, middleware, emit, hooks) {
  router.post(urlRoot, middleware, function (req, res) {
    logger.debug('POST received', JSON.stringify(req.body))
    hooks['create:request'].run(req.body, function (error, postHookBody) {
      if (error) return res.status(400).json(error)
      service.create(postHookBody, function (error, newObject) {
        if (error) {
          res.status(400).json(error)
        } else {
          emit('create', req, newObject)
          hooks['create:response'].run(newObject, function (error, postHookNewObject) {
            if (error) return res.status(400).json(error)
            res.status(201).json(postHookNewObject)
          })
        }
      })
    })
  })
}

module.exports = post

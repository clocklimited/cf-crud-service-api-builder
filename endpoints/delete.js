module.exports = del

function del(service, urlRoot, router, logger, middleware, emit) {

  router.delete(urlRoot + '/:id', middleware, function (req, res) {
    logger.debug('DELETE received', req.params.id)
    service['delete'](req.params.id, function (error) {
      if (error) {
        if (error.message.match(/No object found with/)) {
          res.status(404).json({ status: 'Not found' })
        } else {
          res.status(400).json(error)
        }
      } else {
        emit('DELETE', req)
        res.send(204)
      }
    })
  })

}

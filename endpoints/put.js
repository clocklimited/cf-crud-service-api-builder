const async = require('async')

function put (service, urlRoot, router, logger, middleware, emit, hooks) {
  // Optional :id url param to allow for arrays to be PUT
  router.put(urlRoot + '/:id?', middleware, function (req, res) {
    logger.info('PUT received', JSON.stringify(req.body))

    // Check if PUT request body is an array and casting if not
    if (!Array.isArray(req.body)) {
      if (req.params.id !== req.body._id) {
        return res.status(400).json({ errors: { id: 'Mismatch' } })
      }

      req.body = [ req.body ]
    }

    var updateError = false

    function update (body, cb) {
      service.update(body, {}, (error, updatedObject) => {
        if (error) {
          if (error.errors) {
            updateError = true

            // Only appending _id to errors object if id isnt in URL
            if (!req.params.id) {
              error = Object.assign({ _id: body._id }, error)
            }
            cb(null, error)
          } else {
            cb(error)
          }
        } else {
          emit('update', req, updatedObject)
          cb(null, updatedObject)
        }
      })
    }

    hooks['update:request'].run(req.body, function (error, postHookBody) {
      if (error) return res.status(400).json(error)
      async.map(postHookBody, update, function (error, updatedObjects) {
        if (error) return res.status(400).json(error)
        var status = updateError ? 400 : 200
        hooks['update:response'].run(updatedObjects, function (error, postHookUpdatedObject) {
          if (error) return res.status(400).json(error)
          // If array has a length of 1 then only return first item
          res.status(status).json(postHookUpdatedObject.length === 1 ? postHookUpdatedObject[0] : postHookUpdatedObject)
        })
      })
    })
  })
}

module.exports = put

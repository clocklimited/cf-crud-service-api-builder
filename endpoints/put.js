module.exports = put

var async = require('async')
  , extend = require('lodash.assign')

function put(service, urlRoot, router, logger, middleware, emit) {

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

    function update(body, cb) {
      service.update(body, {}, function (error, updatedObject) {
        if (error) {
          updateError = true

          // Only appending _id to errors object if id isnt in URL
          if (!req.params.id) {
            error = extend({ _id: body._id }, error)
          }
          cb(null, error)
        } else {
          emit('PUT', req, updatedObject)
          cb(null, updatedObject)
        }
      })
    }

    async.map(req.body, update, function (error, updatedObjects) {
      var status = updateError ? 400 : 200
      // If array has a length of 1 then only return first item
      res.status(status).json(updatedObjects.length === 1 ? updatedObjects[0] : updatedObjects)
    })
  })

}

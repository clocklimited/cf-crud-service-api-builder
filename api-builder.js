const routes = {
  get: require('./endpoints/get'),
  post: require('./endpoints/post'),
  put: require('./endpoints/put'),
  patch: require('./endpoints/patch'),
  'delete': require('./endpoints/delete')
}
const EventEmitter = require('events').EventEmitter
const createPipe = require('piton-pipe').createPipe

function buildApi (service, urlRoot, router, logger, middleware, verbs) {
  function Api () {
    EventEmitter.call(this)
  }

  Api.prototype = Object.create(EventEmitter.prototype)

  const hooks = {
    'create:request': createPipe(),
    'create:response': createPipe(),
    'read:response': createPipe(),
    'update:request': createPipe(),
    'update:response': createPipe(),
    'partialUpdate:request': createPipe(),
    'partialUpdate:response': createPipe()
  }

  Api.prototype.hook = function (name, fn) {
    if (!hooks[name]) throw new Error('No hook exists for: ' + name)
    hooks[name].add(fn)
  }

  const api = new Api()

  if (!Array.isArray(middleware) && typeof middleware !== 'function') throw new Error('Middleware is not defined')

  // Support all verbs by default
  if (!Array.isArray(verbs)) verbs = [ 'get', 'post', 'put', 'patch', 'delete' ]

  // Create endpoints
  verbs.forEach(function (verb) {
    routes[verb](service, urlRoot, router, logger, middleware, api.emit.bind(api), hooks)
  })

  return api
}

module.exports = buildApi

# @clocklimited/cf-crud-service-api-builder

Build an HTTP API for a [@clocklimited/crud-service](https://github.com/clocklimited/crud-service).

## Installation

    npm install --save @clocklimited/cf-crud-service-api-builder

## Usage

```js
const crudServiceApiBuilder = require('cf-crud-service-api-builder')
const router = require('express')()
const logger = require('bunyan').createLogger()
const service = require('./service')
const middleware = require('./auth-check-middleware')

crudServiceApiBuilder(service, '/widgets', router, logger, middleware)
```

### Hooks

When using the api builder, you can hook into certain actions to manipulate the request data before it is sent to the database or the response data before it is sent to the requester.

```js
const api = crudServiceApiBuilder(
  service,
  '/article',
  router,
  logger,
  middleware
)

api.hook('create:request', function (data, cb) {
  // do whatever you like with the data
  cb(null, data)
})
```

Supported hooks are:

- `create:request`
- `create:response`
- `read:response`
- `update:request`
- `update:response`
- `partialUpdate:request`
- `partialUpdate:response`

### Events

When using the api builder, you can listen for certain events so that you can add hooks to perform your own actions after a request has been succesful. e.g

```js
const api = crudServiceApiBuilder(
  service,
  '/article',
  router,
  logger,
  middleware
)

api.on('create', function (req, newArticle) {
  // do whatever you like with the req and article object
})
```

Supported events are:

- `create`
- `update`
- `partialUpdate`
- `delete`

## Credits

Built by developers at [Clock](http://clock.co.uk).

## Licence

Licensed under the [ISC](http://opensource.org/licenses/isc)

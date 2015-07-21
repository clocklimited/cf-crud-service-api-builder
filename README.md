# cf-crud-service-api-builder

Build an HTTP API for a [crud-service](https://github.com/serby/crud-service).

## Installation

    npm install --save cf-crud-service-api-builder

## Usage

```js
var crudServiceApiBuilder = require('cf-crud-service-api-builder')
  , router = require('express')()
  , logger = require('bunyan').createLogger()
  , service = require('./service')
  , middleware = require('./auth-check-middleware')

crudServiceApiBuilder(service, '/widgets', router, logger, middleware)
```

### Events

When using the api builder, you can listen for certain events so that you can add hooks to perform your own actions after a request has been succesful. e.g

```js

var api = crudServiceApiBuilder(service, '/article', router, logger, middleware)

api.on('create', function (req, newArticle) {
  // do whatever you like with the req and article object
})

```

Supported events are:

* `create`
* `update`
* `partialUpdate`
* `delete`

## Credits
Built by developers at [Clock](http://clock.co.uk).

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)

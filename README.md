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

## Credits
Built by developers at [Clock](http://clock.co.uk).

## Licence
Licensed under the [New BSD License](http://opensource.org/licenses/bsd-license.php)

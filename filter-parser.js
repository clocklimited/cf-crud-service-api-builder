const schemata = require('schemata')

function createFilterParser (schema) {
  const properties = schema.getProperties()
  function parseObject (object, parentKey) {
    var newObj = {}
    Object.keys(object).forEach(function (key) {
      let value = object[key]
      const ignoredTypes = [ Object, Array ]
      const type = getType(key, parentKey)

      // Skip ignored types and Schemata Arrays
      if (ignoredTypes.indexOf(type) === -1 && !type.arraySchema) {
        if (isMongoOperator(key) && Array.isArray(value)) {
          value = value.map(function (item) {
            // Recursively cast objects like `{ $in: [1, 2, 3 }`
            if (typeof item === 'object' && item !== null) return parseObject(item)

            // Do a simple cast if they arent objects
            return schemata.castProperty(type, item)
          })
        } else if (Array.isArray(value)) {
          value = value.map(function (item) {
            return schemata.castProperty(type, item)
          })
        } else if (typeof value === 'object' && value !== null) {
          value = parseObject(value, key)
        } else {
          // This needs to remain an int
          if (key === '$size') {
            value = Number(value)
          } else {
            value = schemata.castProperty(type, value)
          }
        }
      }
      newObj[key] = value
    })
    return newObj
  }

  function getType (key, parentKey) {
    if (isMongoOperator(key) || isMongoChildQuery(key)) {
      return {}
    } else if (parentKey) {
      return properties[parentKey].type
    } else {
      return properties[key].type
    }
  }

  // Key starts with $ e.g. $or, $and
  function isMongoOperator (key) {
    return key.match(/^\$/)
  }

  // Key contains a .
  function isMongoChildQuery (key) {
    return key.includes('.')
  }

  return parseObject
}

module.exports = createFilterParser

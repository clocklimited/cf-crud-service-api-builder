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
            return schema.castProperty(type, item)
          })
        } else if (Array.isArray(value)) {
          value = value.map(function (item) {
            return schema.castProperty(type, item)
          })
        } else if (typeof value === 'object' && value !== null) {
          value = parseObject(value, key)
        } else {
          // This needs to remain an int
          if (key === '$size') {
            value = Number(value)
          } else {
            value = schema.castProperty(type, value)
          }
        }
      }
      newObj[key] = value
    })
    return newObj
  }

  function getType (key, parentKey) {
    if (parentKey) {
      return properties[parentKey].type
    } else if (isMongoOperator(key)) {
      return {}
    } else {
      return properties[key].type
    }
  }

  // Key starts with $ e.g. $or, $and
  function isMongoOperator (key) {
    return key.match(/^\$/)
  }

  return parseObject
}

module.exports = createFilterParser

module.exports = createFilterParser

function createFilterParser(schema) {

  function parseObject(object, parentKey) {
    var newObj = {}
    Object.keys(object).forEach(function (key) {
      var value = object[key]
        , ignoredTypes = [ Object, Array ]
        , type = getType(key, parentKey)

      // Skip ignored types and Schemata Arrays
      if (ignoredTypes.indexOf(type) === -1 && !type.arraySchema) {
        if (isMongoOperator(key) && Array.isArray(value)) {
          value = value.map(function (item) {
            // Recursively cast objects like `{ $in: [1, 2, 3 }`
            if (typeof item === 'object' && null !== item) return parseObject(item)

            // Do a simple cast if they arent objects
            return schema.castProperty(type, item)
          })
        } else if (Array.isArray(value)) {
          value = value.map(function (item) {
            return schema.castProperty(type, item)
          })
        } else if (typeof value === 'object' && null !== value) {
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

  function getType(key, parentKey) {
    if (parentKey) {
      return schema.schema[parentKey].type
    } else if (isMongoOperator(key)) {
      return {}
    } else {
      return schema.schema[key].type
    }
  }

  // Key starts with $ e.g. $or, $and
  function isMongoOperator(key) {
    return key.match(/^\$/)
  }

  return parseObject
}

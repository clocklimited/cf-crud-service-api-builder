module.exports = createFilterParser

function createFilterParser(schema) {

  function parseObject(object, parentKey) {
    var newObj = {}
    Object.keys(object).forEach(function (key) {
      var value = object[key]
        , ignoredTypes = [ Object, Array ]
        , type = null

      try {
        if (parentKey) {
          type = schema.schema[parentKey].type
        } else {
          type = schema.schema[key].type
        }
      } catch(e) {
        return
      }

      // Skip ignored types and Schemata Arrays
      if (ignoredTypes.indexOf(type) === -1 && !type.arraySchema) {
        if (Array.isArray(value)) {
          var newValue = []
          value.forEach(function (item) {
            newValue.push(schema.castProperty(type, item))
          })
          value = newValue
        } else if (typeof value === 'object' && null !== value) {
          value = parseObject(value, key)
        } else {
          value = schema.castProperty(type, value)
        }
      }
      newObj[key] = value
    })
    return newObj
  }

  return parseObject
}

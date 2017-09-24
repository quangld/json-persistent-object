/**
 * JSON Persistent Object (JSONPO)
 *   JSONPO object loads object from a json file
 *   detects any properties (even children's properties) changed and save it back to that file
 *   This is written using Proxy Object implemented in ES6, so nodejs v6.00 or above is required
 * @require: nodejs v6.0 or greater
 * @author: Quang Le
 * @since: September 17, 2016
 **/
'use strict'
var fs = require('fs')

/**
 * @param data  if data is a string, it's a json file where the object is gotten data from and saved to
 *              if data is an object, it's the object will be covered by this Proxy
 *              else throw error
 * @param parent is either null or JSONPO object. It iss the parent of data
 *              if data is a string, parent will be ignored!
 *
 * @return JSONPO a Proxy object for data or data loaded from a json file
 */
var JSONPO = function (data, parent) {
  var DATE_FORMAT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/
  // Since date is stringified to a 'string', this function converts it back to a DATE while parsing
  function dateParser (key, value) {
    return (typeof value === 'string' && DATE_FORMAT.test(value)) ? new Date(value) : value
  }

  var filename = null
  var converting = false
  if (typeof data === 'string') {
    filename = data
    try {
      fs.accessSync(filename, fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK)
      // readFileSync is recommended, since we only need to read json file once
      data = JSON.parse(fs.readFileSync(filename), dateParser)
    } catch (err) {
      switch (err.code) {
        case 'ENOENT': // if file is not exist
          data = {}
          break
        default:
          console.error(err)
          throw err
      }
    }
  }
  if (typeof data !== 'object') {
    throw new Error('filename or object is required')
  }

  // create a proxy to watch for changes in data object
  let proxy = new Proxy(data, {
    /** this is called when the properties of proxy is changed */
    set: function (obj, prop, value, receiver) {
      // when an object is assigned, turn it into a JSONPO to monitor its changes
      obj[prop] = (typeof value !== 'object') ? value : (value instanceof Date) ? value : new JSONPO(value, this)
      // ignore the .length changed when an Array is updated
      if ((prop === 'length') && (typeof obj === 'object')) return true
      this.__save()
      return true
    },

    deleteProperty: function (target, prop) {
      if (target instanceof Array) {
        target.splice(prop, 1)
        this.__save()
      } else if (prop in target) {
        this.__save()
      }
      return true
    },

    __save: function () {
      if (filename !== null) { // I'm at root, so write data to file
        if (converting) return
        // using writeFileSync to prevent object got changed before written to file
        try {
          fs.writeFileSync(filename, JSON.stringify(data, null, 2))
        } catch (err) {
          throw err
        }
      } else {
        parent.__save()
      }
    }

  })

  converting = true // prevent writing to file while converting children objects
  for (let p in data) {
    if (typeof data[p] === 'object') {
      // turns children objects to JSONPO objects by assign it to the proxy
      // the setter function above will be called
      proxy[p] = data[p]
    }
  }
  converting = false

  return proxy
}

module.exports = JSONPO

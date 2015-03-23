'use strict';

var API_VERSION = process.env.API_VERSION
var API_PORT

if (!API_VERSION) {

  // If API_VERSION is undefined and app is in production mode
  if (process.env.NODE_ENV === 'production') {
    throw new Error('API version not defined.')
  } else {

    API_VERSION = 'v1'

    console.log('Warning: API version not defined. ' +
                'Defaulting to \'' + API_VERSION + '\'.')
  }
}

if (process.env.NODE_ENV == 'production') {
  API_PORT = 33841
} else {
  API_PORT = 3000
}

var baseUrl = 'http://localhost:' + API_PORT + '/' + API_VERSION

module.exports = baseUrl

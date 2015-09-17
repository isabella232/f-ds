'use strict';

var request = require('request')

var API_VERSION = 'v1'

var API_PORT

if (process.env.NODE_ENV == 'production') {

  API_PORT = process.env.API_PORT || 33841

} else {

  API_PORT = process.env.API_PORT || 3000

}

var baseUrl = 'http://localhost:' + API_PORT + '/' + API_VERSION

module.exports = request.defaults({ baseUrl: baseUrl, json: true })

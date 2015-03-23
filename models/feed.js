'use strict';

var request = require('request')

var BASEURL = require('../baseurl')

function getFeed(callback) {
  request(BASEURL + '/feed', function (err, response, body) {
    if (!err && response.statusCode == 200) {
      console.log(body) // Show the JSON response
    }
  })
}

var FeedModel =
  { get : getFeed
  }

module.exports = FeedModel

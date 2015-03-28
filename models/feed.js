'use strict';

var Request = require('../baserequest')

function getFeed(callback) {
  Request.get(
    { uri: '/feed'
    }, function (err, response, body) {

      callback(err, body)
    }
  )
}

var FeedModel =
  { get : getFeed
  }

module.exports = FeedModel

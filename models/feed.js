'use strict';

var Request = require('../config/baserequest')

function getFeed(callback) {
  Request.get('/feed', function(err, res, body) {
    if (err) {
      callback(err)
    } else if (body.code !== 200)  {
      err = new Error(body.message)
      err.code = body.code
      callback(err)
    } else {
      callback(null, body.feed)
    }
  })
}

var FeedModel =
  { get : getFeed
  }

module.exports = FeedModel

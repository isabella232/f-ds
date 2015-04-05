'use strict';

var BackendAPI = require('../config/backend/api')

module.exports = function(router) {
  router.get('/feed', function(req, res) {
    BackendAPI.feed.get({}, function(err, clientErr, feed) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        console.trace('Error: client error on feed: ' + clientErr)
        res.render('500.html')
      } else {
        res.render('feed.html', { feed: feed.feed })
      }
    })
  })
}


module.exports = function(router) {

  'use strict';

  var API = require('../config/backend/api')

  function handleFeedFetch(req, res) {
    API.feed.get({}, function(err, clientErr, feed) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        // Backend's route of "GET /feed" is specified to never return a client
        // error.  It should never happen.  If we get one, then this is an
        // internal server error.
        console.trace('Error: client error on feed: ' + clientErr)
        res.render('500.html')
      } else {
        res.render('feed.html', { feed: feed.feed })
      }
    })
  }

  router.get('/feed', handleFeedFetch)

}


module.exports = function(router) {

  'use strict';

  var API = require('../models/api')

  function handleFeedFetch(req, res) {
    API.feed.get(function(err, feed) {
      if (err) {

        // (TEMP)
        console.error(err)
      } else {

        res.render('feedView.html', { feed: feed })

      }

    })
  }

  router.get('/feed', handleFeedFetch)

}

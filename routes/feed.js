
module.exports = function(router) {

  'use strict';

  var Feed = require('../models/feed')

  function handleIndexFetch(req, res) {
    Feed.get(function(err, body) {

      if (err) {

        // (TEMP)
        console.error(err)
      } else {
        if (body.code >= 400 && body.code < 600) {

          // (TEMP)
          console.log(body.message)
        } else {

          res.render('index.html',
            { feed: body.feed

            }
          )
        }
      }

    })
  }

  router.get('/', handleIndexFetch)

}

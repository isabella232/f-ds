
module.exports = function(router) {

  'use strict';

  var Feed = require('../models/feed')

  function handleIndexFetch(req, res) {
    Feed.get()
  }

  router.get('/', handleIndexFetch)

}

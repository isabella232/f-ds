
module.exports = function(router) {

  'use strict';

  var async = require('async')

  var API = require('../config/backend/api')

  function handleFeedFetch(req, res) {
    API.feed.get({}, function(err, clientErr, feed) {
      if (err) {
        console.error(err.stack)
        res.render('500.html', {error: err})
      } else if (clientErr) {
        // Backend's route of "GET /feed" is specified to never return a client
        // error.  It should never happen.  If we get one, then this is an
        // internal server error.
        console.trace('Error: client error on feed: ' + clientErr)
        res.render('500.html', {error: clientErr})
      } else {
        var questionIds = []
        for (var i = 0; i < feed.feed.length; i++) {
          questionIds.push(feed.feed[i].question)
        }
        async.map(
          questionIds
        , function(questionId, callback) {
            API.question.get({ question: questionId }, function(err, clientErr, question) {
              if (err) {
                console.error(err.stack)
                res.render('500.html', {error: err})
                callback(err, question)
              } else if (clientErr) {
                console.trace('Error: client error on question: ' + clientErr)
                res.render('404.html', {error: clientErr})
                callback(err, question)
              } else {
                callback(null, question)
              }
            })
          } 
        , function(err, results) {
            if (err) {
              return
            } else {
              for (var i = 0; i < feed.feed.length; i++) {
                var totalVotes = 0
                for (var j = 0; j < results[i].answers.length; j++) {
                  totalVotes += results[i].answers[j].votes
                }
                feed.feed[i].totalVotes = totalVotes
              }
              res.render('feed.html', { feed: feed.feed })
            }
          }
        )
      }
    })
  }

  router.get('/feed', handleFeedFetch)

}

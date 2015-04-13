
module.exports = function(router) {

  'use strict';

  var API = require('../config/backend/api')

  var async = require('async')

  function handleStoryFetch(req, res) {

    var storyId = req.params.storyId

    API.story.get({story: storyId }, function(err, clientErr, story) {
      if (err) {
        console.error(err.stack)
        res.render('500.html', {error: err})
      } else if (clientErr) {
        console.trace('Error: client error on story: ' + clientErr)
        res.render('404.html', {error: clientErr})
      } else {
        API.question.get({ question: story.question }, function(err, clientErr, question) {
          if (err) {
            console.error(err.stack)
            res.render('500.html', {error: err})
          } else if (clientErr) {
            console.trace('Error: client error on question: ' + clientErr)
            res.render('404.html', {error: clientErr})
          } else {
            question.totalVotes = 0
            for (var i = 0; i < question.answers.length; i++) {
              question.totalVotes += question.answers[i].votes 
            }
            res.render('story.html', { story: story, question: question })
          }
        })  
      } 
    })
  }

  router.get('/story/:storyId', handleStoryFetch)

}

'use strict';

var Async        = require('async')

var API          = require('./config/backend/api')
var CookieConfig = require('./config/cookie')

function renderStatic(template) {
  return function(req, res) {
    res.render(template)
  }
}

function renderIfToken(template, redirectTo) {
  return function(req, res) {
    if (req.signedCookies.token) {
      res.render(template)
    } else {
      res.redirect(redirectTo)
    }
  }
}

function renderIfNoToken(template, redirectTo) {
  return function(req, res) {
    if (!req.signedCookies.token) {
      res.render(template)
    } else {
      res.redirect(redirectTo)
    }
  }
}

function feed(req, res) {
  renderFeed(res)
}

function renderFeed(res, previousClientError) {
  // Get the list of stories.
  API.feed.get({}, function(err, clientErr, feed) {
    if (err) {
      console.error(err.stack)
      res.render('500.html', { error: err })
    } else if (clientErr) {
      // Backend's route of "GET /feed" is specified to never return a client
      // error.  It should never happen.  If we get one, then this is an
      // internal server error.
      console.trace('Error: client error on feed: ' + clientErr)
      res.render('500.html', { error: clientErr })
    } else {
      var questionIds = []
      for (var i = 0; i < feed.feed.length; i++) {
        questionIds.push(feed.feed[i].question)
      }
      // For each story, get its question.
      Async.map(
        questionIds
      , function(questionId, callback) {
          API.question.get(
            { question: questionId }
          , function(err, clientErr, question) {
              if (err) {
                console.error(err.stack)
                res.render('500.html')
                callback(err)
              } else if (clientErr) {
                res.render('404.html', { error: clientErr })
                callback(clientErr)
              } else {
                callback(null, question)
              }
            }
          )
        }
      , function(err, results) {
          if (err) {
            // We had an error and either 500.html or 404.html was already
            // rendered.
            return
          } else {
            // Calculate total votes for each question.
            for (var i = 0; i < feed.feed.length; i++) {
              var totalVotes = 0
              for (var j = 0; j < results[i].answers.length; j++) {
                totalVotes += results[i].answers[j].votes
              }
              feed.feed[i].totalVotes = totalVotes
            }
            res.render(
              'feed.html'
            , { feed: feed.feed, error: previousClientError }
            )
          }
        }
      )
    }
  })
}

function userCreate(req, res) {

  var username  = req.body.username
    , email     = req.body.email
    , password  = req.body.password

  API.user.create({username: username, email: email, password: password}
  , function(err, clientErr, user) {
      if (err) {
        res.render('500.html')
      } else if (clientErr) {
        res.render('signup.html', { error: clientErr })
      } else {
        var options = CookieConfig.options
        options.maxAge = user.ttl
        res.cookie('token', user.token, options)
        res.redirect('/feed')

      }
    }
  )
}

function userLogin(req, res) {

  var usernameEmail = req.body.usernameEmail
    , password      = req.body.password

  API.user.login({usernameemail: usernameEmail, password: password}
  , function(err, clientErr, user) {
      if (err) {
        res.render('500.html')
      } else if (clientErr) {
        res.render('login.html', { error: clientErr })
      } else {

        var options = CookieConfig.options
        options.maxAge = user.ttl
        res.cookie('token', user.token, options)

        res.redirect('/feed')
      }
    }
  )
}

function userDelete(req, res) {
  API.user.delete({token: req.signedCookies.token}
  , function(err, clientErr, user) {
      if (err) {
        res.render('500.html')
      } else if (clientErr) {
        res.render('profile.html', { error: clientErr })
      } else {

        res.clearCookie('token')
        res.redirect('/feed')

      }
    }
  )
}

function userChangePassword(req, res) {

  var oldPassword     = req.body.oldPassword
    , newPassword     = req.body.newPassword
    , confirmPassword = req.body.confirmPassword

  API.user.changePassword(
    { token           : req.signedCookies.token
    , oldPassword     : oldPassword
    , newPassword     : newPassword
    , confirmPassword : confirmPassword
    }
  , function(err, clientErr) {
      if (err) {
        res.render('500.html')
      } else if (clientErr) {
        res.render('profile.html', { error: clientErr })
      } else {
        res.redirect('/feed')

      }
    }
  )
}

function userLogout(req, res) {

  if (req.signedCookies.token) {

    API.user.logout({ token: req.signedCookies.token }
    , function(err) {
      if (err) {
        res.render('500.html')
        return
      } else {

        // We don't explicitly handle clientErr because client errors
        // happens only when the session has expired in the database
        res.clearCookie('token')
        res.redirect('/feed')
      }

    })
  } else {
    res.redirect('/feed')
  }
}

function storyCreate(req, res) {
  API.question.create(
    { token   : req.signedCookies.token
    , title   : req.body.question
    , answers :
      [ req.body.answer0
      , req.body.answer1
      , req.body.answer2
      , req.body.answer3
      , req.body.answer4
      ]
    }
  , function(err, clientErr, question) {
      if (err) {
        res.render('500.html')
      } else if (clientErr) {
        res.render('create.html', { error: clientErr })
      } else {
        API.story.create(
          { token     : req.signedCookies.token
          , title     : req.body.title
          , narrative : req.body.narrative
          , question  : question.question
          }
        , function(err, clientErr, story) {
            if (err) {
              res.render('500.html')
            } else if (clientErr) {
              res.render('create.html', { error: clientErr })
            } else {
              res.redirect('/story/' + story.story)
            }
          }
        )
      }
    }
  )
}

function renderStoryFetch(storyId, res, previousClientError) {
  API.story.get(
    { story: storyId }
  , function(err, clientErr, story) {
      if (err) {
        console.error(err.stack)
        res.render('500.html', { error: err })
      } else if (clientErr) {
        console.trace('Error: client error on story: ' + clientErr)
        res.render('404.html', { error: clientErr })
      } else {
        API.question.get(
          { question: story.question }
        , function(err, clientErr, question) {
            if (err) {
              console.error(err.stack)
              res.render('500.html', { error: err })
            } else if (clientErr) {
              console.trace('Error: client error on question: ' + clientErr)
              res.render('404.html', { error: clientErr })
            } else {
              story.storyId = storyId
              question.totalVotes = 0
              for (var i = 0; i < question.answers.length; i++) {
                question.totalVotes += question.answers[i].votes
              }
              res.render(
                'story.html'
              , { story: story, question: question, error: previousClientError }
              )
            }
          }
        )
      }
    }
  )
}

function storyDelete(req, res) {
  API.story.delete(
    { token : req.signedCookies.token
    , story : req.params.storyId
    }
  , function(err, clientErr) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        renderStoryFetch(req.params.storyId, res, clientErr)
      } else {
        renderFeed(res, 'Story deleted.')
      }
    }
  )
}

function storyFetch(req, res) {
  renderStoryFetch(req.params.storyId, res)
}

function storyVote(req, res) {
  API.story.get(
    { story: req.params.storyId }
  , function(err, clientErr, story) {
      if (err) {
        console.error(err.stack)
        res.render('500.html', { error: err })
      } else if (clientErr) {
        // The user tried to vote on a story that doesn't exist anymore.
        res.render('404.html', { error: err })
      } else {
        API.question.vote(
          { 'token'    : req.signedCookies.token
          , 'question' : story.question
          , 'answer'   : req.params.answer
          , 'story'    : req.params.storyId
          }
        , function(err, clientErr) {
            if (err) {
              console.error(err.stack)
              res.render('500.html', { error: err })
            } else if (clientErr) {
              // There was a problem with the user voting on this question.
              renderStoryFetch(req.params.storyId, res, clientErr)
            } else {
              res.redirect('/story/' + req.params.storyId)
            }
          }
        )
      }
    }
  )
}

module.exports = function(router) {

  router.get('/',               renderIfNoToken('welcome.html', '/feed'))
  router.get('/user/profile',   renderIfToken  ('profile.html', '/'))
  router.get('/user/login',     renderIfNoToken('login.html',   '/feed'))
  router.get('/user/signup',    renderIfNoToken('signup.html',  '/feed'))
  router.get('/story/create',   renderIfToken  ('create.html',  '/'))
  router.get('/about',          renderStatic   ('about.html'))
  router.get('/about/toupp',    renderStatic   ('legalDocs/toupp.html'))
  router.get('/about/dmca',     renderStatic   ('legalDocs/dmca.html'))

  router.get('/story/:storyId', storyFetch)
  router.get('/feed',           feed)

  router.post('/user/changepassword', userChangePassword)
  router.post('/user/delete',         userDelete)
  router.post('/user/login',          userLogin)
  router.post('/user/logout',         userLogout)
  router.post('/user/signup',         userCreate)

  router.post('/story/create',                storyCreate)
  router.post('/story/:storyId/vote/:answer', storyVote)

  router.post('/story/:storyId/delete', storyDelete)

}



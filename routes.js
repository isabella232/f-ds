'use strict';

var Async        = require('async')

var API          = require('./config/backend/api')
  , CookieConfig = require('./config/cookie')

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
      //req.flashError('You are not logged in.')
      res.redirect(redirectTo)
    }
  }
}

function renderIfNoToken(template, redirectTo) {
  return function(req, res) {
    if (!req.signedCookies.token) {
      res.render(template)
    } else {
      //req.flashError('You are already logged in.')
      res.redirect(redirectTo)
    }
  }
}

function renderFeed(req, res) {
  // Get the list of stories.
  API.feed.get({}, function(err, clientErr, message, feed) {
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
          , function(err, clientErr, message, question) {
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
            res.render('feed.html', { feed: feed.feed}
            )
          }
        }
      )
    }
  })
}


function renderStory(req, res) {

  var storyId = req.params.storyId

  API.story.get(
    { story: storyId }
  , function(err, clientErr, message, story) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        console.trace('Error: client error on story: ' + clientErr)
        res.render('404.html', { error: clientErr })
      } else {
        API.question.get(
          { question: story.question }
        , function(err, clientErr, message, question) {
            if (err) {
              console.error(err.stack)
              res.render('500.html')
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
              , { story   : story
                , question: question
                }
              )
            }
          }
        )
      }
    }
  )
}

function userCreate(req, res) {

  var username        = req.body.username
    , email           = req.body.email
    , password        = req.body.password
    , confirmPassword = req.body.confirmPassword

  if (password !== confirmPassword) {
    res.render(
      'signup.html'
    , { error: 'Password and its confirmation did not match!' }
    )
    return
  }

  API.user.create({username: username, email: email, password: password}
  , function(err, clientErr, message, user) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/signup', clientErr)
      } else {
        var options = CookieConfig.options
        options.maxAge = user.ttl
        res.cookie('token', user.token, options)

        res.redirectWithMessage('/feed', message)
      }
    }
  )
}

function userLogin(req, res) {

  var usernameEmail = req.body.usernameEmail
    , password      = req.body.password

  API.user.login({usernameemail: usernameEmail, password: password}
  , function(err, clientErr, message, user) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/login', clientErr)
      } else {

        var options = CookieConfig.options
        options.maxAge = user.ttl
        res.cookie('token', user.token, options)

        res.redirectWithMessage('/feed', message)
      }
    }
  )
}

function userDelete(req, res) {
  API.user.delete({token: req.signedCookies.token}
  , function(err, clientErr, message, user) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/profile', clientErr)
      } else {

        res.clearCookie('token')

        res.redirectWithMessage('/feed', message)
      }
    }
  )
}

function userChangePassword(req, res) {

  var oldPassword     = req.body.oldPassword
    , newPassword     = req.body.newPassword
    , confirmPassword = req.body.confirmPassword

  if (newPassword !== confirmPassword) {
    res.render(
      'profile.html'
    , { error: 'New password and its confirmation did not match!' }
    )
    return
  }

  API.user.changePassword(
    { token           : req.signedCookies.token
    , oldPassword     : oldPassword
    , newPassword     : newPassword
    , confirmPassword : confirmPassword
    }
  , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/changepassword', clientErr)
      } else {
        res.redirectWithMessage('/user/profile', message)

      }
    }
  )
}

function userLogout(req, res) {

  if (req.signedCookies.token) {

    API.user.logout({ token: req.signedCookies.token }
    , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
        return
      } else {
        res.clearCookie('token')

        // We handle clientErr a bit differently here because
        // clientErr is only defined when the token as expired in the db
        if (clientErr) {
          res.redirectWithError('/feed', 'You aren\'t logged in.')
        } else {
          res.redirectWithMessage('/feed', message)
        }
      }

    })
  } else {
    res.redirectWithError('/feed', 'You aren\'t logged in.')
  }
}

function storyCreate(req, res) {

  var question  = req.body.question // Question title
    , answer0   = req.body.answer0
    , answer1   = req.body.answer1
    , answer2   = req.body.answer2
    , answer3   = req.body.answer3
    , answer4   = req.body.answer4
    , title     = req.body.title // Story title
    , narrative = req.body.narrative

  API.question.create(
    { token   : req.signedCookies.token
    , title   : question
    , answers : [answer0, answer1, answer2, answer3, answer4]
    }
  , function(err, clientErr, message, question) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/story/create', clientErr)
      } else {
        API.story.create(
          { token     : req.signedCookies.token
          , title     : title
          , narrative : narrative
          , question  : question.question
          }
        , function(err, clientErr, message, story) {
            if (err) {
              console.error(err.stack)
              res.render('500.html')
            } else if (clientErr) {
              res.redirectWithError('/story/create', clientErr)
            } else {
              res.redirectWithMessage('/story/' + story.story, message)
            }
          }
        )
      }
    }
  )

}

function storyDelete(req, res) {

  var storyId = req.params.storyId

  API.story.delete(
    { token : req.signedCookies.token
    , story : storyId
    }
  , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/story/'  + storyId, clientErr)
      } else {
        res.redirectWithMessage('/feed', message)
      }
    }
  )
}

function storyVote(req, res) {

  var storyId = req.params.storyId
    , answer  = req.params.answer

  API.story.get(
    { story: req.params.storyId }
  , function(err, clientErr, message, story) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        // The user tried to vote on a story that doesn't exist anymore.
        res.render('404.html', { error: err })
      } else {
        API.question.vote(
          { token    : req.signedCookies.token
          , question : story.question
          , answer   : answer
          , story    : storyId
          }
        , function(err, clientErr, message) {
            if (err) {
              console.error(err.stack)
              res.render('500.html')
            } else if (clientErr) {
              res.redirectWithError('/story/'  + storyId, clientErr)
            } else {

              res.redirectWithMessage('/story/'  + storyId, message)
            }
          }
        )
      }
    }
  )
}

function feedbackCreate(req, res) {

  var feedback = req.body.feedback

  API.feedback.create(
    { token    : req.signedCookies.token
    , feedback : feedback
    }
  , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/about', clientErr)
      } else {
        res.redirectWithMessage('/about', message)
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

  router.get('/story/:storyId', renderStory)
  router.get('/feed',           renderFeed)

  router.post('/user/changepassword', userChangePassword)
  router.post('/user/delete',         userDelete)
  router.post('/user/login',          userLogin)
  router.post('/user/logout',         userLogout)
  router.post('/user/signup',         userCreate)

  router.post('/story/create',                storyCreate)
  router.post('/story/:storyId/vote/:answer', storyVote)
  router.post('/story/:storyId/delete',       storyDelete)

  router.post('/about', feedbackCreate)

}



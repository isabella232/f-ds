'use strict';

var Async        = require('async')
  , Moment       = require('moment')
  , util         = require('util')

var API           = require('./config/backend/api')
  , Captcha       = require('./config/captcha')
  , CookieConfig  = require('./config/cookie')

function renderStatic(template) {
  return function(req, res) {
    res.render(template, { page : template })
  }
}

function renderIfToken(template, redirectTo) {
  return function(req, res) {
    if (req.signedCookies.token) {
      res.render(template, { page : template })
    } else {
      //req.flashError('You are not logged in.')
      res.redirect(redirectTo)
    }
  }
}

function renderIfNoToken(template, redirectTo) {
  return function(req, res) {
    if (!req.signedCookies.token) {
      res.render(template, { page : template })
    } else {
      //req.flashError('You are already logged in.')
      res.redirect(redirectTo)
    }
  }
}

function renderActivationWithId(req, res) {
  var activationId = req.params.activationid

  API.user.activate({activationid: activationId}
  , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/activate', clientErr)
      } else {
        if (!req.signedCookies.token) {

          // Activation Success will display something along the lines of:
          // "You successfully activated your account! Click here to log in"
          res.render('activation-success.html')
        } else {
          res.redirectWithMessage('/feed', message)
        }
      }
    }
  )
}


function renderFeed(req, res) {

  var page = parseInt(req.query.page) || 1

  // Get the list of stories.
  API.feed.get(
    { page: page }
  , req.signedCookies.token
  , function(err, clientErr, message, feed) {
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

      if (page > feed.lastPage) {
        res.redirect('/feed')
      }

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
          , req.signedCookies.token
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
            // Calculate total votes for each question and prettify creation date.
            for (var i = 0; i < feed.feed.length; i++) {
              var totalVotes = 0
              for (var j = 0; j < results[i].answers.length; j++) {
                totalVotes += results[i].answers[j].votes
              }
              feed.feed[i].totalVotes = totalVotes
              feed.feed[i].creationDate = Moment(feed.feed[i].creationDate).format('LL')
              feed.feed[i].questionTitle = results[i].title
            }

            res.render('feed.html',
              { feed    : feed.feed
              , page    : page
              , lastPage: feed.lastPage
              }
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
  , req.signedCookies.token
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
        , req.signedCookies.token
        , function(err, clientErr, message, question) {
            if (err) {
              console.error(err.stack)
              res.render('500.html')
            } else if (clientErr) {
              console.trace('Error: client error on question: ' + clientErr)
              res.render('404.html', { error: clientErr })
            } else {
              // trim leading and trailing whitespace in narrative
              story.narrative = story.narrative.trim()
              // prettify date
              story.creationDate = Moment(story.creationDate).format('LL')
              story.storyId = storyId
              question.totalVotes = 0
              for (var i = 0; i < question.answers.length; i++) {
                question.totalVotes += question.answers[i].votes
              }
              // Calculate percentage of total votes for each answer option
              if (question.totalVotes > 0){
                for (var i = 0; i < question.answers.length; i++) {
                  question.answers[i].percent = Math.round(question.answers[i].votes/question.totalVotes*100);
                }
              } else {
                question.answers.forEach(function(el, i, arr) {
                  arr[i].percent = 0;
                })
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
    , key             = req.body['g-recaptcha-response']


  Async.waterfall([
    function(next) {
      Captcha.verify(key, next)
    }

  ]
  , function(err, result) {
    if (err) {
      console.log(err)
      res.render('500.html')
    } else if (!result) {
      res.redirectWithError('/user/signup', 'Captcha failed. Try again.')
    } else {
      if (password !== confirmPassword) {
        res.redirectWithError('/user/signup'
        , 'Password and its confirmation did not match!')
        return
      }

      API.user.create(
        { username: username
        , email   : email
        , password: password
        }
      , req.signedCookies.token
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
            res.cookie('username', username, options)

            res.redirectWithMessage('/feed', message)
          }
        }
      )
    }
  })

}

function userLogin(req, res) {

  var usernameEmail = req.body.usernameEmail
    , password      = req.body.password

  API.user.login(
    { usernameemail : usernameEmail
    , password      : password
    }
  , req.signedCookies.token
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
        res.cookie('username', user.username, options)

        res.redirectWithMessage('/feed', message)
      }
    }
  )
}

function userDelete(req, res) {
  API.user.delete(
    {}
  , req.signedCookies.token
  , function(err, clientErr, message, user) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/profile', clientErr)
      } else {

        res.clearCookie('token')
        res.clearCookie('usernameEmail')

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
    res.redirectWithError('/user/profile'
                        , 'New password and its confirmation did not match!')
    return
  }

  API.user.changePassword(
    { oldPassword     : oldPassword
    , newPassword     : newPassword
    }
  , req.signedCookies.token
  , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/profile', clientErr)
      } else {
        res.redirectWithMessage('/user/profile', message)

      }
    }
  )
}

function userLogout(req, res) {

  if (req.signedCookies.token) {

    API.user.logout(
      {}
    , req.signedCookies.token
    , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
        return
      } else {
        res.clearCookie('token')
        res.clearCookie('username')

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

function userActivate(req, res) {

  var activationId = req.body.activationid

  API.user.activate({activationid: activationId}
  , function(err, clientErr, message) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.redirectWithError('/user/activate', clientErr)
      } else {
        if (!req.signedCookies.token) {

          // Activation Success will display something along the lines of:
          // "You successfully activated your account! Click here to log in"
          res.render('activation-success.html')
        } else {
          res.redirectWithMessage('/feed', message)
        }
      }
    }
  )
}

function storyCreate(req, res) {
  var questionTitle  = req.body.question // Question title
    , answer0        = req.body.answer0
    , answer1        = req.body.answer1
    , answer2        = req.body.answer2
    , answer3        = req.body.answer3
    , answer4        = req.body.answer4
    , title          = req.body.title // Story title
    , narrative      = req.body.narrative
  API.question.create(
    { title   : questionTitle
    , answers : [answer0, answer1, answer2, answer3, answer4]
    }
  , req.signedCookies.token
  , function(err, clientErr, message, question) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        res.render('create.html', {
          questionTitle  : questionTitle
        , answer0        : answer0
        , answer1        : answer1
        , answer2        : answer2
        , answer3        : answer3
        , answer4        : answer4
        , title          : title
        , narrative      : narrative
        , flashError     : clientErr
        })
      } else {
        API.story.create(
          { title     : title
          , narrative : narrative
          , question  : question.question
          }
        , req.signedCookies.token
        , function(err, clientErr, message, story) {
            if (err) {
              console.error(err.stack)
              res.render('500.html')
            } else if (clientErr) {
              res.render('create.html', {
                questionTitle   : questionTitle
              , answer0         : answer0
              , answer1         : answer1
              , answer2         : answer2
              , answer3         : answer3
              , answer4         : answer4
              , title           : title
              , narrative       : narrative
              , flashError      : clientErr
              })
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
    { story : storyId }
  , req.signedCookies.token
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
  , req.signedCookies.token
  , function(err, clientErr, message, story) {
      if (err) {
        console.error(err.stack)
        res.render('500.html')
      } else if (clientErr) {
        // The user tried to vote on a story that doesn't exist anymore.
        res.render('404.html', { error: err })
      } else {
        API.question.vote(
          { question : story.question
          , answer   : answer
          , story    : storyId
          }
        , req.signedCookies.token
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
    { feedback : feedback }
  , req.signedCookies.token
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

  router.get('/',                   renderFeed)
  router.get('/user/profile',       renderIfToken  ('profile.html', '/'))
  router.get('/user/change-pass',   renderIfToken  ('change-pass.html', '/'))
  router.get('/user/login',         renderIfNoToken('login.html',   '/feed'))
  router.get('/user/signup',        renderIfNoToken('signup.html',  '/feed'))
  router.get('/user/activate',      renderStatic   ('activation.html'))
  router.get('/story/create',       renderIfToken  ('create.html',  '/'))
  router.get('/about',              renderStatic   ('about.html'))
  router.get('/about/toupp',        renderStatic   ('legalDocs/toupp.html'))
  router.get('/about/dmca',         renderStatic   ('legalDocs/dmca.html'))

  router.get('/user/activate/:activationid',  renderActivationWithId)
  router.get('/story/:storyId',               renderStory)
  router.get('/feed',                         renderFeed)

  router.post('/user/changepassword', userChangePassword)
  router.post('/user/delete',         userDelete)
  router.post('/user/login',          userLogin)
  router.post('/user/logout',         userLogout)
  router.post('/user/signup',         userCreate)
  router.post('/user/activate',       userActivate)

  router.post('/story/create',                storyCreate)
  router.post('/story/:storyId/vote/:answer', storyVote)

  router.post('/about', feedbackCreate)

  router.post('/story/:storyId/delete', storyDelete)

}



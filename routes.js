'use strict';

var API           = require('./config/backend/api')
var CookieConfig  = require('./config/cookie')

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

module.exports = function(router) {

  router.get('/',             renderIfNoToken('welcome.html', '/feed'))
  router.get('/user/profile', renderIfToken  ('profile.html', '/'))
  router.get('/user/login',   renderIfNoToken('login.html',   '/feed'))
  router.get('/user/signup',  renderIfNoToken('signup.html',  '/feed'))
  router.get('/story/create', renderIfToken  ('create.html',  '/'))
  router.get('/about',        renderStatic   ('about.html'))
  router.get('/about/toupp',  renderStatic   ('legalDocs/toupp.html'))
  router.get('/about/dmca',   renderStatic   ('legalDocs/dmca.html'))

  router.post('/user/changepassword', userChangePassword)
  router.post('/user/delete',         userDelete)
  router.post('/user/login',          userLogin)
  router.post('/user/logout',         userLogout)
  router.post('/user/signup',         userCreate)

  router.post('/story/create', storyCreate)
}



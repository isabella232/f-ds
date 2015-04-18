'use strict';

var API           = require('./config/backend/api')
var CookieConfig  = require('./config/cookie')

function renderStatic(template) {
  return function(req, res) {
    switch (template) {
      case 'login.html':
      case 'signup.html':
      case 'welcome.html':
        if (req.signedCookies.token) {

          res.redirect('/feed')
        } else {
          res.render(template)
        }
        break;
      case 'profile.html':
        if (!req.signedCookies.token) {
          res.redirect('/feed')
        } else {

          res.render(template)
        }
        break;
      default:
        res.render(template)
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
        throw err
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
        throw err
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
        throw err
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
        throw err
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
        throw err
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

module.exports = function(router) {

  router.get('/', renderStatic('welcome.html'))
  router.get('/user/profile', renderStatic('profile.html'))
  router.get('/user/login', renderStatic('login.html'))
  router.get('/user/signup', renderStatic('signup.html'))
  router.get('/story/create', renderStatic('create.html'))
  router.get('/about', renderStatic('about.html'))
  router.get('/about/toupp', renderStatic('legalDocs/toupp.html'))
  router.get('/about/dmca', renderStatic('legalDocs/dmca.html'))

  router.post('/user/changepassword', userChangePassword)
  router.post('/user/delete', userDelete)
  router.post('/user/login', userLogin)
  router.post('/user/logout', userLogout)
  router.post('/user/signup', userCreate)
}



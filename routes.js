'use strict';

function renderStatic(template) {
  return function(req, res) {
    switch (template) {
      case 'login.html':
      case 'signup.html':
      case 'welcome.html':
        if (req.cookies.token) {

          res.redirect('/feed')
        } else {
          res.render(template)
        }
        break;
      case 'profile.html':
        if (!req.cookies.token) {

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


module.exports = function(router) {

  var API = require('./config/backend/api')


  function userCreate(req, res) {

    var username        = req.body.username
      , email           = req.body.email
      , password        = req.body.password

    API.user.create({username: username, email: email, password: password}
    , function(err, clientErr, user) {
        if (err) {
          throw err
        } else if (clientErr) {
          res.render('signup.html', { error: clientErr })
        } else {

          res.cookie('token', user.token)
          res.redirect('/feed')

        }
      }
    )
  }

  function userLogout(req, res) {

    if (req.cookies.token) {
      res.clearCookie('token')
    }

    res.redirect('back')
  }



  router.get('/', renderStatic('welcome.html'))
  router.get('/user/profile', renderStatic('profile.html'))
  router.get('/user/login', renderStatic('login.html'))
  router.get('/user/signup', renderStatic('signup.html'))
  router.get('/story/create', renderStatic('create.html'))
  router.get('/about', renderStatic('about.html'))
  router.get('/about/toupp', renderStatic('legalDocs/toupp.html'))
  router.get('/about/dmca', renderStatic('legalDocs/dmca.html'))

  router.post('/user/signup', userCreate)
  router.post('/user/logout', userLogout)
}



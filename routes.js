'use strict';

function renderStatic(template) {
  return function(req, res) {
    res.render(template)
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
}

'use strict';

function renderStatic(template) {
  return function(req, res) {
    res.render(template)
  }
}

module.exports = function(router) {
  router.get('/', renderStatic('welcome.html'))
  router.get('/feed', renderStatic('feed.html'))
  router.get('/user/profile', renderStatic('profile.html'))
  router.get('/user/login', renderStatic('login.html'))
  router.get('/user/signup', renderStatic('createAccount.html'))
  router.get('/story/create', renderStatic('create.html'))
  router.get('/story/:story', renderStatic('story.html'))
  router.get('/about', renderStatic('about.html'))
  router.get('/about/toupp', renderStatic('toupp.html'))
  router.get('/about/dmca', renderStatic('dmca.html'))
}

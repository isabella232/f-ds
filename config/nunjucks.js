'use strict';

module.exports = function(app, env) {
  app.use(function(req, res, next) {

    env.addGlobal('flashMessage', req.flashMessage());
    env.addGlobal('flashError', req.flashError());

    next();
  });
}

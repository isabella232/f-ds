'use strict';

function declareGlobalTemplateVars(app, env) {
  return function(req, res, next) {

    env.addGlobal('flashMessage', req.flashMessage());
    env.addGlobal('flashError', req.flashError());
    env.addGlobal('username', req.signedCookies.username);

    next();
  }
}

var nunjucksConfig = { globalVarsMiddleware: declareGlobalTemplateVars }

module.exports = nunjucksConfig

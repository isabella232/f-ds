'use strict';

var CookieConfig = require('./cookie')

module.exports = function(req, res, next) {
  req.flashMessage = function(message) {
    if (message) {
      var options = CookieConfig.options
      res.cookie('flashMessage', message, options)
      return
    } else {
      var flashMessage = req.signedCookies.flashMessage

      // res.clearCookie will throw an error if the cookie does not exist
      if (flashMessage) {
        res.clearCookie('flashMessage')
        return flashMessage
      } else {
        return null
      }
    }
  }

  req.flashError = function(errorMessage) {
    if (errorMessage) {
      var options = CookieConfig.options
      res.cookie('flashError', errorMessage, options)
      return
    } else {
      var flashError = req.signedCookies.flashError

      // res.clearCookie will throw an error if the cookie does not exist
      if (flashError) {
        res.clearCookie('flashError')
        return flashError
      } else {
        return null
      }
    }
  }

  res.redirectWithMessage = function(path, message) {
    req.flashMessage(message)
    res.redirect(path)
  }

  res.redirectWithError = function(path, errorMessage) {
    req.flashError(errorMessage)
    res.redirect(path)
  }

  next()
}

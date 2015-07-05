'use strict';

var request = require('request')

var CAPTCHA_KEY = process.env.CAPTCHA_KEY

if (!CAPTCHA_KEY) {
  if (process.env.NODE_ENV === 'production' ) {
    throw new Error('Captcha Secret Key is required for signups.')
  } else {
    console.trace('Warning: Captcha Secret Key is not defined. ' +
                  'Captcha will have no effect on sign ups.')

  }
}

function verifyCaptcha(key, callback) {

  if (!CAPTCHA_KEY) {
    callback(null, true)
  } else {
    var form =
      { secret  : CAPTCHA_KEY
      , response: key
      }
    request.post(
      { url : 'https://www.google.com/recaptcha/api/siteverify'
      , form: form
      , json: true
      }
    , function(err, res, body) {
        callback(err, body.success)
      }
    )
  }
}

module.exports = { verify: verifyCaptcha }

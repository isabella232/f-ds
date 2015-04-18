'use strict';

var CookieConfig = {}

CookieConfig.options =
  { secure  : false
  , httpOnly: true
  , signed  : true
  }

// Secure cookies won't be set unless the server is HTTPS-enabled, so
// we'll use insecure cookies unless the server is running in production
if (process.env.NODE_ENV === 'production' ) {
  CookieConfig.options.secure = true
}


CookieConfig.secret = process.env.cookieSecret

if (!CookieConfig.secret) {
  if (process.env.NODE_ENV === 'production' ) {
    throw new Error('Cookie secret configuration required.')
  } else {
    CookieConfig.secret = 'https://youtu.be/t-7mQhSZRgM'
  }
}

module.exports = CookieConfig

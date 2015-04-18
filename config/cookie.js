'use strict';

var cookieConfig = {}

cookieConfig.options =
  { secure: true
  , httpOnly: true
  }

cookieConfig.secret = process.env.cookieSecret

if (!cookieConfig.secret) {
  if (process.env.NODE_ENV === 'production' ) {
    throw new Error('Cookie secret configuration required.')
  } else {
    cookieConfig.secret = 'https://youtu.be/t-7mQhSZRgM'
  }
}

module.exports = cookieConfig

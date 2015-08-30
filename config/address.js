'use strict'

var address = 'https://www.dynamicstory.org'

if (process.env.NODE_ENV !== 'production' ) {
  address = process.env.address || 'https://www.dynamicstory.org'
} 
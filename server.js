'use strict';

var bodyParser    = require('body-parser')
  , cookieParser  = require('cookie-parser')
  , express       = require('express')
  , nunjucks      = require('nunjucks')
  , path          = require('path')

var CookieConfig  = require('./config/cookie')

var app = express()


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(CookieConfig.secret)
)

// Set variables that will change when in production
var serverPort = process.env.DS_PORT || 9000

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader('views'),
  { autoescape: false }
)

env.express(app)

// Tell Express to serve static objects from these directories
app.use(express.static('pub'))
app.use(express.static('node_modules'))

// Set up routes.
var router = express.Router()
require('./routes')(router)
require('./routes/feed')(router)
require('./routes/story')(router)
app.use(router)

// Handle server exceptions
app.use(function(err, req, res, next) {
  if (err) {
    console.error('Uncaught exception in route handler - ' + err.stack)
    res.status(500).render('500.html')
    // Do not call next()
  } else {
    next()
  }
})

// Handle 404 errors
app.use(function(req, res, next) {
  res.status(404).render('404.html')
})

var server = app.listen(serverPort, 'localhost', function () {

  var host = server.address().address
    , port = server.address().port

  console.log('DynamicStory Frontend listening at http://%s:%s in ' +
    '%s mode.', host, port, app.get('env'))

})

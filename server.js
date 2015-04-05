'use strict';

// Include all our packages
var bodyParser  = require('body-parser')
  , express     = require('express')
  , nunjucks    = require('nunjucks')
  , path        = require('path')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Set up routers
var routerFeed = express.Router()

// Set variables that will change when in production
var serverPort = process.env.DS_PORT || 9000

var env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader('views'),
  { autoescape: false }
)

env.express(app)

// Tell Express to serve static objects from the /pub/ directory
app.use(express.static(path.join(__dirname, 'pub')))

require('./routes/feed')(routerFeed)

app.use('/', routerFeed)

// Handle server exceptions
app.use(function(err, req, res, next) {
  if (err) {
    console.error('Uncaught exception in route handler - ' + err.stack)
    res.send(
      { code    : 500
      , message : 'Internal server error.'
      }
    )
    // Do not call next()
  } else {
    next()
  }
})

// Handle 404 Error
app.use(function(req, res, next) {
  res.status(404).send(
    { code: 404
    , message: 'Not found.'
    }
  )
})

var server = app.listen(serverPort, 'localhost', function () {

  var host = server.address().address
    , port = server.address().port

  console.log('DynamicStory Frontend listening at http://%s:%s in ' +
    '%s mode.', host, port, app.get('env'))

})

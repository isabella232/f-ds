'use strict';

var _              = require('lodash')
var backendRequest = require('./request')

function makeReq(method, url, reqKeys, resKeys) {
  return function(form, callback) {

    var formKeys = _.keys(form)

    if (!_.isEmpty(_.difference(formKeys, reqKeys))) {
      callback(
        new Error(
          'Backend request with extra or missing fields. ' +
          'Expected: ' + JSON.stringify(reqKeys) + ' ' +
          'Got: ' + JSON.strongify(formKeys)
        )
      )
      return
    }

    // Replace Express-ish URL variables using key of same name from `form`.
    // Goes from '/story/:story' to '/story/' + form['story']
    url.replace(/:(\w+)/, function(match, key) {
      return form[key]
    })

    // Make request to backend.
    backendRequest(
      { method: method, url: url, form: form }
    , function(err, res, body) {

        if (err) {
          callback(new Error('Backend HTTP request failed: ' + err))
          return
        }

        if (!body) {
          callback(new Error('Backend returned no body'))
          return
        }

        switch (body.code) {
          default:
            callback(new Error(
              'Backend returned unexpected JSON code: ' + body.code
            ))
            break;
          case 500:
            callback(new Error('Backend returned internal server error'))
            break;
          case 400:
            callback(null, body.message)
            break;
          case 200:
            var isResponseMissingKeys = _.any(resKeys, function(key) {
              return !(key in body)
            })
            if (isResponseMissingKeys) {
              callback(new Error(
                'Backend missing some of: ' + JSON.stringify(resFields)
              ))
              return
            }

            // Return only the specified fields.
            var requestedFields = _.pick(body, function(value, key) {
              return _.indexOf(resKeys, key) != -1
            })

            callback(null, null, requestedFields)
            break;
        }
      }
    )
  }
}

/*
 * Each makeReq creates a function that does a specific HTTP request to
 * backend.
 *
 *   specificBackendRequest(form, callback)
 *
 * The first parameter, form, should be an object with keys equal to the third
 * parameter to makeReq.  For instance, when calling feedback.create(), pass in
 * an object { token: string, feedback: string }.  For the specific case of
 * feed.get(), pass the empty object {}.
 *
 * The second parameter is a callback that takes three arguments: err,
 * clientErr, and response.
 *
 *   callback(err, clientErr, res)
 *
 * If err is present, then the frontend could not connect to the backend, the
 * backend did not respond properly, or the backend returned a { code: 500 }
 * response.  It will be an Error describing the problem and clientErr and res
 * will be null.  err should probably be printed to console.
 *
 * If clientErr is present, a client error occurred.  Response will be null.
 * clientErr will be a String whose message is a description of the client
 * error chosen by the backend server.
 *
 * If response is present, then the request was ultimately succesful.  response
 * will be an object whose keys are equal to the fourth parameter to makeReq.
 * For instance, when calling question.get(), response will be { title: string,
 * answers: string }.
 */
module.exports =
  { feed:
    { get: makeReq('GET', '/feed', [], ['feed'])
    }
  , feedback:
    { create: makeReq('POST', '/feedback', ['token', 'feedback'], [])
    }
  , question:
    { create: makeReq('POST', '/question', ['token', 'title', 'answers'], ['question'])
    , get: makeReq('GET', '/question/:question', ['question'], ['title', 'answers'])
    , vote: makeReq('POST', '/question/:question/vote', ['token', 'question', 'answer', 'story'], ['question'])
    }
  , story:
    { create: makeReq('POST', '/story', ['token', 'title', 'narrative', 'question'], ['story'])
    , get: makeReq('GET', '/story/:story', ['story'], ['title', 'narrative', 'question'])
    , delete: makeReq('DELETE', '/story/:story', ['token', 'story'], [])
    }
  , user:
    { create: makeReq('POST', '/user', ['username', 'email', 'password'], ['token', 'ttl'])
    , login: makeReq('POST', '/user/authenticate', ['usernameemail', 'password'], ['token', 'ttl'])
    , refreshSession: makeReq('POST', '/user/reauthenticate', ['token'], ['token', 'ttl'])
    , changePassword: makeReq('PUT', '/user/password', ['token', 'oldPassword', 'newPassword', 'confirmPassword'], [])
    , logout: makeReq('POST', '/user/logout', ['token'], [])
    , delete: makeReq('DELETE', '/user', ['token'], [])
    }
  }

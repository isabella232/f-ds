'use strict';

var _              = require('lodash')
var backendRequest = require('./request')

function makeReq(method, urlPattern, reqKeys, resKeys) {
  return function(form, callback) {

    var formKeys = _.keys(form)

    // It's easy to miscall functions.  If this function is invoked with a
    // difference between form's keys and reqKeys, then one of them is probably
    // wrong.  Let's be defensive and check for this, throwing an error if
    // found.
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
    var url = urlPattern.replace(/:(\w+)/, function(match, key) {
      return form[key]
    })

    // Make request to backend.
    backendRequest(
      { method: method, url: url, form: form }
    , function(err, res, body) {

        if (err) {
          // This could happen if the backend is not running.
          callback(new Error('Backend HTTP request failed: ' + err))
          return
        }

        if (!body) {
          // This could probably only happen if backend code has a bug.  It's
          // unlikely (we hope), but let's handle it anyway.
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
                'Backend missing some of: ' + JSON.stringify(resKeys)
              ))
              return
            }

            // Return only the specified fields.
            var requestedFields = _.pick(body, function(value, key) {
              return _.indexOf(resKeys, key) != -1
            })

            callback(null, null, body.message, requestedFields)
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
 * The second parameter is a callback that takes four arguments: err,
 * clientErr, message, and response.
 *
 *   callback(err, clientErr, message, res)
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
 * If message and response are present, then the request was ultimately
 * successful.  message will be the server's suggestion for a success message
 * that we can give to the user.  response will be an object whose keys are
 * equal to the fourth parameter to makeReq.  For instance, when calling
 * question.get(), response will be { title: string, answers: string }.
 */
module.exports =
  { feed:
    { get: makeReq('GET', '/feed',
      [], ['feed'])
    }
  , feedback:
    { create: makeReq('POST', '/feedback',
      ['token', 'feedback'], [])
    }
  , question:
    { create: makeReq('POST', '/question',
      ['token', 'title', 'answers'], ['question'])
    , get: makeReq('GET', '/question/:question',
      ['question'], ['title', 'answers'])
    , vote: makeReq('POST', '/question/:question/vote',
      ['token', 'question', 'answer', 'story'], [])
    }
  , story:
    { create: makeReq('POST', '/story',
      ['token', 'title', 'narrative', 'question'], ['story'])
    , get: makeReq('GET', '/story/:story',
      ['story'], ['title', 'narrative', 'creationDate', 'question'])
    , delete: makeReq('DELETE', '/story/:story',
      ['token', 'story'], [])
    }
  , user:
    { create: makeReq('POST', '/user',
      ['username', 'email', 'password'], ['token', 'ttl'])
    , login: makeReq('POST', '/user/authenticate',
      ['usernameemail', 'password'], ['token', 'ttl'])
    , refreshSession: makeReq('POST', '/user/reauthenticate',
      ['token'], ['token', 'ttl'])
    , changePassword: makeReq('PUT', '/user/password',
      ['token', 'oldPassword', 'newPassword'], [])
    , logout: makeReq('POST', '/user/logout',
      ['token'], [])
    , delete: makeReq('DELETE', '/user',
      ['token'], [])
    }
  }

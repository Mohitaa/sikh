'use strict';

/**
 ** Created by mamta on 27/5/18.
 */

var TokenManager = require('../Lib/TokenManager');
var UniversalFunctions = require('../Utils/UniversalFunctions');
var hapiAuthBearerToken = require('hapi-auth-bearer-token');

exports.register = function (server, options, next) {
// Register Authorization Plugin
  server.register(hapiAuthBearerToken, function (err) {
    server.auth.strategy('UserAuth', 'bearer-access-token', {
      allowQueryToken: false,
      allowMultipleHeaders: true,
      accessTokenName: 'accessToken',
      validateFunc: function (token, callback) {
        TokenManager.verifyToken(token, function (err, response) {
          if (err || !response || !response.userData) {
            callback(null, false, { token: token, userData: null });
          } else {
            callback(null, true, { token: token, userData: response.userData });
          }
        });
      }
    });

    server.auth.strategy('AdminAuth', 'bearer-access-token', {
      allowQueryToken: false,
      allowMultipleHeaders: true,
      accessTokenName: 'accessToken',
      validateFunc: function (token, callback) {
        TokenManager.verifyAdminToken(token, function (err, response) {
          if (err || !response || !response.userData) {
            callback(null, false, { token: token, userData: null });
          } else {
            callback(null, true, { token: token, userData: response.userData });
          }
        });
      }
    });
  });

  next();
};

exports.register.attributes = {
  name: 'auth-token-plugin'
};

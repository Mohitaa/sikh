'use strict';

/**
 * * Created by mamta on 27/5/18.
 */
var Good = require('good');
var rep = require('good-console');

// Register Good Console

exports.register = function (server, options, next) {
  server.register({
    register: Good,
    options: {
      reporters: [{
        reporter: rep,
        events: {
          response: '*',
          log: '*'
        }
      }]
    }
  }, function (err) {
    if (err) {
      throw err;
    }
  });

  next();
};

exports.register.attributes = {
  name: 'good-console-plugin'
};

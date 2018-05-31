'use strict';

/**
 * Created by mamta 24/5/2018
 */
var mongoose = require('mongoose');
var Config = require('../Config');
var Service = require('../Services');
var async = require('async');
var winston = require('winston');

// Connect to MongoDB
mongoose.connect(Config.dbConfig.mongo.URI, function (err) {
  if (err) {
    winston.info('DB Error: ', err);
    process.exit(1);
  } else {
    winston.info('MongoDB Connected');
  }
});

exports.bootstrapAdmin = function (callback) {
  var adminData = {
    email: 'mamtarajput925@gmail.com',
    phoneNo: '9672338162',
    password: 'bf74433b21d0bd861c8da58e7216cf01',
    name: 'Mamta',
    countryCode:'+91'
  };

  function insertData(email, adminData, callback) {
    var needToCreate = true;
    async.series([function (cb) {
      var criteria = {
        email: email
      };
      Service.UserService.getUser(criteria, {}, {}, function (err, data) {
        if (data && data.length > 0) {
          needToCreate = false;
        }
        cb();
      });
    }, function (cb) {

      if (needToCreate) {
        Service.UserService.createUser(adminData, function (err, data) {
          cb(err, data);
        });
      } else {
        cb();
      }

    }], function (err, data) {
      winston.info('Bootstrapping finished for ' + email);
      callback(err, 'Bootstrapping finished');
    });
  }

  async.parallel([
    function (cb) {
      insertData(adminData.email, adminData, cb);
    }
  ], function (err, done) {
    callback(err, 'Bootstrapping finished');
  });
};


exports.bootstrapAppVersion = function (callback) {
  var appVersion1 = {
    latestIOSVersion: '100',
    latestAndroidVersion: '100',
    criticalAndroidVersion: '100',
    criticalIOSVersion: '100'
  };
  var appVersion2 = {
    latestIOSVersion: '100',
    latestAndroidVersion: '100',
    criticalAndroidVersion: '100',
    criticalIOSVersion: '100'
  };
};
'use strict';

/**
 * Created by mamta on 27/5/18.
 */
var async = require('async');
var _ = require('underscore');
var UniversalFunctions = require('../Utils/UniversalFunctions');

var Services = require('../Services');
var generateRandomNumbers;
exports.generateUniqueCode = function (noOfDigits, userRole, callback) {
  var excludeArray = [];
  var generatedRandomCode = null;
  noOfDigits = noOfDigits || 5;
  async.series([
    function (cb) {
      // Push All generated codes in excludeAry
      if (userRole === UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN) {
        Services.DriverService.getAllGeneratedCodes(function (err, dataAry) {
          if (err) {
            cb(err);
          } else {
            if (dataAry && dataAry.length > 0) {
              excludeArray = dataAry;
            }
            cb();
          }
        });
      } else if (userRole === UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER) {
        Services.UserService.getAllGeneratedCodes(function (err, dataAry) {
          if (err) {
            cb(err);
          } else {
            if (dataAry && dataAry.length > 0) {
              excludeArray = dataAry;
            }
            cb();
          }
        });
      } else {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }, function (cb) {
      // Generate Random Code of digits specified
      generatedRandomCode = generateRandomNumbers(noOfDigits, excludeArray);
      cb();
    }], function (err, data) {
    callback(err, { number: generatedRandomCode });
  });
};

exports.generateUniqueReferralCode = function (noOfDigits, userRole, callback) {
  var excludeArray = [];
  var generatedRandomCode = null;
  noOfDigits = noOfDigits || 5;
  async.series([
    function (cb) {
      // Push All generated codes in excludeAry
      if (userRole === UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.INVITED_USER) {
        Services.InvitedUserService.getAllGeneratedReferralCodes(function (err, dataAry) {
          if (err) {
            cb(err);
          } else {
            if (dataAry && dataAry.length > 0) {
              excludeArray = dataAry;
            }
            cb();
          }
        });
      } else {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }, function (cb) {
      // Generate Random Code of digits specified
      generatedRandomCode = generateRandomNumbers(noOfDigits, excludeArray);
      cb();
    }], function (err, data) {
    callback(err, { number: generatedRandomCode });
  });
};


generateRandomNumbers = function (numberLength, excludeList) {
  var arrayList = [];
  var minString = '0';
  var maxString = '9';
  var digitToCheck;
  var i;
  var minNumber;
  var maxNumber;
  var diff;
  var zeros;
  var j;

  for (i = 1; i < numberLength; i++) {
    minString += '1';
    maxString += '9';
  }
  minNumber = parseInt(minString, 10);
  maxNumber = parseInt(maxString, 10);
  excludeList = excludeList || [];

  // Create list
  for (i = minNumber; i < maxNumber; i++) {
    digitToCheck = i.toString();
    if (digitToCheck.length < numberLength) {
      diff = numberLength - digitToCheck.length;
      zeros = '';
      for (j = 0; j < diff; j++) {
        zeros += '1';
      }
      digitToCheck = zeros + digitToCheck;
    }
    if (digitToCheck < 100000) {
      if (excludeList.indexOf(digitToCheck) === -1) {
        arrayList.push(digitToCheck);
      }
    }
  }
  if (arrayList.length > 0) {
    arrayList = _.shuffle(arrayList);
    return arrayList[0];
  }
  return false;
};

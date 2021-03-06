// admin login for different
var UniversalFunctions = require('../Utils/UniversalFunctions');
var CodeGenerator = require('../Lib/CodeGenerator');
var TokenManager = require('../Lib/TokenManager');
var winston = require('winston');
var async = require('async');
var Service = require('../Services');
var NotificationManager = require('../Lib/NotificationManager');
var createUser, verifyOTP, resendOTP, loginUser, socialSignUp, changePassword;


// user register own by app
createUser = function (payloadData, callback) {
  var accessToken = null;
  var uniqueCode = null;
  var userData = null;
  var dataToUpdate = {};
  var dataToSave = payloadData;
  payloadData.email = payloadData.email.toLowerCase();
  winston.info('sending', payloadData);
  if (payloadData.facebookId === 'undefined') {
    delete payloadData.facebookId;
  }
  if (payloadData.password === 'undefined') {
    delete payloadData.password;
  }
  if (dataToSave.password) {
    dataToSave.password = UniversalFunctions.CryptData(dataToSave.password);
  }
  dataToSave.firstTimeLogin = false;

  if (payloadData.profilePic && payloadData.profilePic.filename) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>', payloadData.profilePic);
    dataToUpdate.profilePicURL = {
      original: null,
      thumbnail: null
    };
  }

  async.series([
    function (cb) {
      // verify email address
      if (!UniversalFunctions.verifyEmailFormat(dataToSave.email)) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
      } else {
        cb();
      }
    },
    function (cb) {
      // Validate for facebookId and password
      if (dataToSave.facebookId) {
        if (dataToSave.password) {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.FACEBOOK_ID_PASSWORD_ERROR);
        } else {
          cb();
        }
      } else if (!dataToSave.password) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PASSWORD_REQUIRED);
      } else {
        cb();
      }
    },
    function (cb) {
      CodeGenerator.generateUniqueCode(5, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER, function (err, numberObj) {
        if (err) {
          cb(err);
        } else if (!numberObj || numberObj.number === null) {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNIQUE_CODE_LIMIT_REACHED);
        } else {
          uniqueCode = numberObj.number;
          cb();
        }
      });
    },
    function (cb) {
      // Clear Device Tokens if present anywhere else
      var criteria = {
        deviceToken: dataToSave.deviceToken
      };
      var setQuery = {
        $unset: {deviceToken: 1}
      };
      var options = {
        multi: true
      };
      Service.UserService.updateUser(criteria, setQuery, options, cb);
    },
    function (cb) {
      // Insert Into DB
      dataToSave.OTPCode = uniqueCode;
      dataToSave.registrationDate = new Date().toISOString();
      dataToSave.emailVerificationToken = UniversalFunctions.CryptData(JSON.stringify(dataToSave));
      dataToSave.referralCode = UniversalFunctions.generateRandomStringNumber(8);
      Service.UserService.createUser(dataToSave, function (err, userDataFromDB) {
        if (err) {
          cb(err);
        } else {
          userData = userDataFromDB;
          cb();
        }
      });
    },
    function (cb) {
      // Set Access Token
      var tokenData;
      if (userData) {
        tokenData = {
          id: userData._id,
          type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER
        };
        TokenManager.setToken(tokenData, function (err, output) {
          if (err) {
            cb(err);
          } else {
            accessToken = output && output.accessToken || null;
            cb();
          }
        });
      } else {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }
  ], function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, {
        accessToken: accessToken,
        userDetails: UniversalFunctions.deleteUnnecessaryUserData(userData)
      });
    }
  });
};

// user register by socail signUp
socialSignUp = function (payloadData, callback) {
  var accessToken = null;
  var uniqueCode = null;
  var dataToSave = payloadData;
  var userData = null;
  var dataToUpdate = {};
  dataToSave.firstTimeLogin = false;
  winston.info('sending', payloadData);
  payloadData.email = payloadData.email.toLowerCase();
  dataToUpdate.profilePicURL = {
    original: null,
    thumbnail: null
  };

  async.series([
    function (cb) {
      // Validate already exit or not

      var criteria = {
        'social.socialMode': dataToSave.social.socialMode,
        'social.socialId': dataToSave.social.socialId

      };
      var option = {};
      var projection = {};
      Service.UserService.getOneUser(criteria, projection, option, function (err, DataFromDB) {
        if (err) {
          cb(err);
        } else if (DataFromDB === null) {
          cb();
        } else {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SOCIAL_ID);
        }
      });
    },

    function (cb) {
      // verify email address
      if (!UniversalFunctions.verifyEmailFormat(dataToSave.email)) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
      } else {
        cb();
      }
    },

    function (cb) {
      CodeGenerator.generateUniqueCode(5, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER, function (err, numberObj) {
        if (err) {
          cb(err);
        } else if (!numberObj || numberObj.number === null) {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNIQUE_CODE_LIMIT_REACHED);
        } else {
          uniqueCode = numberObj.number;
          cb();
        }
      });
    },
    function (cb) {
      // Clear Device Tokens if present anywhere else
      var criteria = {
        deviceToken: dataToSave.deviceToken
      };
      var setQuery = {
        $unset: {deviceToken: 1}
      };
      var options = {
        multi: true
      };
      Service.UserService.updateUser(criteria, setQuery, options, cb);
    },

    function (cb) {
      // Insert Into
      dataToSave.OTPCode = uniqueCode;
      dataToSave.registrationDate = new Date().toISOString();
      dataToSave.emailVerificationToken = UniversalFunctions.CryptData(JSON.stringify(dataToSave));
      dataToSave.referralCode = UniversalFunctions.generateRandomStringNumber(8);
      Service.UserService.createUser(dataToSave, function (err, userDataFromDB) {
        if (err) {
          cb(err);
        } else {
          userData = userDataFromDB;
          cb();
        }
      });
    },
    function (cb) {
      var tokenData;
      // Set Access Token
      if (userData) {
        tokenData = {
          id: userData._id,
          type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER
        };
        TokenManager.setToken(tokenData, function (err, output) {
          if (err) {
            cb(err);
          } else {
            accessToken = output && output.accessToken || null;
            cb();
          }
        });
      } else {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }
  ], function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, {
        accessToken: accessToken,
        userDetails: UniversalFunctions.deleteUnnecessaryUserData(userData)
      });
    }
  });
};
verifyOTP = function (queryData, userData, callback) {
  var newNumberToVerify;
  var dbNumber;
  if (!queryData || !userData._id) {
    callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
  } else {
    newNumberToVerify = queryData.countryCode + '-' + queryData.phoneNo;
    dbNumber = userData.countryCode + '-' + userData.phoneNo;
    async.series([
      function (cb) {
        // Check verification code :
        if (queryData.OTPCode === userData.OTPCode) {
          cb();
        } else {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CODE);
        }
      },
      function (cb) {
        // Check if phoneNo is same as in DB
        winston.info('checking data', userData.newNumber);
        winston.info('checking data', newNumberToVerify);
        if (dbNumber !== newNumberToVerify) {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_PHONE_NO);
        } else {
          cb();
        }
      },
      function (cb) {
        // trying to update User
        var criteria = {
          _id: userData.id,
          OTPCode: queryData.OTPCode
        };
        var setQuery = {
          $set: {phoneVerified: true},
          $unset: {OTPCode: 1}
        };
        var options = {new: true};
        if (userData.newNumber) {
          setQuery.$set.phoneNo = queryData.phoneNo;
          setQuery.$set.countryCode = queryData.countryCode;
          setQuery.$unset.newNumber = 1;
        }

        winston.info('updating>>>', criteria, setQuery, options);
        Service.UserService.updateUser(criteria, setQuery, options, function (err, updatedData) {
          winston.info('verify otp callback result', err, updatedData);
          if (err) {
            cb(err);
          } else if (!updatedData) {
            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_CODE);
          } else {
            cb();
          }
        });
      }
    ], function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback();
      }
    });
  }
};
resendOTP = function (userData, callback) {
  /*
   Create a Unique 4 digit code
   Insert It Into User DB
   Send the 4 digit code via SMS
   Send Back Response
   */
  var phoneNo = userData.newNumber || userData.phoneNo;
  var countryCode = userData.countryCode;
  var uniqueCode = null;
  if (!phoneNo) {
    callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
  } else {
    async.series([
      function (cb) {
        CodeGenerator.generateUniqueCode(4, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER, function (err, numberObj) {
          if (err) {
            cb(err);
          } else if (!numberObj || numberObj.number === null) {
            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.UNIQUE_CODE_LIMIT_REACHED);
          } else {
            uniqueCode = numberObj.number;
            cb();
          }
        });
      },
      function (cb) {
        var criteria = {
          _id: userData.id
        };
        var setQuery = {
          $set: {
            OTPCode: uniqueCode,
            codeUpdatedAt: new Date().toISOString()
          }
        };
        var options = {
          lean: true
        };
        Service.UserService.updateUser(criteria, setQuery, options, cb);
      }, function (cb) {
        // Send SMS to User
        NotificationManager.sendSMSToFactor(uniqueCode, countryCode, phoneNo, function (err, data) {
          cb();
        });
      }
    ], function (err, result) {
      callback(err, null);
    });
  }
};
// user login only by email id not socail
loginUser = function (payloadData, callback) {
  var userFound = false;
  var accessToken = null;
  var successLogin = false;
  var appVersion = null;
  var flushPreviousSessions = payloadData.flushPreviousSessions || false;
  var updatedUserDetails = null;

  async.series([
    function (cb) {
      // verify email address
      if (!UniversalFunctions.verifyEmailFormat(payloadData.email)) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
      } else {
        cb();
      }
    },
    function (cb) {
      var criteria = {
        email: payloadData.email
      };
      var projection = {};
      var option = {
        lean: true
      };
      Service.UserService.getUser(criteria, projection, option, function (err, result) {
        if (err) {
          cb(err);
        } else {
          userFound = result && result[0] || null;
          cb();
        }
      });
    },
    function (cb) {
      // validations
      if (!userFound) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_EMAIL);
      } else if (userFound && userFound.password !== UniversalFunctions.CryptData(payloadData.password)) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_PASSWORD);
      } else if (userFound.isBlocked === true) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.BLOCKED);
      } else if (userFound.isDeleted === true) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DELETED);
      } else {
        successLogin = true;
        cb(null, userFound);
      }
    },
    function (cb) {
      // Clear Device Tokens if present anywhere else
      var criteria;
      var setQuery;
      var options;

      if (userFound && payloadData.deviceToken !== userFound.deviceToken && !flushPreviousSessions) {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.ACTIVE_PREVIOUS_SESSIONS);
      } else {
        criteria = {
          deviceToken: payloadData.deviceToken
        };
        setQuery = {
          $unset: {deviceToken: 1}
        };
        options = {
          multi: true
        };
        Service.UserService.updateUser(criteria, setQuery, options, cb);
      }
    },
    function (cb) {
      var criteria = {
        _id: userFound._id
      };
      var setQuery = {
        appVersion: payloadData.appVersion || 1,
        deviceToken: payloadData.deviceToken,
        deviceType: payloadData.deviceType
      };
      Service.UserService.updateUser(criteria, setQuery, {new: true}, function (err, data) {
        updatedUserDetails = data;
        cb(err, data);
      });
    },
    function (cb) {
      var tokenData;
      if (successLogin) {
        tokenData = {
          id: userFound._id,
          type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER
        };
        TokenManager.setToken(tokenData, function (err, output) {
          if (err) {
            cb(err);
          } else if (output && output.accessToken) {
            accessToken = output && output.accessToken;
            cb();
          } else {
            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.ERROR.IMP_ERROR);
          }
        });
      } else {
        cb(UniversalFunctions.CONFIG.APP_CONSTANTS.ERROR.IMP_ERROR);
      }
    }
  ], function (err, data) {
    if (err) {
      callback(err);
    } else {
      callback(null, {
        accessToken: accessToken,
        userDetails: UniversalFunctions.deleteUnnecessaryUserData(updatedUserDetails)
      });
    }
  });
};
user = function (callback) {

  callback(null, "hello");

};

checkPhoneNumber = function (payloadData, callback) {

  var criteria = {
    phoneNo: payloadData.phoneNo
  };
  var projection = {};
  var option = {
    lean: true
  };
  Service.UserService.getUser(criteria, projection, option, function (err, result) {
    if (err) {
      callback(err);
    } else {
      phoneNoFound = result && result[0] || null;
      if (phoneNoFound) {
        callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.PHONE_ALREADY_EXIST);
      } else {
        callback(null, UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);
      }


    }
  });

};

changePassword = function (queryData, userData, callback) {
  var userFound = null;
  if (!queryData.oldPassword || !queryData.newPassword || !userData) {
    callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
  } else {
    async.series([
      function (cb) {
        var criteria = {
          _id: userData.id
        };
        var projection = {};
        var options = {
          lean: true
        };
        Service.UserService.getUser(criteria, projection, options, function (err, data) {
          if (err) {
            cb(err);
          } else if (data && data.length > 0 && data[0]._id) {
            userFound = data[0];
            cb();
          } else {
            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NOT_FOUND);
          }
        });
      },
      function (cb) {
        // Check Old Password
        if (userFound.password !== UniversalFunctions.CryptData(queryData.oldPassword)) {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INCORRECT_OLD_PASS);
        } else if (userFound.password === UniversalFunctions.CryptData(queryData.newPassword)) {
          cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SAME_PASSWORD);
        } else {
          cb();
        }
      },
      function (cb) {
        // Update User Here
        var criteria = {
          _id: userFound._id
        };
        var setQuery = {
          $set: {
            firstTimeLogin: false,
            password: UniversalFunctions.CryptData(queryData.newPassword)
          }
        };
        var options = {
          lean: true
        };
        Service.UserService.updateUser(criteria, setQuery, options, cb);
      }

    ], function (err, result) {
      callback(err, null);
    });
  }
};

module.exports = {
  createUser: createUser,
  user: user,
  verifyOTP: verifyOTP,
  resendOTP: resendOTP,
  loginUser: loginUser,
  checkPhoneNumber: checkPhoneNumber,
  socialSignUp: socialSignUp,
  changePassword: changePassword
};
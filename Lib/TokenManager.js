'use strict';

/**
 * Created by shahab on 11/7/15.
 */
var Config = require('../Config');
var Jwt = require('jsonwebtoken');
var async = require('async');
var Service = require('../Services');

var getTokenFromDB;
var setTokenInDB;
var expireTokenInDB;
var decodeToken;
var getSuperAdminTokenFromDB;
var getFleetOwnerTokenFromDB;
var getAdminTokenFromDB;
var verifyToken;
var verifyFleetOwnerToken;
var verifySuperAdminToken;
var setToken;
var expireToken;
var verifyAdminToken;


getTokenFromDB = function (userId, userType, token, callback) {
  var userData = null;
  var criteria = {
    _id: userId,
    accessToken: token
  };
  async.series([
    function (cb) {
      switch (userType) {
        case Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER :
          Service.UserService.getUser(criteria, {}, { lean: true }, function (err, dataAry) {
            if (err) {
              cb(err);
            } else if (dataAry && dataAry.length > 0) {
              userData = dataAry[0];
              cb();
            } else {
              cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
            }
          });
          break;
        case Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN :
          Service.AdminService.getAdmin(criteria, {}, { lean: true }, function (err, dataAry) {
            if (err) {
              cb(err);
            } else if (dataAry && dataAry.length > 0) {
              userData = dataAry[0];
              cb();
            } else {
              cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
            }
          });
          break;
        default :
          cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }
  ], function (err, result) {
    if (err) {
      callback(err);
    } else {
      if (userData && userData._id) {
        userData.id = userData._id;
        userData.type = userType;
      }
      callback(null, { userData: userData });
    }
  });
};

setTokenInDB = function (userId, userType, tokenToSave, callback) {
  var criteria = {
    _id: userId
  };
  var setQuery = {
    accessToken: tokenToSave
  };
  async.series([
    function (cb) {
      switch (userType) {
        case Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER:
          Service.UserService.updateUser(criteria, setQuery, { new: true }, function (err, dataAry) {
            if (err) {
              cb(err);
            } else if (dataAry && dataAry._id) {
              cb();
            } else {
              cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
            }
          });
          break;
        case Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN:
          Service.AdminService.updateAdmin(criteria, setQuery, { new: true }, function (err, dataAry) {
            if (err) {
              cb(err);
            } else if (dataAry && dataAry._id) {
              cb();
            } else {
              cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
            }
          });
          break;
        default :
          cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);

      }
    }
  ], function (err, result) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};

expireTokenInDB = function (userId, userType, callback) {
  var criteria = {
    _id: userId
  };
  var setQuery = {
    accessToken: null
  };
  async.series([
    function (cb) {
      switch (userType) {
        case Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER :
          Service.UserService.updateUser(criteria, setQuery, { new: true }, function (err, dataAry) {
            if (err) {
              cb(err);
            } else if (dataAry && dataAry.length > 0) {
              cb();
            } else {
              cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
            }
          });
          break;
        case Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN :
          Service.AdminService.updateAdmin(criteria, setQuery, { new: true }, function (err, dataAry) {
            if (err) {
              cb(err);
            } else if (dataAry && dataAry.length > 0) {
              cb();
            } else {
              cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
            }
          });
          break;
        default :
          cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);

      }
    }
  ], function (err, result) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
};


setToken = function (tokenData, callback) {
  var tokenToSend;
  if (!tokenData.id || !tokenData.type) {
    callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
  } else {
    tokenToSend = Jwt.sign(tokenData, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY);
    setTokenInDB(tokenData.id, tokenData.type, tokenToSend, function (err, data) {
           // console.log('token>>>>',err,data)
      callback(err, { accessToken: tokenToSend });
    });
  }
};

expireToken = function (token, callback) {
  Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
    if (err) {
      callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
    } else {
      expireTokenInDB(decoded.id, decoded.type, function (err, data) {
        callback(err, data);
      });
    }
  });
};

decodeToken = function (token, callback) {
  Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decodedData) {
    if (err) {
      callback(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
    } else {
      callback(null, decodedData);
    }
  });
};


getSuperAdminTokenFromDB = function (userId, userType, token, callback) {
  var userData = null;
  var criteria = {
    _id: userId,
    accessToken: token
  };
  async.series([
    function (cb) {
      if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN) {
        Service.AdminService.getAdmin(criteria, {}, { lean: true }, function (err, dataAry) {
          if (err) {
            cb(err);
          } else if (dataAry && dataAry.length > 0) {
            userData = dataAry[0];
            cb();
          } else {
            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
          }
        });
      } else {
        cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }
  ], function (err, result) {
    if (err) {
      callback(err);
    } else {
      if (userData && userData._id) {
        userData.id = userData._id;
        userData.type = userType;
      }
      callback(null, { userData: userData });
    }
  });
};


getAdminTokenFromDB = function (userId, userType, token, callback) {
  var userData = null;
  var criteria = {
    _id: userId,
    accessToken: token
  };
  async.series([
    function (cb) {
      if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN) {
        Service.AdminService.getAdmin(criteria, {}, { lean: true }, function (err, dataAry) {
          if (err) {
            cb(err);
          } else if (dataAry && dataAry.length > 0) {
            userData = dataAry[0];
            cb();
          } else {
            cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_TOKEN);
          }
        });
      } else {
        cb(Config.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
      }
    }
  ], function (err, result) {
    if (err) {
      callback(err);
    } else {
      if (userData && userData._id) {
        userData.id = userData._id;
        userData.type = userType;
      }
      callback(null, { userData: userData });
    }
  });
};

verifyToken = function (token, callback) {
  var response = {
    valid: false
  };
  Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
      //  console.log('jwt err',err,decoded)
    if (err) {
      callback(err);
    } else {
      getTokenFromDB(decoded.id, decoded.type, token, callback);
    }
  });
};

verifySuperAdminToken = function (token, callback) {
  var response = {
    valid: false
  };
  Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
    if (err) {
      callback(err);
    } else {
      getSuperAdminTokenFromDB(decoded.id, decoded.type, token, callback);
    }
  });
};


verifyFleetOwnerToken = function (token, callback) {
  var response = {
    valid: false
  };
  Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
    if (err) {
      callback(err);
    } else {
      getFleetOwnerTokenFromDB(decoded.id, decoded.type, token, callback);
    }
  });
};

verifyAdminToken = function (token, callback) {
  var response = {
    valid: false
  };
  Jwt.verify(token, Config.APP_CONSTANTS.SERVER.JWT_SECRET_KEY, function (err, decoded) {
    if (err) {
      callback(err);
    } else {
      getAdminTokenFromDB(decoded.id, decoded.type, token, callback);
    }
  });
};


module.exports = {
  expireToken: expireToken,
  setToken: setToken,
  verifyToken: verifyToken,
  decodeToken: decodeToken,
  verifySuperAdminToken: verifySuperAdminToken,
  getSuperAdminTokenFromDB: getSuperAdminTokenFromDB,
  verifyFleetOwnerToken: verifyFleetOwnerToken,
  getAdminTokenFromDB: getAdminTokenFromDB,
  verifyAdminToken: verifyAdminToken
};

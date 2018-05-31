/**
 * Created by mamta on 27/5/18.
 */
var Joi = require('joi');
var async = require('async');
var MD5 = require('md5');
var Boom = require('boom');
var CONFIG = require('../Config');
var Models = require('../Models');
var randomstring = require('randomstring');
var NotificationManager = require('../Lib/NotificationManager')
var validator = require('validator');
var calculateDistanceViaGoogleDistanceMatrix;
var calculateDeliveryCost;
var sendError;
var sendSuccess;
var checkDuplicateValuesInArray;
var failActionFunction;
var customQueryDataValidations;
var getEmbeddedDataFromMongo;
var CryptData;
var generateRandomString;
var filterArray;
var sanitizeName;
var verifyEmailFormat;
var getFileNameWithUserId;
var authorizationHeaderObj;
var getFileNameWithUserIdWithCustomPrefix;
var getDistanceBetweenPoints;
var checkPathCoincide;
var deleteUnnecessaryUserData;
var validateLatLongValues;
var generateRandomStringNumber;
var VALID_ERRAND_STATUS_ARRAY = [];
var key;


for (key in CONFIG.APP_CONSTANTS.DATABASE.ERRANDS_STATUS) {
  if (CONFIG.APP_CONSTANTS.DATABASE.ERRANDS_STATUS.hasOwnProperty(key)) {
    VALID_ERRAND_STATUS_ARRAY.push(CONFIG.APP_CONSTANTS.DATABASE.ERRANDS_STATUS[key]);
  }
}


calculateDistanceViaGoogleDistanceMatrix = function (origin, destination, callback) {
  var origins = [origin];
  var destinations = [destination];
  var duration = null;

  distance.matrix(origins, destinations, function (err, distances) {
    if (err) {
      callback(err);
    } else if (distances.status === 'OK' && distances.rows && distances.rows[0] && distances.rows[0].elements
        && distances.rows[0].elements[0] && distances.rows[0].elements[0].duration && distances.rows[0].elements[0].duration.hasOwnProperty('value')) {
      duration = (distances.rows[0].elements[0].duration.value) / 60;
    }
    callback(null, duration);
  });
};


calculateDeliveryCost = function (originLatlong, destLatLong, callback) {
  var estimatedCost = CONFIG.APP_CONSTANTS.SERVER.BASE_DELIVERY_FEE;
  calculateDistanceViaGoogleDistanceMatrix(originLatlong, destLatLong, function (err, distanceInMiles) {
    // console.log('distances',err,distanceInMiles)
    if (err) {
      callback(err);
    } else {
      distanceInMiles = distanceInMiles && distanceInMiles.toFixed() || 0;
      estimatedCost += distanceInMiles * CONFIG.APP_CONSTANTS.SERVER.COST_PER_KM;
      callback(null, estimatedCost);
    }
  });
};

sendError = function (data) {
  var customErrorMessage;
  var errorToSend = '';
  var duplicateValue;
  if (typeof data === 'object' && data.hasOwnProperty('statusCode') && data.hasOwnProperty('customMessage')) {
    // console.log('attaching resposnetype',data.type)
    errorToSend = Boom.create(data.statusCode, data.customMessage);
    errorToSend.output.payload.responseType = data.type;
    return errorToSend;
  }
  if (typeof data === 'object') {
    if (data.name === 'MongoError') {
      errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage;
      if (data.code === 11000) {
        duplicateValue = data.errmsg && data.errmsg.substr(data.errmsg.lastIndexOf('{ : "') + 5);
        duplicateValue = duplicateValue.replace('}', '');
        errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE.customMessage + ' : ' + duplicateValue;
        if (data.message.indexOf('customer_1_streetAddress_1_city_1_state_1_country_1_zip_1') > -1) {
          errorToSend = CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DUPLICATE_ADDRESS.customMessage;
        }
      }
    } else if (data.name === 'ApplicationError') {
      errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + ' : ';
    } else if (data.name === 'ValidationError') {
      errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.APP_ERROR.customMessage + data.message;
    } else if (data.name === 'CastError') {
      errorToSend += CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.DB_ERROR.customMessage + CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.INVALID_ID.customMessage + data.value;
    }
  } else {
    errorToSend = data;
  }
  customErrorMessage = errorToSend;
  if (typeof customErrorMessage === 'string') {
    if (errorToSend.indexOf('[') > -1) {
      customErrorMessage = errorToSend.substr(errorToSend.indexOf('['));
    }
    customErrorMessage = customErrorMessage && customErrorMessage.replace(/"/g, '');
    customErrorMessage = customErrorMessage && customErrorMessage.replace('[', '');
    customErrorMessage = customErrorMessage && customErrorMessage.replace(']', '');
  }
  return Boom.create(400, customErrorMessage);
};

sendSuccess = function (successMsg, data) {
  successMsg = successMsg || CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT.customMessage;
  if (typeof successMsg === 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('customMessage')) {
    return { statusCode: successMsg.statusCode, message: successMsg.customMessage, data: data || null };
  }
  return { statusCode: 200, message: successMsg, data: data || null };
};

checkDuplicateValuesInArray = function (array) {
  var storeArray = [];
  var duplicateFlag = false;
  var i;
  if (array && array.length > 0) {
    for (i = 0; i < array.length; i++) {
      if (storeArray.indexOf(array[i]) === -1) {
        storeArray.push(array[i]);
      } else {
        duplicateFlag = true;
        break;
      }
    }
  }
  storeArray = [];
  return duplicateFlag;
};

failActionFunction = function (request, reply, source, error) {
  var customErrorMessage = '';
  if (error.output.payload.message.indexOf('[') > -1) {
    customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf('['));
  } else {
    customErrorMessage = error.output.payload.message;
  }
  customErrorMessage = customErrorMessage.replace(/"/g, '');
  customErrorMessage = customErrorMessage.replace('[', '');
  customErrorMessage = customErrorMessage.replace(']', '');
  error.output.payload.message = customErrorMessage;
  delete error.output.payload.validation;
  return reply(error);
};


customQueryDataValidations = function (type, key, data, callback) {
  var schema = {};
  var value = {};
  switch (type) {
    case 'PHONE_NO': schema[key] = Joi.string().regex(/^[0-9]+$/).length(10);
      break;
    case 'NAME': schema[key] = Joi.string().regex(/^[a-zA-Z ]+$/).min(2);
      break;
    case 'BOOLEAN': schema[key] = Joi.boolean();
      break;
    default: break;
  }
  value[key] = data;
  Joi.validate(value, schema, callback);
};


authorizationHeaderObj = Joi.object({
  authorization: Joi.string().required()
}).unknown();

getEmbeddedDataFromMongo = function (dataAry, keyToSearch, referenceIdToSearch, embeddedFieldModelName, variableToAttach, callback) {
  var taskToRunInParallel = [];
  var criteria = {};
  if (!dataAry || !keyToSearch || !variableToAttach || !embeddedFieldModelName || !Models[embeddedFieldModelName]) {
    callback(CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
  } else if (dataAry.length > 0) {
    taskToRunInParallel = [];
    dataAry.forEach(function (dataObj) {
      taskToRunInParallel.push((function (dataObj) {
        return function (embeddedCB) {
          if (!dataObj[referenceIdToSearch]) {
            callback(CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.IMP_ERROR);
          } else {
            criteria = {};
            criteria[keyToSearch] = dataObj[referenceIdToSearch];
            Models[embeddedFieldModelName].find(criteria, function (err, modelDataAry) {
              if (err) {
                embeddedCB(err);
              } else {
                if (modelDataAry) {
                  dataObj[variableToAttach] = modelDataAry;
                }
                embeddedCB();
              }
            });
          }
        };
      })(dataObj));
    });

    async.parallel(taskToRunInParallel, function (err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, dataAry);
      }
    });
  } else {
    callback(null, dataAry);
  }
};

CryptData = function (stringToCrypt) {
  return MD5(MD5(stringToCrypt));
};

generateRandomString = function () {
  return randomstring.generate(7);
};

filterArray = function (array) {
  return array.filter(function (n) {
    return n !== undefined && n !== '';
  });
};

sanitizeName = function (string) {
  return filterArray(string && string.split(' ') || []).join(' ');
};

verifyEmailFormat = function (string) {
  return validator.isEmail(string);
};

getFileNameWithUserId = function (thumbFlag, fullFileName, userId) {
  var prefix;
  var ext;
  prefix = CONFIG.APP_CONSTANTS.DATABASE.PROFILE_PIC_PREFIX.ORIGINAL;
  ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0, fullFileName.length);
  if (thumbFlag) {
    prefix = CONFIG.APP_CONSTANTS.DATABASE.PROFILE_PIC_PREFIX.THUMB;
  }
  return prefix + userId + ext;
};

getFileNameWithUserIdWithCustomPrefix = function (thumbFlag, fullFileName, type, userId) {
  var prefix = '';
  var ext;
  var ranNum;
  if (type === CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.DRIVER) {
    prefix = CONFIG.APP_CONSTANTS.DATABASE.DRIVER;
  } else if (type === CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.USER) {
    prefix = CONFIG.APP_CONSTANTS.DATABASE.USER;
  } else {
    prefix = CONFIG.APP_CONSTANTS.DATABASE.OTHER;
  }
  ext = fullFileName && fullFileName.length > 0 && fullFileName.substr(fullFileName.lastIndexOf('.') || 0, fullFileName.length);
  if (thumbFlag && type === CONFIG.APP_CONSTANTS.DATABASE.FILE_TYPES.LOGO) {
    prefix = CONFIG.APP_CONSTANTS.DATABASE.LOGO_PREFIX.THUMB;
  }
  ranNum = randomstring.generate(6);
  return prefix + ranNum + userId + ext;
};


validateLatLongValues = function (lat, long) {
  var valid = true;
  if (lat < -90 || lat > 90) {
    valid = false;
  }
  if (long < -180 || long > 180) {
    valid = false;
  }
  return valid;
};
deleteUnnecessaryUserData = function (userObj) {
  // console.log('deleting>>',userObj)
  delete userObj.__v;
  delete userObj.password;
  delete userObj.accessToken;
  delete userObj.emailVerificationToken;
  delete userObj.passwordResetToken;
  delete userObj.registrationDate;
  delete userObj.OTPCode;
  delete userObj.facebookId;
  delete userObj.codeUpdatedAt;
  delete userObj.deviceType;
  delete userObj.deviceToken;
  delete userObj.appVersion;
  delete userObj.isBlocked;
  // console.log('deleted',userObj)
  return userObj;
};


generateRandomStringNumber = function (len) {
  var text = '';
  var i;
  var charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

  for (i = 0; i < len; i++) { text += charset.charAt(Math.floor(Math.random() * charset.length)); }

  return text;
};


module.exports = {
  sendError: sendError,
  sendSuccess: sendSuccess,
  calculateDeliveryCost: calculateDeliveryCost,
  checkDuplicateValuesInArray: checkDuplicateValuesInArray,
  CryptData: CryptData,
  failActionFunction: failActionFunction,
  NotificationManager: NotificationManager,
  authorizationHeaderObj: authorizationHeaderObj,
  getEmbeddedDataFromMongo: getEmbeddedDataFromMongo,
  verifyEmailFormat: verifyEmailFormat,
  sanitizeName: sanitizeName,
  deleteUnnecessaryUserData: deleteUnnecessaryUserData,
  getDistanceBetweenPoints: getDistanceBetweenPoints,
  validateLatLongValues: validateLatLongValues,
  filterArray: filterArray,
  CONFIG: CONFIG,
  VALID_ERRAND_STATUS_ARRAY: VALID_ERRAND_STATUS_ARRAY,
  generateRandomString: generateRandomString,
  getFileNameWithUserId: getFileNameWithUserId,
  getFileNameWithUserIdWithCustomPrefix: getFileNameWithUserIdWithCustomPrefix,
  customQueryDataValidations: customQueryDataValidations,
  generateRandomStringNumber: generateRandomStringNumber,
  checkPathCoincide: checkPathCoincide
};

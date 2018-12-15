'use strict';

var Models = require('../Models');
var mongoose = require('mongoose');
var getUser, createUser, getAllGeneratedCodes, updateUser, countUser, getObjectId, getOneUser;
// Get Users from DB

getObjectId =function (id) {

  return mongoose.Types.ObjectId(id);

};
getUser = function (criteria, projection, options, callback) {
  Models.Users.find(criteria, projection, options, callback);
};
getOneUser = function (criteria, projection, options, callback) {
  Models.Users.findOne(criteria, projection, options, callback);
};


// Insert User in DB
createUser = function (objToSave, callback) {
  new Models.Users(objToSave).save(callback);
};

countUser = function (criteria, callback) {
  Models.Users.count(criteria, callback);
};
// Get All Generated Codes from DB
getAllGeneratedCodes = function (callback) {
  var criteria = {
    OTPCode: {$ne: null}
  };
  var projection = {
    OTPCode: 1
  };
  var options = {
    lean: true
  };
  var generatedCodes = [];
  Models.Users.find(criteria, projection, options, function (err, dataAry) {
    if (err) {
      callback(err);
    } else {
      if (dataAry && dataAry.length > 0) {
        dataAry.forEach(function (obj) {
          generatedCodes.push(obj.OTPCode.toString());
        });
      }
      callback(null, generatedCodes);
    }
  });
};
// Update User in DB
updateUser = function (criteria, dataToSet, options, callback) {
  options.lean = true;
  options.new = true;
  Models.Users.findOneAndUpdate(criteria, dataToSet, options, callback);
};
module.exports = {
  getUser: getUser,
  createUser: createUser,
  updateUser: updateUser,
  countUser: countUser,
  getAllGeneratedCodes:getAllGeneratedCodes,
  getObjectId:getObjectId,
  getOneUser:getOneUser
};

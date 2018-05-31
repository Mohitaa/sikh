'use strict';

var APP_CONSTANTS = require('./appConstants');
var dbConfig = require('./dbConfig');
 var smsConfig = require('./smsConfig');
// var awsS3Config = require('./awsS3Config');
// var emailConfig = require('./emailConfig');
// var pushConfig = require('./pushConfig');
module.exports = {
  APP_CONSTANTS:APP_CONSTANTS,
  dbConfig:dbConfig,
  smsConfig:smsConfig
};

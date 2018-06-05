'use strict';

/**
 * Created by mamta on 10/7/15.
 */

var Controller = require('../Controllers');
var Joi = require('joi');
var Config = require('../Config');
var UniversalFunctions = require('../Utils/UniversalFunctions');
module.exports = [
  {
    method: 'GET',
    path: '/api/hello',
    handler: function (request, reply) {
      Controller.UserController.user(function (err, data) {
        if (err) {
          reply(err);
        } else {
          reply(data);
        }
      });
    },
    config: {
      description: 'delete Bank Account Details For User',
      tags: ['api','hello'],
      validate: {
      },
      plugins: {
        'hapi-swagger': {
          responseMessages: ""
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/user/register',
    handler: function (request, reply) {
      var payloadData = request.payload;
      Controller.UserController.createUser(payloadData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201);
        }
      });
    },
    config: {
      description: 'Register User',
      tags: ['api', 'user'],
      payload: {
        maxBytes: 2000000,
        parse: true,
        output: 'file'
      },
      validate: {
        payload: {
          /*firstName: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
          lastName: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
          fatherName: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
          countryCode: Joi.string().max(4).optional().trim(),
          phoneNo: Joi.string().regex(/^[0-9]+$/).min(5).required(),
          district:Joi.string().optional().trim(),
          tehsil: Joi.string().optional().trim(),
          village: Joi.string().optional().trim(),
          landmark: Joi.string().optional().trim(),
          workAddress: Joi.string().optional().trim(),
          education: Joi.string().optional().trim(),
          occuption: Joi.string().optional().trim(),
          bloodGroup: Joi.string().trim(),
          gender: Joi.string().required().trim().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.MALE,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.FEMALE,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.OTHER]),
          privacy: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.PRIVACY.OFF,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.PRIVACY.ON]),
          password: Joi.string().required().min(5).trim(),
          deviceToken: Joi.string().required().trim(),
          profilePic: Joi.any()
              .meta({ swaggerType: 'file' })
              .optional()
              .description('image file')*/
        },
        failAction: UniversalFunctions.failActionFunction
      },
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
          responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/user/resendOTP',
    handler: function (request, reply) {
      var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
      Controller.UserController.resendOTP(userData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess());
        }
      });
    },
    config: {
      auth: 'UserAuth',
      validate: {
        headers: UniversalFunctions.authorizationHeaderObj,
        failAction: UniversalFunctions.failActionFunction
      },
      description: 'Resend OTP for User',
      tags: ['api', 'user'],
      plugins: {
        'hapi-swagger': {
          responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
        }
      }
    }
  },
  {
    method: 'PUT',
    path: '/api/user/verifyOTP',
    handler: function (request, reply) {
      var queryData = request.payload;
      var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
      Controller.UserController.verifyOTP(queryData, userData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess());
        }
      });
    },
    config: {
      auth: 'UserAuth',
      description: 'Verify OTP for User',
      tags: ['api', 'user'],
      validate: {
        headers: UniversalFunctions.authorizationHeaderObj,
        payload: {
          countryCode: Joi.string().max(4).required().trim(),
          phoneNo: Joi.string().regex(/^[0-9]+$/).min(5).required(),
          OTPCode: Joi.string().length(5).required()
        },
        failAction: UniversalFunctions.failActionFunction
      },
      plugins: {
        'hapi-swagger': {
          responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/user/login',
    handler: function (request, reply) {
      var payloadData = request.payload;
      Controller.UserController.loginUser(payloadData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess(null, data));
        }
      });
    },
    config: {
      description: 'Login Via phone Number & Password For  User',
      tags: ['api', 'user'],
      validate: {
        payload: {
          phoneNo: Joi.string().regex(/^[0-9]+$/).min(5).required(),
          password: Joi.string().required().min(5).trim(),
          flushPreviousSessions: Joi.boolean().required(),
          deviceToken: Joi.string().optional().allow('')
        },
        failAction: UniversalFunctions.failActionFunction
      },
      plugins: {
        'hapi-swagger': {
          responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/api/user/checkPhoneNumber',
    handler: function (request, reply) {
      var payloadData = request.payload;
      Controller.UserController.checkPhoneNumber(payloadData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess(null, data));
        }
      });
    },
    config: {
      description: 'verify Phone Number',
      tags: ['api', 'user'],
      validate: {
        payload: {
          phoneNo: Joi.string().regex(/^[0-9]+$/).min(5).required(),
        },
        failAction: UniversalFunctions.failActionFunction
      },
      plugins: {
        'hapi-swagger': {
          responseMessages: UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
        }
      }
    }
  }
];
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
          userName: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).required(),
          gender: Joi.string().optional().trim().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.MALE,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.FEMALE,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.OTHER]),
          password: Joi.string().required().min(5).trim(),
          deviceId: Joi.string().required().trim(),
          email: Joi.string().email().required(),
          social: Joi.any().optional(),
          profilePic: Joi.any()
              .meta({ swaggerType: 'file' })
              .optional()
              .description('image file')
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
    method: 'POST',
    path: '/api/customer/socialSignUp',
    handler: function (request, reply) {
      var payloadData = request.payload;
      Controller.UserController.socialSignUp(payloadData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.CREATED, data)).code(201);
        }
      });
    },
    config: {
      description: 'Social Sign Up Customer',
      tags: ['api', 'customer'],
      payload: {
        maxBytes: 2000000,
        parse: true,
        output: 'file'
      },
      validate: {
        payload: {
          userName: Joi.string().regex(/^[a-zA-Z ]+$/).trim().min(2).optional(),
          gender: Joi.string().optional().trim().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.MALE,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.FEMALE,UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.GENDER.OTHER]),
          email: Joi.string().email().required(),
          social: Joi.object().required().keys({
            socialMode: Joi.string().required().valid([UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.SOCIAL.FACEBOOK, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.SOCIAL.GOOGLE_PLUS, UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.SOCIAL.TWITTER]),
            socialId: Joi.string().required().trim()
          }),
          deviceId: Joi.string().required().trim(),
          password: Joi.string().optional().min(5).trim(),
          deviceToken: Joi.string().optional().allow(''),
          profilePic: Joi.any()
              .meta({ swaggerType: 'file' })
              .optional()
              .description('image file')
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
          email: Joi.string().email().required(),
          password: Joi.string().required().min(5).trim(),
          flushPreviousSessions: Joi.boolean().required(),
          deviceId: Joi.string().required().trim(),
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
  },
  {
    method: 'PUT',
    path: '/api/user/updatePassword',
    handler: function (request, reply) {
      var queryData = request.payload;
      var userData = request.auth && request.auth.credentials && request.auth.credentials.userData || null;
      Controller.UserController.changePassword(queryData, userData, function (err, data) {
        if (err) {
          reply(UniversalFunctions.sendError(err));
        } else {
          reply(UniversalFunctions.sendSuccess(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.UPDATED));
        }
      });
    },
    config: {
      description: 'Change Password User',
      tags: ['api', 'user'],
      auth: 'UserAuth',
      validate: {
        headers: UniversalFunctions.authorizationHeaderObj,
        payload: {
          oldPassword: Joi.string().required().min(5).trim(),
          newPassword: Joi.string().required().min(5).trim()
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
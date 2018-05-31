'use strict';

/**
 * Created bymamta on 27/5/18.
 */
var Config = require('../Config');
var async = require('async');
var apns = require('apn');
var Path = require('path');
var qs = require("querystring");
var http = require("http");
var client = require('twilio')(Config.smsConfig.twilioCredentials.accountSid, Config.smsConfig.twilioCredentials.authToken);
var nodeMailerModule = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
//var transporter = nodeMailerModule.createTransport(smtpTransport(Config.emailConfig.nodeMailer.Mandrill));
var winston = require('winston');
var fCM = require('fcm').FCM;
var sendPUSHToUser;
var sendSMSToUser;
var sendEmailToUser;
var Handlebars = require('handlebars');

function renderMessageFromTemplateAndVariables(templateData, variablesData) {
  return Handlebars.compile(templateData)(variablesData);
}

/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @ sendSMS Function
 @ This function will initiate sending sms as per the smsOptions are set
 @ Requires following parameters in smsOptions
 @ from:  // sender address
 @ to:  // list of receivers
 @ Body:  // SMS text message
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
function sendSMS(smsOptions, cb) {
  client.messages.create(smsOptions, function (err, message) {
    winston.info('SMS RES', err, message);
    if (err) {
      winston.info(err);
    } else {
      winston.info(message.sid);
    }
  });
  cb(null, null); // Callback is outside as sms sending confirmation can get delayed by a lot of time
}


/*
 ==========================================================
 Send the notification to the iOS device for User
 ==========================================================
 */

function sendIosPushNotification(iosDeviceToken, messageData, messageToDisplay, notificationType, userType) {
  var certificate = null;
  var gateway = null;
  var status = 1; var bookingId;
  var msg = messageToDisplay;
  var alertMsg;
  var snd;
  var options;
  var deviceToken;
  var apnsConnection;
  var note;
  var tokenData;
  winston.info('payload length before', JSON.stringify(messageData).length);

  messageData.statusUpdates = [];
  if (messageData.driver && messageData.driver.deviceToken) {
    messageData.driver.deviceToken = '';
  }
  if (messageData.user && messageData.customer.deviceToken) {
    messageData.customer.deviceToken = '';
  }
  winston.info('sending reduced payload', messageData);
  winston.info('payload length after', JSON.stringify(messageData).length);
  winston.info('path', Config.pushConfig.iOSPushSettings.user.iosApnCertificate);
  winston.info('path2', Path.resolve('.'));


  if (userType === Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER) {
    certificate = Path.resolve('.') + Config.pushConfig.iOSPushSettings.user.iosApnCertificate;
    gateway = Config.pushConfig.iOSPushSettings.user.gateway;
  } else {
    certificate = Path.resolve('.') + Config.pushConfig.iOSPushSettings.driver.iosApnCertificate;
    gateway = Config.pushConfig.iOSPushSettings.driver.gateway;
  }


  if (messageData.hasOwnProperty('notificationMessage')) {
    msg = messageData.notificationMessage;
    delete messageData.notificationMessage;
  }
  if (messageData.hasOwnProperty('bookingId')) {
    bookingId = messageData.bookingId;
    delete messageData.bookingId;
  }

  alertMsg = msg;
  snd = 'ping.aiff';
  // if (flag == 4 || flag == 6) {
  //    status = 0;
  //    msg = '';
  //    snd = '';
  // }
  winston.info('certificate', certificate, 'Config.pushConfig.iOSPushSettings.user.gateway', gateway);

  options = {
    cert: certificate,
    certData: null,
    key: certificate,
    keyData: null,
    passphrase: 'click',
    ca: null,
    pfx: null,
    pfxData: null,
    gateway: gateway,
    port: 2195,
    rejectUnauthorized: true,
    enhanced: true,
    autoAdjustCache: true,
    connectionTimeout: 0,
    ssl: true,
    debug: true
    //  production : true
  };

  function log(type) {
    return function () {
      console.log("kkkkkkkkkkk>>>>>>>>>>>>>>>>>>>")
      winston.info('iOS PUSH NOTIFICATION RESULT: ' + type);
    };
  }
  if (iosDeviceToken) {
    winston.info('iosDeviceToken', iosDeviceToken);
    tokenData = iosDeviceToken;
    try {
      winston.info('tokenData', tokenData, certificate);
      deviceToken = new apns.Device(tokenData);
      apnsConnection = new apns.Connection(options);
      note = new apns.Notification();

      note.expiry = Math.floor(Date.now() / 1000) + 3600;
      note.contentAvailable = 1;
      note.sound = snd;
      note.alert = alertMsg;
      note.newsstandAvailable = status;
      note.payload = {
        messageToDisplay: messageToDisplay,
        data: messageData,
        notificationType: notificationType
      };

      apnsConnection.pushNotification(note, deviceToken);

      // Handle these events to confirm that the notification gets
      // transmitted to the APN server or find error if any
      apnsConnection.on('transmissionError', function (errCode, notification, device) {
         console.error("Notification caused error: " + errCode + " for device ", device.token.toString("hex"), notification);

      });

      apnsConnection.on('error', log('error'));
      apnsConnection.on('transmitted', log('transmitted'));
      apnsConnection.on('timeout', log('timeout'));
      apnsConnection.on('connected', log('connected'));
      apnsConnection.on('disconnected', log('disconnected'));
      apnsConnection.on('socketError', log('socketError'));
      apnsConnection.on('transmissionError', log('transmissionError'));
      apnsConnection.on('cacheTooSmall', log('cacheTooSmall'));
    } catch (e) {
      // console.trace('exceptioon occured',e)
    }
  }
}


/*
 ==============================================
 Send the notification to the android device
 =============================================
 */
function sendAndroidPushNotification(deviceToken, messageData, messageToDisplay, notificationType, userType) {
  var FCM;
  var fcm;
  var message;
  var sender;
  var registrationIds;

  winston.info('messageData------------', messageData);
  FCM = fCM;

  fcm = new FCM(Config.pushConfig.androidPushSettings.user.fcmSender);
  message = {
    registration_id: deviceToken, // required
    collapse_key: 'demo',
    'data.messageToDisplay': messageData.notificationMessage,
    'data.info': JSON.stringify(messageData),
    'data.notificationType': notificationType

  };
  // console.log('<<<<<<<<message>>>>>>>>>>', message);
  fcm.send(message, function (err, messageId) {
    if (err) {
      winston.info('Something has gone wrong!');
      winston.info('ANDROID NOTIFICATION ERROR: ' + JSON.stringify(err));
    } else {
      winston.info('Sent with message ID: ', messageId);
      winston.info('ANDROID NOTIFICATION RESULT: ' + JSON.stringify(messageId));
    }
  });
}

function sendAndroidPushNotificationBackup(deviceToken, message) {
  winston.info(message);

  message = new gcm.Message({
    collapseKey: 'demo',
    delayWhileIdle: false,
    timeToLive: 2419200,
    data: {
      message: message,
      brand_name: config.androidPushSettings.brandName
    }
  });
  var sender = new gcm.Sender(config.pushConfig.androidPushSettings.gcmSender);
  var registrationIds = [];
  registrationIds.push(deviceToken);

  sender.send(message, registrationIds, 4, function (err, result) {
    if (debugging_enabled) {
      winston.info('ANDROID NOTIFICATION RESULT: ' + JSON.stringify(result));
      winston.info('ANDROID NOTIFICATION ERROR: ' + JSON.stringify(err));
    }
  });
}

/*
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 @ sendMailViaTransporter Function
 @ This function will initiate sending email as per the mailOptions are set
 @ Requires following parameters in mailOptions
 @ from:  // sender address
 @ to:  // list of receivers
 @ subject:  // Subject line
 @ html: html body
 @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
// function sendMailViaTransporter(mailOptions, cb) {
//   transporter.sendMail(mailOptions, function (error, info) {
//     winston.info('Mail Sent Callback Error:', error);
//     winston.info('Mail Sent Callback Ifo:', info);
//   });
//   cb(null, null); // Callback is outside as mail sending confirmation can get delayed by a lot of time
// }


// sendPUSHToUser = function (deviceToken, deviceType, userType, dataToSend, notificationType, callback) {
//   winston.info('sendPUSHToUser', deviceToken, deviceType, userType, dataToSend, notificationType);
//   if (deviceType === Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID || deviceType === Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
//     if (deviceType === Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID) {
//       sendAndroidPushNotification(deviceToken, dataToSend, notificationType, notificationType, userType);
//       callback();
//     } else if (deviceType === Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS) {
//       console.log("nnnnnnnnnnnnnnnnnnnnnnnn",deviceToken, dataToSend, notificationType, notificationType, userType);
//       sendIosPushNotification(deviceToken, dataToSend, notificationType, notificationType, userType);
//       callback();
//     }
//   } else {
//     callback();
//   }
// };

var sendSMSToFactor = function (four_digit_verification_code,countryCode,phoneNo,externalCB) {
  var templateData;
  var variableDetails;
  var smsOptions, api_key;
  templateData = Config.APP_CONSTANTS.notificationMessages.verificationCodeMsg;
  variableDetails = {
    four_digit_verification_code: four_digit_verification_code
  };
  var verificationCode = parseInt(four_digit_verification_code, 10);
  var  phone_number = '91' + phoneNo;
   phone_number = parseInt(phoneNo, 10);
  api_key = Config.smsConfig.factor2Credencials.api_key;
  var options = {
    "method": "GET",
    "hostname": "2factor.in",
    "port": null,
    "path":  '/API/V1/' + api_key + '/SMS/' + phoneNo + '/' + verificationCode,
    "headers": {
      "content-type": "application/x-www-form-urlencoded"
    }
  };

  var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
      chunks.push(chunk);
    });

    res.on("end", function () {
      var body = Buffer.concat(chunks);
      console.log(body.toString());
      return externalCB(null,body.toString())
    });

  });

  req.write(qs.stringify({}));
  req.end();
};
sendSMSToUser = function (four_digit_verification_code, countryCode, phoneNo, externalCB) {
  var templateData;
  var variableDetails;
  var smsOptions;
  winston.info('sendSMSToUser');

  templateData = Config.APP_CONSTANTS.notificationMessages.verificationCodeMsg;
  variableDetails = {
    four_digit_verification_code: four_digit_verification_code
  };

  smsOptions = {
    from: Config.smsConfig.twilioCredentials.smsFromNumber,
    To: countryCode + phoneNo.toString(),
    Body: null
  };

  async.series([
    function (internalCallback) {
      smsOptions.Body = renderMessageFromTemplateAndVariables(templateData, variableDetails);
      internalCallback();
    }, function (internalCallback) {
      sendSMS(smsOptions, function (err, res) {
        internalCallback(err, res);
      });
    }
  ], function (err, responses) {
    if (err) {
      externalCB(err);
    } else {
      externalCB(null, Config.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT);
    }
  });
};


// sendEmailToUser = function (emailType, emailVariables, emailId, callback) {
//   var mailOptions = {
//     from: 'info@cargoclick.com',
//     to: emailId,
//     subject: null,
//     html: null
//   };
//   async.series([
//     function (cb) {
//       switch (emailType) {
//         case 'REGISTRATION_MAIL':
//           mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.registrationEmail.emailSubject;
//           mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.registrationEmail.emailMessage, emailVariables);
//           break;
//         case 'FORGOT_PASSWORD':
//           mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailSubject;
//           mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.forgotPassword.emailMessage, emailVariables);
//           break;
//         case 'DRIVER_CONTACT_FORM':
//           mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.contactDriverForm.emailSubject;
//           mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.contactDriverForm.emailMessage, emailVariables);
//           break;
//         case 'BUSINESS_CONTACT_FORM':
//           mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.contactBusinessForm.emailSubject;
//           mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.contactBusinessForm.emailMessage, emailVariables);
//           break;
//         case 'NEW_DRIVER_REGISTER':
//           mailOptions.subject = Config.APP_CONSTANTS.notificationMessages.newdriverregister.emailSubject;
//           mailOptions.html = renderMessageFromTemplateAndVariables(Config.APP_CONSTANTS.notificationMessages.newdriverregister.emailMessage, emailVariables);
//           break;
//         default : break;
//       }
//       cb();
//     }, function (cb) {
//       sendMailViaTransporter(mailOptions, function (err, res) {
//         cb(err, res);
//       });
//     }
//   ], function (err, responses) {
//     if (err) {
//       callback(err);
//     } else {
//       callback();
//     }
//   });
// };


module.exports = {
  sendSMSToUser: sendSMSToUser,
  sendSMSToFactor:sendSMSToFactor,
  sendEmailToUser: sendEmailToUser,
  sendPUSHToUser: sendPUSHToUser
};

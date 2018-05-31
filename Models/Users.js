var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var Users = new Schema({
  firstName: {type: String, trim: true, index: true, default: null, sparse: true},
  lastName: {type: String, trim: true, index: true, default: null, sparse: true},
  fatherName: {type: String, trim: true, index: true, default: null, sparse: true},
  countryCode: {type: String, required: true, trim: true, min: 2, max: 5},
  phoneNo: {type: String, required: true, trim: true, index: true, unique: true, min: 5, max: 15},
  newNumber: {type: String, trim: true, sparse: true, index: true, unique: true, min: 5, max: 15},
  district:{type: String, trim: true, sparse: true},
  tehsil: {type: String, trim: true, sparse: true},
  village: {type: String, trim: true, sparse: true},
  landmark: {type: String, trim: true, sparse: true},
  homeAddress: {type: String, trim: true, sparse: true},
  workAddress: {type: String, trim: true, sparse: true},
  education: {type: String, trim: true, sparse: true},
  occuption: {type: String, trim: true, sparse: true},

  bloodGroup: {type: String, trim: true, sparse: true},
  gender: {type: String, type: String,
    required: true,
    default: Config.APP_CONSTANTS.DATABASE.GENDER.MALE,
    enum: [
      Config.APP_CONSTANTS.DATABASE.GENDER.MALE,
      Config.APP_CONSTANTS.DATABASE.GENDER.FEMALE,
      Config.APP_CONSTANTS.DATABASE.GENDER.OTHER
    ]
  },
  privacy: {
    type: String, type: String,
    required: true,
    default: Config.APP_CONSTANTS.DATABASE.PRIVACY.OFF,
    enum: [
      Config.APP_CONSTANTS.DATABASE.PRIVACY.OFF,
      Config.APP_CONSTANTS.DATABASE.PRIVACY.ON
    ]
  },
  userType: {
    type: String, type: String,
    required: true,
    default: Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER,
    enum: [
      Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER,
      Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
    ]
  },
  phoneNoNew: {type: String, trim: true, sparse: true, unique: true, min: 5, max: 15},
  social: {
    socialMode: {
      type: String,
      enum: [Config.APP_CONSTANTS.DATABASE.SOCIAL.FACEBOOK, Config.APP_CONSTANTS.DATABASE.SOCIAL.LINKED_IN, Config.APP_CONSTANTS.DATABASE.SOCIAL.GOOGLE_PLUS, Config.APP_CONSTANTS.DATABASE.SOCIAL.TWITTER]
    },
    socialId: {type: String}
  },
  codeUpdatedAt: {type: Date, default: Date.now, required: true},
  firstTimeLogin: {type: Boolean, default: false},
  language: {
    type: String,
    required: true,
    default: Config.APP_CONSTANTS.DATABASE.LANGUAGE.ES_MX,
    enum: [
      Config.APP_CONSTANTS.DATABASE.LANGUAGE.EN,
      Config.APP_CONSTANTS.DATABASE.LANGUAGE.ES_MX
    ]
  },
  password: {type: String},
  passwordResetToken: {type: String, trim: true, unique: true, index: true, sparse: true},
  registrationDate: {type: Date, default: Date.now, required: true},
  OTPCode: {type: String, trim: true, unique: true, sparse: true, index: true},
  OTPCount: {type: Number, default: 1},
  OTPGeneratedDate: {type: Date, default: Date.now, required: true},
  accessToken: {type: String, trim: true, index: true, unique: true, sparse: true},
  deviceToken: {type: String, trim: true, index: true, unique: true, sparse: true},
  deviceType: {
    type: String,
    enum: [
      Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.IOS,
      Config.APP_CONSTANTS.DATABASE.DEVICE_TYPES.ANDROID
    ]
  },
  isBlocked: {type: Boolean, default: false, required: true},
  isDeleted: {type: Boolean, default: false, required: true},
  phoneVerified: {type: Boolean, default: false, required: true},
  profilePicURL: {
    original: {type: String, default: null},
    thumbnail: {type: String, default: null}
  },
  totalRating: {type: Number, default: 0},
  usersRated: {type: Number, default: 0}
});

module.exports = mongoose.model('Users', Users);
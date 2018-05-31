'use strict';

var mongoURL;
var mongo;
var mongoUser = "SERVER";
    var mongoPassword = "5Fq3OZhfCU23wyVB";
    var env = "SERVER-dev";


if (process.env.NODE_ENV === 'test') {
  mongoURL = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost/' + process.env.MONGO_DBNAME_TEST;
} else if (process.env.NODE_ENV === 'dev') {
  mongoURL = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost/' + process.env.MONGO_DBNAME_DEV;
} else if (process.env.NODE_ENV === 'live') {
  mongoURL = 'mongodb://' + process.env.MONGO_USER + ':' + process.env.MONGO_PASS + '@localhost/' + process.env.MONGO_DBNAME_LIVE;
} else {
 // mongoURL = 'mongodb://localhost/sikhdir';
//  mongoURL = 'mongodb://mamta:admin@ds235850.mlab.com:35850/sikhdir';

  mongoURL = 'mongodb://' + mongoUser + ':' + mongoPassword + '@localhost/' + env;
}

mongo = {
  URI: mongoURL,
  port: 27017
};


module.exports = {
  mongo: mongo
};

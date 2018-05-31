'use strict';

/**
 * Created bymamta on 27/5/18.
 */

// Register Swagger
var nodeEnv;
var pack;
var Inert;
var Vision;
var HapiSwagger;
var swaggerOptions;

nodeEnv = 'Local';
if (process.env.NODE_ENV !== undefined) {
  nodeEnv = process.env.NODE_ENV;
}

pack = require('../package');
swaggerOptions = {
        //  basePath : '/api/v1',
  pathPrefixSize: 2,
  info: {
    title: 'sikhdir-' + nodeEnv,
    version: pack.version
  }

};

Inert = require('inert');
Vision = require('vision');
HapiSwagger = require('hapi-swagger');

exports.register = function (server, options, next) {
  server.register([
    Inert,
    Vision,
    {
      register: HapiSwagger,
      options: swaggerOptions
    }], function (err) {
    if (err) {
            console.log('Error Loading Swagger : ' + err)
    }
  });

  next();
};

exports.register.attributes = {
  name: 'swagger-plugin'
};

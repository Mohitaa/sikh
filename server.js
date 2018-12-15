'use strict';

/**
 * Created by mamta on 10/7/18.
 */

// External Dependencies

// External Dependencies
var Hapi = require('hapi');
var hb = require('handlebars');
// Internal Dependencies
var Config = require('./Config');
var Routes = require('./Routes');
var Plugins = require('./Plugins');
var Bootstrap = require('./Utils/BootStrap');
var winston = require('winston');

// Create Server
var server = new Hapi.Server({
  app: {
    // name: Config.APP_CONSTANTS.SERVER.appName
  }
});

server.connection({
  port: Config.APP_CONSTANTS.SERVER.PORTS.HAPI,
  routes: { cors: true }
});

// Register All Plugins
server.register(Plugins, function (err) {
  if (err) {
    server.error('Error while loading plugins : ' + err);
  } else {
    server.log('info', 'Plugins Loaded');
  }
});


// Default Routes
server.route(
    {
      method: 'GET',
      path: '/',
      handler: function (req, res) {
        // TODO Change for production server
        res.view('index');
      }
    }
);

// API Routes
server.route(Routes);

// Bootstrap admin data
Bootstrap.bootstrapAdmin(function (err, message) {
  if (err) {
    winston.error('Error while bootstrapping admin : ' + err);
  } else {
    winston.info(message);
  }
});
// Bootstrap Version data
Bootstrap.bootstrapAppVersion(function (err, message) {
  if (err) {
    winston.error('Error while bootstrapping version : ' + err);
  } else {
    winston.info(message);
  }
});

// Adding Views
server.views({
  engines: {
    html: hb
  },
  relativeTo: __dirname,
  path: './Views'
});

// Start Server
server.start(function () {
  winston.info('info', 'Server running at: ' + server.info.uri);
});

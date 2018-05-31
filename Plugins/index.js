/**
 * Created by mamta on 27/5/18.
 */
var swagger = require('./swagger');
var gc = require('./good-console');
var at = require('./auth-token');
module.exports = [
    { register: swagger },
    { register: gc },
  {register: at}
];

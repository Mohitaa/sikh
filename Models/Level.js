var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var Levels = new Schema({
  totalQuestion : {type: number, trim: true, index: true, default: 10, sparse: true},
  qualificationMark : {type: number, trim: true, index: true, default: 35, sparse: true}
});

Levels.index({ name: 1 });

module.exports = mongoose.model('Levels', Levels);

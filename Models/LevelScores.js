var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var LevelScores = new Schema({
  userId: { type: Schema.ObjectId, ref: 'Users', required: true },
  levelId: { type: Boolean, default: false },
  scores :{type: number, default: 0},
  status:{type: number, default: 0}// 0 lock 1 unlock
},{
  timestamps :true
});

LevelScores.index({ name: 1 });

module.exports = mongoose.model('LevelScores', LevelScores);

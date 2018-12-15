var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Config = require('../Config');

var Questions = new Schema({
  levelId: { type: Schema.ObjectId, ref: 'Levels', required: true },
  question : {type: string, trim: true, index: true, default: null, sparse: true},
  A : {type: string, trim: true, default: null, sparse: true},
  B : {type: string, trim: true,  default: null, sparse: true},
  C : {type: string, trim: true,  default: null, sparse: true},
  D : {type: string, trim: true,  default: null, sparse: true},
  correctAnswer : {type: string, trim: true,  default: null, sparse: true}
});

Questions.index({ question: 1 });

module.exports = mongoose.model('Questions', Questions);

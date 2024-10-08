const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema({
    title: { type: String, required: true },
    path: { type: String, required: true },
    duration: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }, { timestamps: true });
  
  module.exports = mongoose.model('Song', SongSchema);
  
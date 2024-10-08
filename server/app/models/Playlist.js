const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
    name: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]
  }, { timestamps: true });
  
  module.exports = mongoose.model('Playlist', PlaylistSchema);
  
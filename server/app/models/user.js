const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Sprawdzenie, czy model już istnieje, aby uniknąć błędu OverwriteModelError
const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    minlength: 5, 
    maxlength: 15, 
    match: /^[a-zA-Z0-9_-]+$/, 
    trim: true 
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }],
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

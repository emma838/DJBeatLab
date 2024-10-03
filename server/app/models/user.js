const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: {
    type: String, // Ścieżka do zdjęcia profilowego
    default: '',  // Można ustawić domyślne zdjęcie
  }
});

module.exports = mongoose.model('User', UserSchema);

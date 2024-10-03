const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true, 
    minlength: 5, // Minimalna długość
    maxlength: 15, // Maksymalna długość
    match: /^[a-zA-Z0-9_-]+$/, // Tylko litery, cyfry, _ i -
    trim: true // Usuwanie białych znaków z przodu i tyłu
},
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: {
    type: String, // Ścieżka do zdjęcia profilowego
    default: '',  // Można ustawić domyślne zdjęcie
  }
});

module.exports = mongoose.model('User', UserSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        minlength: 5, 
        maxlength: 15, 
        match: /^[a-zA-Z0-9_-]+$/, 
        trim: true 
    }, // Nazwa użytkownika, wymagana, unikalna, 5-15 znaków, dozwolone znaki a-z, A-Z, 0-9, _ i -
    email: { type: String, required: true, unique: true }, // Email użytkownika, wymagany, unikalny
    password: { type: String, required: true }, // Hasło użytkownika, wymagane
    playlists: [{ type: Schema.Types.ObjectId, ref: 'Playlist' }] // Lista playlist użytkownika, odniesienie do modelu 'Playlist'
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PlaylistSchema = new Schema({
    name: { type: String, required: true },     // Nazwa playlisty, wymagana
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },  // ID użytkownika, który stworzył playlistę, odniesienie do modelu 'User', wymagane
    songs: [{ type: Schema.Types.ObjectId, ref: 'Song' }]  // Lista ID utworów w playliście, odniesienie do modelu 'Song'
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);

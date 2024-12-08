const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema({
    title: { type: String, required: true },          // Tytuł utworu, wymagany
    author: { type: String, required: true },         // Autor utworu, wymagany
    filename: { type: String, required: true },       // Nazwa pliku utworu, wymagany
    path: { type: String, required: true },           // Ścieżka do pliku utworu, wymagana
    duration: { type: Number },                        // Długość utworu w sekundach
    bpm: { type: Number },                             // Tempo utworu (BPM)
    key: { type: String },                             // Tonacja utworu
    albumImage: { type: String },                      // Ścieżka do obrazka albumu
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }  // ID użytkownika, który dodał utwór, odniesienie do modelu 'User', wymagane
}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema);

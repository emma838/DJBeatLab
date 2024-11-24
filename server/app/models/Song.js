const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SongSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String, required: true }, // Dodane pole author
    filename: { type: String, required: true }, // Dodane pole filename
    path: { type: String, required: true },
    duration: { type: Number },
    bpm: { type: Number },
    key: { type: String },
    albumImage: String,
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Song', SongSchema);

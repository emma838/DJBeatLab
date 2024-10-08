const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const User = require('../models/User');

// Tworzenie nowej playlisty
const createPlaylist = async (req, res) => {
  const { name, songIds } = req.body;
  const userId = req.user.userId; // Zakładamy, że userId jest ustawiony w middleware autoryzacyjnym

  try {
    // Tworzenie nowej playlisty z przypisanymi utworami
    const playlist = new Playlist({
      name,
      user: userId,
      songs: songIds, // Zakładamy, że songIds to tablica z identyfikatorami utworów
    });

    await playlist.save();

    // Dodanie playlisty do użytkownika
    await User.findByIdAndUpdate(userId, { $push: { playlists: playlist._id } });

    res.status(201).json({ msg: 'Playlista utworzona pomyślnie', playlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera podczas tworzenia playlisty' });
  }
};

// Dodawanie utworu do playlisty
const addSongToPlaylist = async (req, res) => {
  const { playlistId, songId } = req.body;

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId } }, // Używamy $addToSet, aby uniknąć duplikatów
      { new: true }
    ).populate('songs');

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlista nie znaleziona' });
    }

    res.json({ msg: 'Utwór dodany do playlisty', playlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera podczas dodawania utworu do playlisty' });
  }
};

// Usuwanie utworu z playlisty
const removeSongFromPlaylist = async (req, res) => {
  const { playlistId, songId } = req.body;

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId } }, // Usuwamy utwór ze zbioru
      { new: true }
    ).populate('songs');

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlista nie znaleziona' });
    }

    res.json({ msg: 'Utwór usunięty z playlisty', playlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera podczas usuwania utworu z playlisty' });
  }
};

// Usuwanie playlisty
const deletePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user.userId;

  try {
    const playlist = await Playlist.findOneAndDelete({ _id: playlistId, user: userId });

    if (!playlist) {
      return res.status(404).json({ msg: 'Playlista nie znaleziona' });
    }

    // Usunięcie playlisty z listy użytkownika
    await User.findByIdAndUpdate(userId, { $pull: { playlists: playlistId } });

    res.json({ msg: 'Playlista usunięta pomyślnie' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera podczas usuwania playlisty' });
  }
};

// Pobieranie wszystkich playlist użytkownika
const getUserPlaylists = async (req, res) => {
  const userId = req.user.userId; // zakładamy, że userId jest ustawiony w middleware autoryzacyjnym

  try {
    const playlists = await Playlist.find({ user: userId }).populate('songs');
    res.status(200).json({ playlists });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera podczas pobierania playlist' });
  }
};

// Zmiana nazwy playlisty
const renamePlaylist = async (req, res) => {
  const { playlistId } = req.params;
  const { name } = req.body;

  try {
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name },
      { new: true } // Zwrócenie zaktualizowanego dokumentu
    );
    
    if (!playlist) {
      return res.status(404).json({ msg: 'Playlista nie znaleziona' });
    }

    res.status(200).json({ msg: 'Nazwa playlisty zaktualizowana', playlist });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera podczas zmiany nazwy playlisty' });
  }
};

module.exports = {
  getUserPlaylists,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  renamePlaylist
};

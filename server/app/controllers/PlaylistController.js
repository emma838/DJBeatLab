const Playlist = require('../models/Playlist');
const Song = require('../models/Song');
const User = require('../models/User');

// Tworzenie nowej playlisty
const createPlaylist = async (req, res) => {
  const { name, songIds } = req.body;
  const userId = req.user.userId; // Pobieranie ID użytkownika z middleware autoryzacyjnego

  try {
    // Tworzenie nowej playlisty z przypisanymi utworami
    const playlist = new Playlist({
      name,
      user: userId,
      songs: songIds, // Zakładamy, że songIds to tablica z ID utworów
    });

    await playlist.save();

    // Dodanie playlisty do listy użytkownika
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

  console.log('Dodawanie utworu do playlisty:', { playlistId, songId });

  try {
    // Walidacja obecności wymaganych parametrów
    if (!playlistId || !songId) {
      return res.status(400).json({ msg: 'Brakuje playlistId lub songId' });
    }

    // Sprawdzanie, czy utwór istnieje
    const songExists = await Song.findById(songId);
    if (!songExists) {
      console.log(`Utwór o ID ${songId} nie istnieje`);
      return res.status(404).json({ msg: 'Utwór nie znaleziony' });
    }

    // Logika dla playlisty "uploads"
    if (playlistId === 'uploads') {
      console.log('Dodawanie utworu do katalogu uploads');
      return res.status(200).json({ msg: 'Utwór znajduje się już w katalogu uploads', song: songExists });
    }

    // Dodanie utworu do playlisty
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId } }, // Unikamy duplikatów
      { new: true }
    ).populate('songs');

    if (!playlist) {
      console.log(`Playlista o ID ${playlistId} nie istnieje`);
      return res.status(404).json({ msg: 'Playlista nie znaleziona' });
    }

    console.log('Playlista po dodaniu utworu:', playlist);

    res.json({ msg: 'Utwór dodany do playlisty', playlist });
  } catch (err) {
    console.error('Błąd serwera podczas dodawania utworu do playlisty:', err);
    res.status(500).json({ msg: 'Błąd serwera podczas dodawania utworu do playlisty' });
  }
};

// Usuwanie utworu z playlisty
const removeSongFromPlaylist = async (req, res) => {
  const { playlistId, songId } = req.body;

  try {
    // Usuwanie utworu z playlisty
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId } },
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
    // Usuwanie playlisty użytkownika
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
  const userId = req.user.userId;

  try {
    // Pobieranie playlist użytkownika wraz z ich utworami
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
    // Aktualizacja nazwy playlisty
    const playlist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name },
      { new: true }
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

// Pobieranie utworów z konkretnej playlisty
const getPlaylistSongs = async (req, res) => {
  const { playlistId } = req.params;

  try {
    // Pobieranie playlisty z jej utworami
    const playlist = await Playlist.findById(playlistId).populate('songs');
    if (!playlist) {
      return res.status(404).json({ msg: 'Playlista nie znaleziona' });
    }

    res.status(200).json({ songs: playlist.songs });
  } catch (err) {
    console.error('Błąd serwera przy pobieraniu utworów z playlisty:', err);
    res.status(500).json({ msg: 'Błąd serwera przy pobieraniu utworów z playlisty' });
  }
};

// Pobieranie wszystkich utworów użytkownika
const getAllSongs = async (req, res) => {
  const userId = req.user.userId;

  console.log('Pobieranie wszystkich utworów dla użytkownika:', userId);

  try {
    // Pobieranie utworów użytkownika
    const songs = await Song.find({ user: userId });
    if (!songs || songs.length === 0) {
      return res.status(404).json({ msg: 'Brak utworów dla tego użytkownika' });
    }

    res.status(200).json({ songs });
  } catch (err) {
    console.error('Błąd serwera przy pobieraniu utworów użytkownika:', err);
    res.status(500).json({ msg: 'Błąd serwera przy pobieraniu utworów użytkownika' });
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistSongs,
  getAllSongs,
  createPlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  renamePlaylist
};

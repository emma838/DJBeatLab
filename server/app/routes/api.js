const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
    registration,
    login,
    loginLimiter,
} = require('../controllers/AuthController');

const {
    getProfile,
    updateUsername
} = require('../controllers/ProfileController');

const {
    uploadFile,
    getFiles,
    deleteFile  
} = require('../controllers/FileController');

const {
    getUserPlaylists,
    getPlaylistSongs,
    getAllSongs,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    renamePlaylist
} = require('../controllers/PlaylistController');

// Trasy autoryzacyjne
router.post('/register', registration);
router.post('/login', loginLimiter, login);

// Trasa do pobierania danych użytkownika (np. nazwa użytkownika)
router.get('/profile', verifyToken, getProfile);

// Trasa do aktualizacji nazwy użytkownika
router.post('/profile/update-username', verifyToken, updateUsername);

// Trasa do uploadu pliku
router.post('/files/upload', verifyToken, upload.single('file'), uploadFile);

// Trasa do pobierania listy plików wgranych przez użytkownika
router.get('/files/uploaded', verifyToken, getFiles);

//usuwanie pliku
router.delete('/files/delete/:songId', verifyToken, deleteFile);

// Tworzenie playlisty
router.post('/playlist/create', verifyToken, createPlaylist);

// Dodawanie utworu do playlisty
router.post('/playlist/add-song', verifyToken, addSongToPlaylist);

// Trasa do pobierania listy plików wgranych przez użytkownika
router.get('/playlist/get-playlists', verifyToken, getUserPlaylists);

// Usuwanie utworu z playlisty
router.post('/playlist/remove-song', verifyToken, removeSongFromPlaylist);

// Usuwanie playlisty
router.delete('/playlist/delete/:playlistId', verifyToken, deletePlaylist);

// Trasa do zmiany nazwy playlisty
router.put('/playlist/:playlistId/rename', verifyToken, renamePlaylist);

// Trasa do pobierania utworów z playlisty
router.get('/playlist/:playlistId/songs', verifyToken, getPlaylistSongs);

// Trasa do pobierania wszytkich utworów uzytkownika do wyswietlenia jako playlista
router.get('/playlist/all-songs', verifyToken, getAllSongs);

module.exports = router;
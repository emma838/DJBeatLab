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
    getFiles
} = require('../controllers/FileController');

const {

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

module.exports = router;
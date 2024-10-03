const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddleware'); // Poprawiony import
const {
    verificationSecureToken,
    registration,
    login,
    loginLimiter,
} = require('../controllers/AuthController'); 

const {
    getProfile,
    updateUsername
} = require('../controllers/ProfileController');

// Trasy do autoryzacji
router.get('/secure', verifyToken, verificationSecureToken); 

// Trasa do pobierania danych użytkownika (np. nazwa użytkownika)
router.get('/profile', verifyToken, getProfile);


router.post('/register', registration);
router.post('/login',  loginLimiter,  login);


// Trasa do aktualizacji nazwy użytkownika
router.post('/profile/update-username', verifyToken, updateUsername);


module.exports = router;
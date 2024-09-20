const express = require('express');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/user');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middlewares/authMiddleware'); // Poprawiony import
const router = express.Router();

dotenv.config(); // Wczytanie zmiennych środowiskowych

// Zabezpieczona trasa
router.get('/secure', verifyToken, (req, res) => {
    res.json({ msg: 'Dostęp przyznany do chronionej trasy', user: req.user });
});

// Rejestracja użytkownika
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Sprawdzanie, czy hasło jest wystarczająco silne
    if (!validator.isStrongPassword(password, { minLength: 8, minSymbols: 1 })) {
        return res.status(400).json({ msg: 'Hasło musi mieć co najmniej 8 znaków i zawierać znak specjalny' });
    }

    try {
        // Sprawdzenie, czy użytkownik już istnieje
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Użytkownik o tym adresie e-mail już istnieje' });
        }

        // Sprawdzenie, czy nazwa użytkownika już istnieje
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Nazwa użytkownika jest już zajęta' });
        }

        // Hashowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tworzenie nowego użytkownika
        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();
        res.status(201).json({ msg: 'Zarejestrowano pomyślnie' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 5, // Maksymalnie 5 prób logowania na 15 minut
    message: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut',
});

// Logowanie użytkownika
router.post('/login', loginLimiter, async (req, res) => {
    const { emailOrUsername, password } = req.body;

    try {
        // Znalezienie użytkownika po adresie e-mail lub nazwie użytkownika
        const user = await User.findOne({ 
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (!user) {
            return res.status(400).json({ msg: 'Niepoprawne dane logowania' });
        }

        // Sprawdzanie hasła
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Niepoprawne dane logowania' });
        }

        // Tworzenie tokenu JWT wewnątrz trasy
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
});

module.exports = router;

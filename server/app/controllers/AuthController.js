const bcrypt = require('bcryptjs'); // Biblioteka do haszowania haseł
const dotenv = require('dotenv'); // Ładowanie zmiennych środowiskowych
const User = require('../models/User'); // Model użytkownika
const validator = require('validator'); // Biblioteka do walidacji danych
const jwt = require('jsonwebtoken'); // Biblioteka do tworzenia tokenów JWT
const rateLimit = require('express-rate-limit'); // Middleware do ograniczania liczby żądań
const fs = require('fs').promises; // Asynchroniczne operacje na systemie plików
const path = require('path'); // Moduł do obsługi ścieżek plików

dotenv.config();

// Funkcja do obsługi zabezpieczonej trasy
const verificationSecureToken = (req, res) => {
    res.json({ msg: 'Dostęp przyznany do chronionej trasy', user: req.user });
};

// Funkcja do rejestracji nowego użytkownika
const registration = async (req, res) => {
    const { username, email, password } = req.body;

    // Sprawdzenie siły hasła
    if (!validator.isStrongPassword(password, { minLength: 8, minSymbols: 1 })) {
        return res.status(400).json({ msg: 'Hasło musi mieć co najmniej 8 znaków i zawierać znak specjalny' });
    }

    try {
        // Sprawdzenie, czy użytkownik z danym e-mailem już istnieje
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Użytkownik o tym adresie e-mail już istnieje' });
        }

        // Sprawdzenie, czy nazwa użytkownika jest już zajęta
        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Nazwa użytkownika jest już zajęta' });
        }

        // Haszowanie hasła
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Tworzenie nowego użytkownika
        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Tworzenie katalogów dla użytkownika
        const userDir = path.join(__dirname, `../uploads/${user._id}`);
        const directoriesToCreate = ['uploaded', 'recorded'];

        for (const dir of directoriesToCreate) {
            const dirPath = path.join(userDir, dir);
            await fs.mkdir(dirPath, { recursive: true });
        }

        res.status(201).json({ msg: 'Zarejestrowano pomyślnie i utworzono katalogi' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
};

// Middleware ograniczający liczbę prób logowania
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 5, // Maksymalnie 5 prób logowania na 15 minut
    message: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut',
});

// Funkcja do logowania użytkownika
const login = async (req, res) => {
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

        // Tworzenie tokenu JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Błąd serwera');
    }
};

module.exports = {
    registration,
    login, 
    loginLimiter, 
};

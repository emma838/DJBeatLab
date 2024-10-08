const express = require('express');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const fs = require('fs').promises; // Zmieniamy na wersję asynchroniczną
const path = require('path');

dotenv.config(); // Wczytanie zmiennych środowiskowych

// Zabezpieczona trasa
const verificationSecureToken = (req, res) => {
    res.json({ msg: 'Dostęp przyznany do chronionej trasy', user: req.user });
};

// Rejestracja użytkownika
const registration = async (req, res) => {
    const { username, email, password } = req.body;

    if (!validator.isStrongPassword(password, { minLength: 8, minSymbols: 1 })) {
        return res.status(400).json({ msg: 'Hasło musi mieć co najmniej 8 znaków i zawierać znak specjalny' });
    }

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'Użytkownik o tym adresie e-mail już istnieje' });
        }

        user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ msg: 'Nazwa użytkownika jest już zajęta' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Tworzenie katalogów na podstawie userId
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

// Limiter do logowania
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 5, // Maksymalnie 5 prób logowania na 15 minut
    message: 'Zbyt wiele prób logowania, spróbuj ponownie za 15 minut',
});

// Logowanie użytkownika
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
            expiresIn: '1h',
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
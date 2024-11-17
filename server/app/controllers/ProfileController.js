const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User'); // Model użytkownika
const verifyToken = require('../middlewares/authMiddleware'); // Middleware do weryfikacji JWT
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Pobieranie danych zalogowanego użytkownika
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // req.user.userId pochodzi z middleware weryfikującego JWT
    if (!user) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }
    // Zwrócenie danych użytkownika (np. login, email)
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Aktualizacja nazwy użytkownika
const updateUsername = async (req, res) => {
  const { username: newUsername } = req.body;

  try {
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ msg: 'Nazwa użytkownika jest już zajęta' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    user.username = newUsername;
    await user.save();

    res.json({ msg: 'Nazwa użytkownika zaktualizowana', username: newUsername });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

const updatePassword = async (req, res) => {
  const { password } = req.body;

  if (!validator.isStrongPassword(password, { minLength: 8, minSymbols: 1 })) {
    return res.status(400).json({ msg: 'Hasło musi mieć co najmniej 8 znaków i zawierać znak specjalny' });
}

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};



module.exports ={
    getProfile,
    updateUsername,
    updatePassword
};
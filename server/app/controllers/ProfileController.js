const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('../models/User'); // Model użytkownika

// Pobieranie danych zalogowanego użytkownika
const getProfile = async (req, res) => {
  try {
    // Pobieranie użytkownika na podstawie ID z middleware weryfikującego JWT
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }
    // Zwracanie podstawowych danych użytkownika
    res.json({ username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Aktualizacja nazwy użytkownika
const updateUsername = async (req, res) => {
  const { username: newUsername } = req.body;

  try {
    // Sprawdzanie, czy nowa nazwa użytkownika jest już zajęta
    const existingUser = await User.findOne({ username: newUsername });
    if (existingUser) {
      return res.status(400).json({ msg: 'Nazwa użytkownika jest już zajęta' });
    }

    // Pobieranie danych bieżącego użytkownika
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    // Aktualizacja nazwy użytkownika
    user.username = newUsername;
    await user.save();

    res.json({ msg: 'Nazwa użytkownika zaktualizowana', username: newUsername });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Aktualizacja hasła użytkownika
const updatePassword = async (req, res) => {
  const { password } = req.body;

  // Walidacja siły nowego hasła
  if (!validator.isStrongPassword(password, { minLength: 8, minSymbols: 1 })) {
    return res.status(400).json({ msg: 'Hasło musi mieć co najmniej 8 znaków i zawierać znak specjalny' });
  }

  try {
    // Pobieranie danych bieżącego użytkownika
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    // Hashowanie nowego hasła
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ msg: 'Hasło zostało zmienione' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

module.exports = {
  getProfile,
  updateUsername,
  updatePassword
};

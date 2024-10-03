const express = require('express');
const multer = require('multer');
const User = require('../models/user'); // Model użytkownika
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
  const { username } = req.body;

  try {
    // Sprawdzenie, czy nowa nazwa użytkownika już istnieje
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'Nazwa użytkownika jest już zajęta' });
    }

    // Aktualizacja nazwy użytkownika
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { username },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
    }

    res.json({ msg: 'Nazwa użytkownika zaktualizowana', username: updatedUser.username });
  } catch (err) {
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};


module.exports ={
    getProfile,
    updateUsername
};
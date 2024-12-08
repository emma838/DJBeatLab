const path = require('path');
const fs = require('fs-extra');
const mm = require('music-metadata');
const Song = require('../models/Song');
const dotenv = require('dotenv');

dotenv.config();

// Funkcja do przesyłania pliku, wyciągania metadanych i zapisywania informacji o utworze
const uploadFile = async (req, res) => {
  console.log('Otrzymano plik:', req.file);

  if (!req.file) {
    return res.status(400).json({ msg: 'Nie znaleziono pliku' });
  }
  try {
    // Wyciąganie metadanych z przesłanego pliku
    const metadata = await mm.parseFile(req.file.path);
    const duration = metadata.format.duration;
    const title = metadata.common.title || req.file.originalname;
    const author = metadata.common.artist || 'Nieznany';

    let albumImage = null;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      // Konwertowanie obrazu albumu na Base64
      const picture = metadata.common.picture[0];
      albumImage = `data:${picture.format};base64,${picture.data.toString('base64')}`;
    } else {
      albumImage = process.env.DEFAULT_IMAGE; // Ustawienie domyślnego obrazu, jeśli brak w metadanych
    }

    // Tworzenie nowego dokumentu w bazie danych dla utworu
    const newSong = new Song({
      title: title,
      author: author,
      filename: Buffer.from(req.file.originalname, 'latin1')
        .toString('utf8')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, ''), // Normalizacja nazwy pliku
      path: Buffer.from(req.file.path, 'latin1')
        .toString('utf8')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, ''), // Normalizacja ścieżki pliku
      duration: duration,
      bpm: parseFloat(req.body.bpm),
      key: req.body.key,
      albumImage,
      user: req.user.userId,
    });

    // Zapisanie utworu w bazie danych
    await newSong.save();
    res.status(200).json({ msg: 'Plik i dane zostały zapisane', song: newSong });
  } catch (error) {
    console.error('Błąd podczas przetwarzania pliku lub zapisu w bazie danych:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Funkcja do pobierania listy plików użytkownika
const getFiles = async (req, res) => {
  try {
    const userId = req.user.userId; // Pobranie ID użytkownika z middleware autoryzacyjnego
    const songs = await Song.find({ user: userId }); // Pobranie wszystkich utworów użytkownika
    res.status(200).json({ files: songs });
  } catch (error) {
    console.error('Błąd serwera przy pobieraniu plików:', error);
    res.status(500).json({ msg: 'Błąd serwera przy pobieraniu plików' });
  }
};

// Funkcja do usuwania pliku na podstawie ID
const deleteFile = async (req, res) => {
  const { songId } = req.params; // Pobranie ID utworu z parametrów żądania
  console.log('Otrzymano songId:', songId);
  try {
    const song = await Song.findById(songId); // Wyszukanie utworu w bazie danych
    if (!song) {
      return res.status(404).json({ msg: 'Plik nie został znaleziony' });
    }

    const filePath = song.path; // Pobranie ścieżki pliku
    await fs.remove(filePath); // Usunięcie pliku z systemu plików
    await Song.findByIdAndDelete(songId); // Usunięcie dokumentu z bazy danych
    res.status(200).json({ msg: 'Plik został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania pliku:', error);
    res.status(500).json({ msg: 'Błąd serwera podczas usuwania pliku' });
  }
};

// Funkcja do strumieniowania pliku audio do klienta
const streamFile = (req, res) => {
  const { userId, filename } = req.params; // Pobranie ID użytkownika i nazwy pliku z parametrów
  const filePath = path.join(__dirname, '../uploads', userId, 'uploaded', filename); // Złożenie ścieżki do pliku
  console.log('Oczekiwana ścieżka pliku:', filePath);

  if (!fs.existsSync(filePath)) {
    console.error("Plik nie znaleziony:", filePath);
    return res.status(404).json({ msg: 'Plik nie znaleziony' });
  }

  res.sendFile(filePath); // Wysyłanie pliku do klienta
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile,
  streamFile
};

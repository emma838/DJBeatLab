const path = require('path');
const fs = require('fs-extra');
const mm = require ('music-metadata');
const Song = require('../models/Song'); // Importuj model Song
const dotenv = require('dotenv');

dotenv.config(); 

const uploadFile = async (req, res) => {
  console.log('Otrzymano plik:', req.file);

  if (!req.file) {
    return res.status(400).json({ msg: 'Nie znaleziono pliku' });
  }
  try {
    // Wyciągnij metadane z pliku
    const metadata = await mm.parseFile(req.file.path);
    // console.log('Metadane pliku:', metadata);
    const duration = metadata.format.duration;
    const title = metadata.common.title || req.file.originalname;
    const author = metadata.common.artist || 'Nieznany';



    let albumImage = null;
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      // Pobierz obraz albumu i przekonwertuj na Base64
      const picture = metadata.common.picture[0];
      albumImage = `data:${picture.format};base64,${picture.data.toString('base64')}`;
    } else {
      albumImage = process.env.DEFAULT_IMAGE;
          }

    const newSong = new Song({
      title: title,
      author: author,
      // filename: req.file.originalname,
      filename: Buffer.from(req.file.originalname, 'latin1').toString('utf8')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, ''),
      // path: req.file.path,
      path: Buffer.from(req.file.path, 'latin1').toString('utf8')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, ''),
      duration: duration,
      bpm: parseFloat(req.body.bpm),
      key: req.body.key,
      albumImage,
      user: req.user.userId,
    });

    await newSong.save();
    res.status(200).json({ msg: 'Plik i dane zostały zapisane', song: newSong });
  } catch (error) {
    console.error('Błąd podczas przetwarzania pliku lub zapisu w bazie danych:', error);
    res.status(500).json({ msg: 'Błąd serwera' });
  }
};

// Funkcja do pobierania plików użytkownika
const getFiles = async (req, res) => {
  try {
    const userId = req.user.userId; // Zakładamy, że userId pochodzi z middleware autoryzacyjnego
    const songs = await Song.find({ user: userId }); // Pobieramy utwory użytkownika
    res.status(200).json({ files: songs });
  } catch (error) {
    console.error('Błąd serwera przy pobieraniu plików:', error);
    res.status(500).json({ msg: 'Błąd serwera przy pobieraniu plików' });
  }
};

// Funkcja do usuwania pliku
const deleteFile = async (req, res) => {
  const { songId } = req.params;
  console.log('Otrzymano songId:', songId); // Dodaj logi
  try {
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ msg: 'Plik nie został znaleziony' });
    }

    const filePath = song.path;
    await fs.remove(filePath);
    await Song.findByIdAndDelete(songId);
    res.status(200).json({ msg: 'Plik został usunięty' });
  } catch (error) {
    console.error('Błąd podczas usuwania pliku:', error);
    res.status(500).json({ msg: 'Błąd serwera podczas usuwania pliku' });
  }
};

// Funkcja do strumieniowania pliku audio
const streamFile = (req, res) => {
  const { userId, filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', userId, 'uploaded',filename);
  console.log('Oczekiwana ścieżka pliku:', filePath); // Logowanie ścieżki do pliku

  if (!fs.existsSync(filePath)) {
    console.error("Plik nie znaleziony:", filePath);
    return res.status(404).json({ msg: 'Plik nie znaleziony' });
  }

  res.sendFile(filePath);
};





module.exports = {
  uploadFile,
  getFiles,
  deleteFile,
  streamFile
};
 
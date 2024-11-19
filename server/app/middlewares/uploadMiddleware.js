// uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Funkcja walidująca typ pliku
const fileFilter = (req, file, cb) => {
  console.log('Sprawdzanie typu pliku:', file.mimetype);
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3']; // Akceptowane formaty plików
  if (!allowedTypes.includes(file.mimetype)) {
    const error = new Error('Nieprawidłowy format pliku. Dozwolone są tylko pliki MP3 i WAV.');
    error.code = 'LIMIT_FILE_TYPES';
    return cb(error, false);
  }
  cb(null, true);
};

// Konfiguracja Multer do przechowywania plików
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userDir = path.join(__dirname, `../uploads/${req.user.userId}/uploaded`); // Katalog użytkownika
    console.log('Zapisywanie pliku w katalogu:', userDir);
    fs.ensureDirSync(userDir); // Upewnij się, że katalog istnieje
    cb(null, userDir); // Ustaw katalog docelowy
  },
  filename: (req, file, cb) => {
    // console.log('Nazwa pliku:', file.originalname);
    // cb(null, file.originalname); // Zapisz plik pod oryginalną nazwą

    console.log('Oryginalna nazwa pliku:', file.originalname);

  // Obsługa polskich znaków
  const normalizedFileName = Buffer.from(file.originalname, 'latin1')
    .toString('utf8')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // Usuwa akcenty
    // .replace(/[^a-zA-Z0-9.-]/g, '_'); // Zamienia niedozwolone znaki na "_"

  console.log('Znormalizowana nazwa pliku:', normalizedFileName);

  cb(null, normalizedFileName);
  },
});

// Konfiguracja Multer
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // Limit rozmiaru pliku: 100 MB
  },
  fileFilter,
});

module.exports = upload;

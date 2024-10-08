const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Definiowanie ograniczeń plików
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = `uploads/${req.user.userId}/uploaded`; // Katalog użytkownika
        fs.ensureDirSync(userDir); // Upewnij się, że katalog istnieje
        cb(null, userDir); // Zapisz plik w katalogu użytkownika
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Zapisz plik pod oryginalną nazwą
    },
});

// Filtr do weryfikacji typu pliku
const fileFilter = (req, file, cb) => {
    const filetypes = /mp3|wav/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Nieprawidłowy format pliku. Dozwolone są tylko pliki MP3 i WAV.'));
    }
};
const uploadFile = (req, res) => {
    console.log('Otrzymano plik:', req.file);

    if (!req.file) {
        return res.status(400).json({ msg: 'Nie znaleziono pliku' });
    }

    res.status(200).json({ msg: 'Plik wgrany pomyślnie', file: req.file.filename });
};

//pobieranie plików 
const getFiles=  (req, res) => {
    const userDir = path.join(__dirname, `../uploads/${req.user.userId}/uploaded`);
    
    fs.readdir(userDir, (err, files) => {
      if (err) {
        return res.status(500).json({ msg: 'Błąd przy pobieraniu plików' });
      }
      res.json({ files });
    });
  };

module.exports = {
    uploadFile,
    getFiles
};

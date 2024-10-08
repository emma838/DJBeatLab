/**
 * Middleware do wgrywania plików
 * 
 * Ten middleware obsługuje wgrywanie plików użytkowników za pomocą Multer.
 * Jest wykorzystywany do obsługi żądań HTTP POST, które przesyłają pliki,
 * np. pliki muzyczne w formatach mp3 lub wav. Middleware sprawdza poprawność 
 * typu pliku, określa miejsce, gdzie pliki mają zostać zapisane, oraz ogranicza 
 * maksymalny rozmiar wgrywanych plików do 100 MB.
 * 
 * Działanie:
 * 1. Sprawdza typ wgrywanego pliku (akceptowane: `audio/mpeg`, `audio/wav`).
 * 2. Określa miejsce zapisu pliku w katalogu użytkownika (`uploads/{username}/uploaded`).
 * 3. Obsługuje limit rozmiaru pliku (100 MB).
 * 
 * Przykład użycia:
 * - Middleware ten jest używany do tras, które umożliwiają użytkownikowi wgranie pliku.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Funkcja walidująca typ pliku
const fileFilter = (req, file, cb) => {
    console.log('Sprawdzanie typu pliku:', file.mimetype);
    const allowedTypes = ['audio/mpeg', 'audio/wav']; // Akceptowane formaty plików
    if (!allowedTypes.includes(file.mimetype)) {
        const error = new Error('Zły format pliku');
        error.code = 'LIMIT_FILE_TYPES';
        return cb(error, false);
    }
    cb(null, true);
};

// Konfiguracja Multer do przechowywania plików
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = path.join(__dirname, `../uploads/${req.user.userId}/uploaded`); // Ścieżka do katalogu użytkownika
        console.log('Zapisywanie pliku w katalogu:', userDir);
        fs.ensureDirSync(userDir); // Sprawdzenie, czy katalog istnieje, a jeśli nie, tworzenie go
        cb(null, userDir); // Ustawienie katalogu docelowego
    },
    filename: (req, file, cb) => {
        console.log('Nazwa pliku:', file.originalname); // Wyświetlenie nazwy pliku
        cb(null, file.originalname); // Zapisanie pliku pod oryginalną nazwą
    }
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

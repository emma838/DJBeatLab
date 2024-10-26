// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const api = require('./app/routes/api');  // Trasy dla autoryzacji
const cookieParser = require('cookie-parser');  // Jeśli używasz tokenów CSRF
const cors = require('cors');


dotenv.config(); // Wczytanie zmiennych środowiskowych z .env

const app = express();
const PORT = process.env.PORT || 5000;

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Połączono z MongoDB');
})
.catch((err) => {
    console.error('Błąd połączenia z MongoDB:', err);
});

// // Konfiguracja Express do ufania proxy
// app.set('trust proxy', 1); // 1 oznacza, że ufamy pierwszemu proxy (np. Heroku, Nginx)

// Middleware do parsowania JSON i ciasteczek
app.use(express.json());
app.use(cookieParser());

// Middleware CORS - pozwala na żądania z innego portu (np. frontend React na localhost:3000)
app.use(cors({
    //origin: 'http://localhost:3000', // Zezwala na żądania tylko z tego adresu
    //methods: 'GET,POST',             // Ograniczenie do metod GET i POST
    //allowedHeaders: 'Content-Type,Authorization' // Zezwalanie na konkretne nagłówki
  }));

// Trasy autoryzacyjne
app.use('/api/', api);

// Udostępnianie plików w katalogu uploads
app.use('/uploads', express.static('uploads'));

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});


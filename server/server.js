// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');  // Trasy dla autoryzacji
const cookieParser = require('cookie-parser');  // Jeśli używasz tokenów CSRF

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

// Middleware do parsowania JSON i ciasteczek
app.use(express.json());
app.use(cookieParser());

// Trasy autoryzacyjne
app.use('/api/auth', authRoutes);

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

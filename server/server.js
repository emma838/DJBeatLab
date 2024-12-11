const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const api = require('./app/routes/api');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Ustawienie trust proxy
app.set('trust proxy', 1); // Ufa pierwszemu proxy w łańcuchu

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

app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});

const corsOptions = {
    origin: 'http://localhost:3000', // Zezwól na żądania tylko z tej domeny
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Metody HTTP dozwolone
    credentials: true, // Pozwala na wysyłanie ciasteczek/autoryzacji
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use('/api/', api);

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

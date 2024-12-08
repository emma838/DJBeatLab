const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const api = require('./app/routes/api');
const cookieParser = require('cookie-parser');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(express.json());
app.use(cookieParser());

app.use('/api/', api);

app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

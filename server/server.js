const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Serwer działa!');
});

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});

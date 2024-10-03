const jwt = require('jsonwebtoken');
// Middleware do weryfikacji JWT
function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Pobierz token z nagłówka

    if (!token) {
        return res.status(401).json({ msg: 'Brak tokenu, autoryzacja zabroniona' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET); // Weryfikacja tokenu
        req.user = verified; // Przekazanie danych użytkownika do dalszej obsługi
        next(); // Przejdź do następnego middleware lub funkcji trasy
    } catch (err) {
        res.status(401).json({ msg: 'Token jest nieprawidłowy' });
    }
}

module.exports = verifyToken;
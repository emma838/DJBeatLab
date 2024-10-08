const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import modelu użytkownika

// Middleware do weryfikacji JWT
async function verifyToken(req, res, next) {
    const token = req.header('Authorization')?.split(' ')[1]; // Pobierz token z nagłówka

    if (!token) {
        return res.status(401).json({ msg: 'Brak tokenu, autoryzacja zabroniona' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Weryfikacja tokenu
        const user = await User.findById(decoded.userId); // Pobierz użytkownika z bazy na podstawie userId

        if (!user) {
            return res.status(404).json({ msg: 'Użytkownik nie znaleziony' });
        }

        req.user = { userId: user._id, username: user.username }; // Przypisujemy pełne dane użytkownika do req.user
        console.log('Zweryfikowany użytkownik:', req.user); // Logowanie użytkownika
        next(); // Przejdź do następnego middleware lub funkcji trasy
    } catch (err) {
        res.status(401).json({ msg: 'Token jest nieprawidłowy' });
    }
}

module.exports = verifyToken;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import hooka do nawigacji

const Login = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();  // Hook do nawigacji

  // Funkcja obsługująca logowanie użytkownika
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Wysłanie żądania POST do backendu
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrUsername,
          password,
        }),
      });

      const data = await response.json();

      // Jeśli logowanie się powiedzie
      if (response.ok) {
        // Zapisz token JWT w localStorage
        localStorage.setItem('token', data.token);
        setMessage('Logowanie zakończone sukcesem!');
        
        // Przekierowanie na stronę chronioną (np. "/secure")
        navigate('/secure');  // Przekierowanie do chronionej strony
      } else {
        // W przypadku niepoprawnych danych logowania
        setMessage(data.msg || 'Nieprawidłowe dane logowania');
      }
    } catch (error) {
      // W przypadku błędu serwera
      setMessage('Błąd serwera: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email lub Nazwa użytkownika:</label>
          <input
            type="text"
            value={emailOrUsername}
            onChange={(e) => setEmailOrUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Hasło:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Zaloguj się</button>
      </form>
      {/* Komunikat o błędzie lub sukcesie */}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;

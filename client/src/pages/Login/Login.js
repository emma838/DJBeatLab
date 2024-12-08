import React, { useState } from 'react';
import styles from './Login.module.scss'; // Import stylów specyficznych dla strony logowania
import logoImage from '../../assets/djbl_logo1.png'; // Import obrazu logo aplikacji
import { useNavigate } from 'react-router-dom'; // Hook do obsługi nawigacji w aplikacji

const Login = () => {
  // Stany komponentu
  const [emailOrUsername, setEmailOrUsername] = useState(''); // Pole dla e-maila lub nazwy użytkownika
  const [password, setPassword] = useState(''); // Pole dla hasła
  const [message, setMessage] = useState(''); // Komunikat o błędzie lub sukcesie
  const navigate = useNavigate(); // Hook do nawigacji między stronami

  // Funkcja obsługująca logowanie użytkownika
  const handleLogin = async (e) => {
    e.preventDefault(); // Zapobiega odświeżeniu strony po wysłaniu formularza

    try {
      // Wysłanie żądania POST do API logowania
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }), // Przekazanie danych logowania
      });

      const data = await response.json();

      if (response.ok) {
        // Jeśli logowanie się powiedzie, zapisanie tokenu JWT w localStorage
        localStorage.setItem('token', data.token);
        setMessage('Logowanie zakończone sukcesem!');
        // Przekierowanie na chronioną stronę aplikacji
        navigate('/workspace');
      } else {
        // Obsługa błędnych danych logowania
        setMessage(data.msg || 'Nieprawidłowe dane logowania');
      }
    } catch (err) {
      // Obsługa błędów po stronie serwera
      setMessage('Błąd serwera: ' + err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Wyświetlanie logo aplikacji */}
      <img src={logoImage} alt="DJBeatLab Logo" className={styles.logo} />

      {/* Główny kontener strony logowania */}
      <div className={styles.container}>
        <h2 className={styles.title}>Sign In</h2>
        
        {/* Formularz logowania */}
        <form className={styles.form} onSubmit={handleLogin}>
          {/* Pole dla emaila lub nazwy użytkownika */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email or Username:</label>
            <input
              className={styles.input}
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)} // Aktualizacja stanu
              required
            />
          </div>
          
          {/* Pole dla hasła */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password:</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Aktualizacja stanu
              required
            />
          </div>
          
          {/* Sekcja komunikatów i przycisków */}
          <div className={styles.buttonContainer}>
            <div className={styles.submitContainer}>
              {/* Komunikaty o błędach lub sukcesie */}
              <div className={styles.errorMessage}>
                <p className={styles.message}>
                  {message || '\u00A0'} {/* Wyświetlanie komunikatu lub pustego miejsca */}
                </p>
              </div>
              {/* Przycisk wysyłający formularz */}
              <button type="submit" className={styles.button}>Sign In</button>
            </div>

            {/* Link do rejestracji, jeśli użytkownik nie ma konta */}
            <div className={styles.registerContainer}>
              <div className={styles.registerText}>
                <p>
                  No account yet?{' '}
                  <a href="/register" className={styles.registerLink}>
                    <br />
                    Sign Up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

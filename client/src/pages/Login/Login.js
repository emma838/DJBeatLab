import React, { useState } from 'react';
import styles from './Login.module.css'; // Zmodyfikowana ścieżka do pliku stylów
import logoImage from '../../assets/djbl_logo1.png'; // Upewnij się, że masz obraz logo w odpowiednim folderze
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await response.json();

      // Jeśli logowanie się powiedzie
      if (response.ok) {
        // Zapisz token JWT w localStorage
        localStorage.setItem('token', data.token);
        setMessage('Logowanie zakończone sukcesem!');
        
        // Przekierowanie na stronę chronioną (np. "/secure")
        navigate('/workspace');  // Przekierowanie do chronionej strony
      } else {
        // W przypadku niepoprawnych danych logowania
        setMessage(data.msg || 'Nieprawidłowe dane logowania');
      }
    } catch (err) {
      // W przypadku błędu serwera
      setMessage('Błąd serwera: ' + err.message);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Obraz logo, który będzie nad kontenerem */}
      <img src={logoImage} alt="DJBeatLab Logo" className={styles.logo} />

      <div className={styles.container}>
        <h2 className={styles.title}>Logowanie</h2>
        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email lub Nazwa użytkownika:</label>
            <input
              className={styles.input}
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles.inputGroup}> 
            <label className={styles.label}>Hasło:</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Sekcja komunikatów i przycisków */}
          <div className={styles.buttonContainer}>
            <div className={styles.submitContainer}>
              <div className={styles.errorMessage}>
                <p className={styles.message}>
                  {message || '\u00A0'}
                </p>
              </div>
              <button type="submit" className={styles.button}>Zaloguj się</button>
            </div>
            <div className={styles.registerContainer}>
              <div className={styles.registerText}>
                <p>
                  Nie masz konta?{' '}
                  <a href="/register" className={styles.registerLink}>Zarejestruj się</a>
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

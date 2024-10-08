import React, { useState } from 'react';
import styles from './Register.module.scss'; // Zmodyfikowana ścieżka do pliku stylów
//import logoImage from '../../../assets/djbl_logo1.png'; // Upewnij się, że masz obraz logo w odpowiednim folderze

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    // Sprawdzenie, czy hasła się zgadzają
    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne!');
      setMessage(''); // Wyczyszczenie komunikatu
      return;
    }

    // Wysyłanie danych na backend
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Rejestracja zakończona pomyślnie!');
        setError(''); // Wyczyszczenie błędu
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError(data.msg || 'Wystąpił błąd rejestracji');
        setMessage(''); // Wyczyszczenie komunikatu
      }
    } catch (err) {
      setError('Błąd serwera: ' + err.message);
      setMessage(''); // Wyczyszczenie komunikatu
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Obraz logo, który będzie nad kontenerem */}
     {/* <img src={logoImage} alt="DJBeatLab Logo" className={styles.logo} /> */}

      <div className={styles.container}>
        <h2 className={styles.title}>Rejestracja</h2>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nazwa użytkownika:</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email:</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Powtórz hasło:</label>
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Sekcja komunikatów i przycisków */}
          <div className={styles.buttonContainer}>
            <div className={styles.errorMessage}>
              <p className={error ? styles.error : styles.message}>
                {error || message || '\u00A0'}
              </p>
            </div>
            <div className={styles.submitContainer}>
              <button type="submit" className={styles.button}>Utwórz konto</button>
              <div className={styles.loginContainer}>
                <div className={styles.loginText}>
                  <p>Masz konto? <a href="/login" className={styles.loginLink}>Zaloguj się</a></p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

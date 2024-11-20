import React, { useState } from 'react';
import styles from './Register.module.scss'; // Zmodyfikowana ścieżka do pliku stylów
import { useNavigate } from 'react-router-dom';  // Import hooka do nawigacji
import logoImage from '../../assets/djbl_logo1.png';  // Upewnij się, że masz obraz logo w odpowiednim folderze

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage]   = useState('');
  const [error, setError]       = useState('');
  const navigate = useNavigate(); 

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
        setMessage('Rejestracja zakończona pomyślnie. Za chwilę zostaniesz przekierowany na stronę logowania.');
        setError(''); // Wyczyszczenie błędu
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Przekierowanie po 3 sekundach
        setTimeout(() => {
          navigate('/login');
        }, 3000);
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
     <img src={logoImage} alt="DJBeatLab Logo" className={styles.logo} />

      <div className={styles.container}>
        <h2 className={styles.title}>Sign Up</h2>
        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username:</label>
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
            <label className={styles.label}>Password:</label>
            <input
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm password:</label>
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
              <button type="submit" className={styles.button}>Create account</button>
              <div className={styles.loginContainer}>
                <div className={styles.loginText}>
                  <p>Got an account? <br /><a href="/login" className={styles.loginLink}>Sign In</a></p>
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

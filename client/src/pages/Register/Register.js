import React, { useState } from 'react';
import styles from './Register.module.scss'; // Import stylów specyficznych dla strony rejestracji
import { useNavigate } from 'react-router-dom'; // Hook do nawigacji
import logoImage from '../../assets/djbl_logo1.png'; // Import obrazu logo aplikacji

const Register = () => {
  // Stany komponentu
  const [username, setUsername] = useState(''); // Pole dla nazwy użytkownika
  const [email, setEmail] = useState(''); // Pole dla adresu email
  const [password, setPassword] = useState(''); // Pole dla hasła
  const [confirmPassword, setConfirmPassword] = useState(''); // Pole do potwierdzenia hasła
  const [message, setMessage] = useState(''); // Komunikat o sukcesie rejestracji
  const [error, setError] = useState(''); // Komunikat o błędach
  const navigate = useNavigate(); // Hook do nawigacji między stronami

  // Funkcja obsługująca rejestrację użytkownika
  const handleRegister = async (e) => {
    e.preventDefault(); // Zapobiega przeładowaniu strony

    // Sprawdzenie zgodności haseł
    if (password !== confirmPassword) {
      setError('Hasła nie są zgodne!'); // Wyświetla błąd, jeśli hasła się różnią
      setMessage(''); // Resetuje komunikat sukcesu
      return;
    }

    try {
      // Wysłanie danych rejestracyjnych na backend
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }), // Przekazanie danych w formacie JSON
      });

      const data = await response.json();

      if (response.ok) {
        // Jeśli rejestracja się powiedzie
        setMessage('Rejestracja zakończona pomyślnie. Za chwilę zostaniesz przekierowany na stronę logowania.');
        setError(''); // Resetuje błędy
        // Resetowanie pól formularza
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        // Przekierowanie na stronę logowania po 3 sekundach
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        // Wyświetlanie błędów z backendu
        setError(data.msg || 'Wystąpił błąd rejestracji');
        setMessage(''); // Resetuje komunikat sukcesu
      }
    } catch (err) {
      // Obsługa błędów serwera
      setError('Błąd serwera: ' + err.message);
      setMessage(''); // Resetuje komunikat sukcesu
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Wyświetlanie logo aplikacji */}
      <img src={logoImage} alt="DJBeatLab Logo" className={styles.logo} />

      {/* Główny kontener strony rejestracji */}
      <div className={styles.container}>
        <h2 className={styles.title}>Sign Up</h2>
        
        {/* Formularz rejestracji */}
        <form className={styles.form} onSubmit={handleRegister}>
          {/* Pole dla nazwy użytkownika */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Username:</label>
            <input
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)} // Aktualizacja stanu nazwy użytkownika
              required
            />
          </div>

          {/* Pole dla adresu email */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email:</label>
            <input
              className={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Aktualizacja stanu adresu email
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
              onChange={(e) => setPassword(e.target.value)} // Aktualizacja stanu hasła
              required
            />
          </div>

          {/* Pole do potwierdzenia hasła */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm password:</label>
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // Aktualizacja stanu potwierdzenia hasła
              required
            />
          </div>

          {/* Sekcja komunikatów i przycisków */}
          <div className={styles.buttonContainer}>
            {/* Wyświetlanie komunikatu błędu lub sukcesu */}
            <div className={styles.errorMessage}>
              <p className={error ? styles.error : styles.message}>
                {error || message || '\u00A0'} {/* Jeśli brak komunikatu, wyświetlane jest puste miejsce */}
              </p>
            </div>

            {/* Przycisk do wysyłania formularza */}
            <div className={styles.submitContainer}>
              <button type="submit" className={styles.button}>Create account</button>
              {/* Link do logowania, jeśli użytkownik ma już konto */}
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

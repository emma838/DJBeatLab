import React, { useState } from 'react';
import axios from 'axios'; // Importowanie Axios
import styles from './SettingsModal.module.scss'; // Stylizacja dla modala

const SettingsModal = ({ isOpen, onClose, username, onUsernameChange }) => {
  const [newUsername, setNewUsername] = useState(username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(''); // Komunikaty o błędach lub sukcesach

  // Funkcja obsługująca zmianę loginu
  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  // Funkcja zapisująca zmiany loginu
  const saveSettings = async () => {
    if (newUsername === username) {
      setMessage('Nie wprowadzono zmian w loginie.');
      return;
    }

    const usernamePattern = /^[a-zA-Z0-9_-]{5,15}$/; // Wyrażenie regularne dla walidacji
    if (!usernamePattern.test(newUsername)) {
      setMessage('Login musi mieć od 5 do 15 znaków i może zawierać tylko litery, cyfry, _ lub -.');
      return;
    }

    try {
      const response = await axios.post(
        '/profile/update-username',
        { username: newUsername },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        onUsernameChange(newUsername);
        setMessage('Nazwa użytkownika została zaktualizowana.');
      } else {
        setMessage(response.data.msg || 'Błąd podczas aktualizacji loginu.');
      }
    } catch (error) {
      setMessage('Błąd serwera: ' + error.message);
    }
  };

  // Funkcja zapisująca zmiany hasła
  const savePassword = async () => {
    if (!newPassword && !confirmPassword) {
      setMessage('Nie wprowadzono nowego hasła.');
      return;
    }

    if (!validatePasswords()) return;

    try {
      const response = await axios.post(
        '/api/profile/update-password',
        { password: newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage('Hasło zostało zmienione.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage(response.data.msg || 'Błąd podczas zmiany hasła.');
      }
    } catch (error) {
      setMessage('Błąd serwera: ' + error.message);
    }
  };

  // Walidacja haseł
  const validatePasswords = () => {
    const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
    const uppercasePattern = /[A-Z]/; // Sprawdza wielką literę
    const digitPattern = /[0-9]/; // Sprawdza cyfrę
  
    if (newPassword !== confirmPassword) {
      setMessage('Hasła nie są zgodne.');
      return false;
    }
    if (newPassword.length < 8) {
      setMessage('Hasło musi mieć co najmniej 8 znaków.');
      return false;
    }
    if (!specialCharPattern.test(newPassword)) {
      setMessage('Hasło musi zawierać co najmniej jeden znak specjalny.');
      return false;
    }
    if (!uppercasePattern.test(newPassword)) {
      setMessage('Hasło musi zawierać co najmniej jedną wielką literę.');
      return false;
    }
    if (!digitPattern.test(newPassword)) {
      setMessage('Hasło musi zawierać co najmniej jedną cyfrę.');
      return false;
    }
    return true;
  };

  // Funkcja obsługująca zapis zmian
  const handleSave = async () => {
    if (newUsername !== username) {
      await saveSettings();
    }
    if (newPassword || confirmPassword) {
      await savePassword();
    }
  };

  return (
    isOpen && (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Ustawienia</h2>

          {/* Login */}
          <div className={styles.settingItem}>
            <label>Login:</label>
            <input
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
              placeholder="podaj nowy login"
            />
          </div>

          {/* Hasło */}
          <div className={styles.settingItem}>
            <label>Nowe hasło:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="podaj nowe hasło"
            />
          </div>
          <div className={styles.settingItem}>
            <label>Powtórz hasło:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="powtórz nowe hasło"
            />
          </div>

          {/* Komunikaty */}
          <div className={styles.message}>{message}</div>

          {/* Przyciski */}
          <div className={styles.buttons}>
          <button
  onClick={handleSave}
  disabled={
    (newUsername === username || !newUsername) &&
    !newPassword &&
    !confirmPassword
  }
  className={`${styles.button} ${styles.saveButton}`}
>
  Zapisz
</button>
          <button onClick={onClose} className={`${styles.button} ${styles.cancelButton}`}>
            Anuluj
          </button>
          </div>
        </div>
      </div>
    )
  );
};

export default SettingsModal;

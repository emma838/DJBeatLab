import React, { useState } from 'react';
import styles from './SettingsModal.module.scss'; // Stylizacja dla modala

const SettingsModal = ({ isOpen, onClose, username, onUsernameChange }) => {
  const [newUsername, setNewUsername] = useState(username);
  const [message, setMessage] = useState(''); // Komunikaty o błędach lub sukcesach

    // Funkcja obsługująca zmianę loginu
  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

    // Funkcja wysyłająca dane do backendu
    const saveSettings = async () => {
      // Sprawdzamy, czy nazwa użytkownika jest zgodna z wymaganiami
      const usernamePattern = /^[a-zA-Z0-9_-]{5,15}$/; // Wyrażenie regularne dla walidacji
    
      if (!usernamePattern.test(newUsername)) {
        setMessage('Login musi mieć od 5 do 15 znaków i może zawierać tylko litery, cyfry, _ lub -.');
        return;
      }
    
      try {
        const response = await fetch('/api/auth/profile/update-username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ username: newUsername }),
        });
    
        const data = await response.json();
    
        if (response.ok) {
          onUsernameChange(newUsername); // Aktualizuj nazwę użytkownika w UI
          setMessage('Nazwa użytkownika zaktualizowana.');
          onClose(); // Zamknij modal
        } else {
          setMessage(data.msg || 'Błąd podczas aktualizacji nazwy użytkownika.');
        }
      } catch (error) {
        setMessage('Błąd serwera: ' + error.message);
      }
    };
    

  return (
    isOpen && (
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <h2>Ustawienia użytkownika</h2>
          <div className={styles.settingItem}>
            <label>Zmiana nazwy użytkownika:</label>
            <input
              type="text"
              value={newUsername}
              onChange={handleUsernameChange}
            />
          </div>
          {message && <p>{message}</p>} {/* Wyświetlanie komunikatów */}
          <div className={styles.buttons}>
            <button onClick={saveSettings}>Zapisz ustawienia</button>
            <button onClick={onClose}>Anuluj</button>
          </div>
        </div>
      </div>
    )
  );
};

export default SettingsModal;

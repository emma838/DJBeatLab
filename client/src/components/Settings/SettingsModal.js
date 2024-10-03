import React, { useState } from 'react';
import styles from './SettingsModal.module.css'; // Stylizacja dla modala

const SettingsModal = ({ isOpen, onClose, username, onUsernameChange }) => {
  const [newUsername, setNewUsername] = useState(username);

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const saveSettings = async () => {
    try {
      const response = await fetch('/api/profile/change-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await response.json();

      if (response.ok) {
        onUsernameChange(newUsername); // Zaktualizuj nazwę użytkownika
        onClose(); // Zamknij okno po zapisaniu
      } else {
        alert(data.msg || 'Błąd podczas zmiany loginu');
      }
    } catch (error) {
      alert('Błąd serwera: ' + error.message);
    }
  };

  if (!isOpen) return null; // Nie renderuj modala, jeśli isOpen jest false

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>Ustawienia użytkownika</h2>
        <div className={styles.settingItem}>
          <label>Zmiana nazwy użytkownika:</label>
          <input
            type="text"
            value={newUsername}
            onChange={handleUsernameChange}
          />
        </div>
        <button onClick={saveSettings}>Zapisz ustawienia</button>
        <button onClick={onClose}>Anuluj</button>
      </div>
    </div>
  );
};

export default SettingsModal;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../../../assets/djbl_logo1.png';
import userIcon from '../../../assets/userIcon.png'; // Import statycznego obrazka
import styles from './HeaderWorkspace.module.scss';
import SettingsModal from '../../Settings/SettingsModal'; // Import modala ustawień

const Header = ({ username: initialUsername, onUsernameChange }) => {
  const [localUsername, setLocalUsername] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Pobieranie loginu użytkownika
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 200) {
          setLocalUsername(response.data.username);
        }
      } catch (err) {
        console.error('Błąd serwera: ', err);
      }
    };

    fetchProfile();
  }, []);

  // Włączenie modala z ustawieniami
  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  // Wylogowanie
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLogo}>
          <img src={logoImage} alt="Logo" />
        </div>
        {/* Sekcja informacji o użytkowniku */}
        <div className={styles.userInfo}>
          <span className={styles.username}>DJ {localUsername}</span>
          <img src={userIcon} alt="User Icon" className={styles.avatar} />
          <div className={styles.dropdownMenu}>
            <ul>
              <li onClick={toggleSettings}>Settings</li>
              <li onClick={handleLogout} className={styles.logout}>
                Sign Out
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modal ustawień */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        username={localUsername}
        onUsernameChange={setLocalUsername}
      />
    </header>
  );
};

export default Header;

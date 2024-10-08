// HeaderWorkspace.js - Komponent nagłówka przestrzeni roboczej
// Opis: Komponent `HeaderWorkspace` odpowiada za wyświetlanie nagłówka aplikacji, w tym logo, informacji o użytkowniku oraz opcji wylogowania.
// Komponent zawiera także modal ustawień, w którym użytkownik może zmienić swoje dane.

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logoImage from '../../../assets/djbl_logo1.png';
import userIcon from '../../../assets/userIcon.png'; // Import statycznego obrazka
import styles from './HeaderWorkspace.module.scss';
import SettingsModal from '../../Settings/SettingsModal'; // Import nowego komponentu

const Header = ({ username: initialUsername, onUsernameChange }) => {
  const [localUsername, setLocalUsername] = useState(''); // Stan dla loginu użytkownika
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Pobieranie loginu użytkownika z backendu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.status === 200) {
          setLocalUsername(response.data.username); // Ustaw login użytkownika
        } else {
          console.log(response.data.msg || 'Błąd pobierania danych użytkownika');
        }
      } catch (err) {
        console.log('Błąd serwera: ', err);
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
    localStorage.removeItem('token'); // Usuń token
    window.location.href = '/login'; // Przekieruj na stronę logowania
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLogo}>
          <img src={logoImage} alt="Logo" />
        </div>
        <div className={styles.userInfo}>
          <span className={styles.username}>{localUsername}</span>
          <img src={userIcon} alt="User Icon" className={styles.avatar} />
          <div className={styles.dropdownMenu}>
            <ul>
              <li onClick={toggleSettings}>Ustawienia</li>
              <li onClick={handleLogout} className={styles.logout}>Wyloguj</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Użycie komponentu SettingsModal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={toggleSettings}
        username={localUsername} // Przekazujemy lokalny stan
        onUsernameChange={setLocalUsername} // Zmieniamy login
      />
    </header>
  );
};

export default Header;

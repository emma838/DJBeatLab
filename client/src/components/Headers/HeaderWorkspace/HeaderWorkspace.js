import React, { useState, useEffect } from 'react';
import logoImage from '../../../assets/djbl_logo1.png';
import userIcon from '../../../assets/userIcon.png'; // Import statycznego obrazka
import styles from './HeaderWorkspace.module.scss'; 
import SettingsModal from '../../Settings/SettingsModal'; // Import nowego komponentu

const Header = ({ username: initialUsername, onUsernameChange }) => { // Zmieniona nazwa "username" z props na "initialUsername"
  const [localUsername, setLocalUsername] = useState(''); // Stan dla loginu użytkownika
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Pobieranie loginu użytkownika z backendu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setLocalUsername(data.username); // Ustaw login użytkownika
        } else {
          console.log(data.msg || 'Błąd pobierania danych użytkownika');
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
    window.location.href = '/login';  // Przekieruj na stronę logowania
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

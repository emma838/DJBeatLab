import React, { useState } from 'react';
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace.js';
import FileManager from '../../components/FileManager/FileManager'; 
import PlaylistManager from '../../components/PlaylistManager/PlaylistManager';
import styles from './Workspace.module.scss'; 

const Workspace = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState('uploads'); // Stan wybranej playlisty
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(false);

// Funkcja do aktualizacji stanu po dodaniu nowego utworu
const handleSongAdded = () => {
  setPlaylistUpdateTrigger((prev) => !prev); // Zmienia wartość, co spowoduje odświeżenie listy utworów
};

  return (
    <div className={styles.workspace}>
      <Header />

      {/* Sekcja pomiędzy nagłówkiem a narzędziami */}
      <section className={styles.intermediateSection}>
        <h2>Sekcja pomiędzy nagłówkiem a narzędziami</h2>
      </section>

      {/* Pasek na narzędzia */}
      <section className={styles.toolbar}>
        <div className={styles.leftSection}>Lewa sekcja (35%)</div>
        <div className={styles.middleSection}>Środkowa sekcja (30%)</div>
        <div className={styles.rightSection}>Prawa sekcja (35%)</div>
      </section>

      {/* Sekcja na podgląd plików */}
      <section className={styles.filePreview}>
        <div className={styles.fileManager}>
          {/* Przekazujemy wybraną playlistę oraz funkcję do odświeżania */}
          <FileManager selectedPlaylist={selectedPlaylist} onSongAdded={handleSongAdded} />
        </div>
        <div className={styles.playlistManager}>
          {/* Przekazujemy stan i funkcję do zmiany playlisty */}
          <PlaylistManager 
            selectedPlaylist={selectedPlaylist} 
            setSelectedPlaylist={setSelectedPlaylist} 
            playlistUpdateTrigger={playlistUpdateTrigger}
          />
        </div>
      </section>
    </div>
  );
};

export default Workspace;

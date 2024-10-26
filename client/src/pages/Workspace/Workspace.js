import React, { useState } from 'react';
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace.js';
import FileManager from '../../components/FileManager/FileManager'; 
import PlaylistManager from '../../components/PlaylistManager/PlaylistManager';
import Deck from '../../components/Deck/Deck';
import AudioManager from '../../components/AudioManager/AudioManager'; // Zakładamy, że AudioManager jest w utils
import styles from './Workspace.module.scss'; 

const Workspace = () => {
  const audioManager = AudioManager(); // Tworzenie instancji AudioManagera
  const [selectedPlaylist, setSelectedPlaylist] = useState('uploads');
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(false);
  const [deck1Song, setDeck1Song] = useState(null);
  const [deck2Song, setDeck2Song] = useState(null);

  // Funkcja do przypisywania utworu do wybranego decka
  const handleAssignToDeck = (deckNumber, song) => {
    const trackUrl = song.url; // Zakładamy, że `song` ma pole `url` z adresem utworu
    audioManager.loadTrack(deckNumber, trackUrl); // Ładujemy utwór na wybrany deck
    if (deckNumber === 1) {
      setDeck1Song(song);
    } else if (deckNumber === 2) {
      setDeck2Song(song);
    }
  };

  // Funkcja do aktualizacji stanu po dodaniu nowego utworu
  const handleSongAdded = () => {
    setPlaylistUpdateTrigger((prev) => !prev);
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
        {/* Lewa sekcja - Deck 1 */}
        <div className={styles.leftSection}>
          <Deck deckId={1} song={deck1Song} audioManager={audioManager} />
        </div>

        {/* Środkowa sekcja - Mikser */}
        <div className={styles.middleSection}>
          {/* Tutaj można umieścić mikser lub inne kontrolki */}
          <h2>Mikser (przykład)</h2>
        </div>

        {/* Prawa sekcja - Deck 2 */}
        <div className={styles.rightSection}>
          <Deck deckId={2} song={deck2Song} audioManager={audioManager} />
        </div>
      </section>

      {/* Sekcja na podgląd plików */}
      <section className={styles.filePreview}>
        <div className={styles.fileManager}>
          <FileManager selectedPlaylist={selectedPlaylist} onSongAdded={handleSongAdded} />
        </div>
        <div className={styles.playlistManager}>
          <PlaylistManager 
            selectedPlaylist={selectedPlaylist} 
            setSelectedPlaylist={setSelectedPlaylist} 
            playlistUpdateTrigger={playlistUpdateTrigger}
            onAssignToDeck={handleAssignToDeck} // Przekazujemy funkcję do przypisania utworu do decka
          />
        </div>
      </section>
    </div>
  );
};

export default Workspace;

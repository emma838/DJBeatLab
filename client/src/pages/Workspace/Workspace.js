// Workspace.js
import React, { useState } from 'react';
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace';
import FileManager from '../../components/FileManager/FileManager';
import PlaylistManager from '../../components/PlaylistManager/PlaylistManager';
import Deck from '../../components/Deck/Deck';
import styles from './Workspace.module.scss';

const Workspace = () => {
  const [selectedPlaylist, setSelectedPlaylist] = useState('uploads');
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(false);
  const [deck1Track, setDeck1Track] = useState(null);
  const [deck2Track, setDeck2Track] = useState(null);

  const handleAssignToDeck = (deckNumber, song) => {
    const trackUrl = `/api/audio/${song.user}/uploaded/${encodeURIComponent(song.filename)}`;
    const track = { ...song, url: trackUrl };
    if (deckNumber === 1) {
      setDeck1Track(track);
    } else {
      setDeck2Track(track);
    }
  };

  const handleSongAdded = () => setPlaylistUpdateTrigger((prev) => !prev);

  return (
    <div className={styles.workspace}>
      <Header />
      <section className={styles.intermediateSection}>
        <h2>Waveform Section</h2>
      </section>
      <section className={styles.toolbar}>
        <div className={styles.leftSection}>
          <Deck deckNumber={1} track={deck1Track} />
        </div>
        <div className={styles.middleSection}>
          <h2>Mixer (Example)</h2>
        </div>
        <div className={styles.rightSection}>
          <Deck deckNumber={2} track={deck2Track} />
        </div>
      </section>
      <section className={styles.filePreview}>
        <div className={styles.fileManager}>
          <FileManager selectedPlaylist={selectedPlaylist} onSongAdded={handleSongAdded} />
        </div>
        <div className={styles.playlistManager}>
          <PlaylistManager
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
            playlistUpdateTrigger={playlistUpdateTrigger}
            onAssignToDeck={handleAssignToDeck}
          />
        </div>
      </section>
    </div>
  );
};

export default Workspace;

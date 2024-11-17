// Workspace.js
import React, { useState } from 'react';

// Importowanie komponentów
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace';
import FileManager from '../../components/FileManager/FileManager';
import PlaylistManager from '../../components/PlaylistManager/PlaylistManager';
import Deck from '../../components/Deck/Deck';
import Waveform from '../../components/Waveform/Waveform';
import VolumeSlider from '../../components/VolumeSlider/VolumeSlider';
import CrossFader from '../../components/CrossFader/CrossFader';
import EQKnobs from '../../components/EQKnobs/EQKnobs';

// Importowanie hooka do zarządzania audio
import { useAudio } from '../../components/AudioManager/AudioManager';

// Importowanie stylów modułowych
import styles from './Workspace.module.scss';

const Workspace = () => {
  // Destrukturyzacja funkcji z hooka useAudio
  const { loadTrackData, setVolume, setCrossfade } = useAudio();

  // Stan do przechowywania wybranej playlisty
  const [selectedPlaylist, setSelectedPlaylist] = useState('uploads');

  // Stan do wyzwalania aktualizacji playlisty
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(false);

  //stan do zapamietywania przycisku assign to deck"
  const [deckAssignments, setDeckAssignments] = useState({});


  // /**
  //  * Funkcja przypisująca wybraną piosenkę do decka
  //  * @param {number} deckNumber - Numer decka (1 lub 2)
  //  * @param {object} song - Obiekt piosenki
  //  */
  const handleAssignToDeck = (deckNumber, song) => {
    setDeckAssignments((prevAssignments) => ({
      ...prevAssignments,
      [deckNumber]: song._id, // Przypisz ID utworu do danego decka
    }));
    const trackUrl = `/api/audio/${song.user}/uploaded/${encodeURIComponent(song.filename)}`;
    const track = { ...song, url: trackUrl };
    loadTrackData(deckNumber, track);
  };

  /**
   * Funkcja wyzwalająca aktualizację playlisty
   */
  const handleSongAdded = () => {
    setPlaylistUpdateTrigger(prev => !prev);
  };

  // Funkcje do zmiany głośności dla obu decków
  const handleVolumeChangeDeck1 = (newVolume) => setVolume(1, newVolume);
  const handleVolumeChangeDeck2 = (newVolume) => setVolume(2, newVolume);

  // /**
  //  * Funkcja obsługująca zmianę pozycji crossfadera
  //  * @param {number} newPosition - Nowa pozycja crossfadera
  //  */
  const handleCrossfadeChange = (newPosition) => setCrossfade(newPosition);

  return (
    <div className={styles.workspace}>
      {/* Nagłówek Workspace */}
      <Header />

      {/* Sekcja z waveformami dla obu decków */}
      <div className={styles.waveforms}>
        <Waveform
          deckNumber={1}
          waveformColor="#c62b0a"
          playheadColor="#e4dbdb"
          cueColor="#e4dbdb"
        />
        <Waveform
          deckNumber={2}
          waveformColor="#00aa3c"
          playheadColor="#e4dbdb"
          cueColor="#e4dbdb"
        />
      </div>

      {/* Główna sekcja narzędzi (toolbar) */}
      <section className={styles.toolbar}>
        {/* Lewa sekcja z Deckiem 1 */}
        <div className={styles.leftSection}>
          <Deck deckNumber={1} />
        </div>

        {/* Środkowa sekcja z EQ, kontrolkami głośności i crossfaderem */}
        <div className={styles.middleSection}>
          {/* EQ po lewej stronie */}
          <div className={styles.eqleft}>
            <EQKnobs deckNumber={1} />
          </div>

          {/* Panel centralny z kontrolkami głośności i crossfaderem */}
          <div className={styles.centerpanel}>
            {/* Sekcja głośności i filtru */}
            <div className={styles.volfilter}>
              {/* Slider głośności lewego decka */}
              <div className={styles.volfilterleft}>
                <VolumeSlider
                  deckNumber={1} // Możliwe: 1 lub 2, w zależności od decka
                  initialValue={1}
                  onVolumeChange={handleVolumeChangeDeck1}
                />
                {/* <GainMeter deckNumber={1} /> */}
              </div>

              {/* Slider głośności prawego decka */}
              <div className={styles.volfilterright}>
                <VolumeSlider
                  deckNumber={2} // Poprawione na 2 dla prawego decka
                  initialValue={1}
                  onVolumeChange={handleVolumeChangeDeck2}
                />
                {/* <GainMeter deckNumber={2} /> */}
              </div>
            </div>

            {/* Kontrolka crossfadera */}
            <CrossFader onCrossfadeChange={handleCrossfadeChange} />
          </div>

          {/* EQ po prawej stronie */}
          <div className={styles.eqright}>
            <EQKnobs deckNumber={2} />
          </div>
        </div>

        {/* Prawa sekcja z Deckiem 2 */}
        <div className={styles.rightSection}>
          <Deck deckNumber={2} />
        </div>
      </section>

      {/* Sekcja podglądu plików */}
      <section className={styles.filePreview}>
        {/* Menedżer plików */}
        <div className={styles.fileManager}>
          <FileManager
            selectedPlaylist={selectedPlaylist}
            onSongAdded={handleSongAdded}
          />
        </div>

        {/* Menedżer playlist */}
        <div className={styles.playlistManager}>
          <PlaylistManager
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
            playlistUpdateTrigger={playlistUpdateTrigger}
            onAssignToDeck={handleAssignToDeck}
            deckAssignments={deckAssignments}
          />
        </div>
      </section>
    </div>
  );
};

export default Workspace;

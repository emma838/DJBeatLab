// Workspace.js
import React, { useState } from 'react';
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace';
import FileManager from '../../components/FileManager/FileManager';
import PlaylistManager from '../../components/PlaylistManager/PlaylistManager';
import Deck from '../../components/Deck/Deck';
import Waveform from '../../components/Waveform/Waveform';
import VolumeSlider from '../../components/VolumeSlider/VolumeSlider';
import CrossFader from '../../components/CrossFader/CrossFader';
import GainMeter from '../../components/GainMeter/GainMeter';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Workspace.module.scss';
import EQKnobs from '../../components/EQKnobs/EQKnobs';

const Workspace = () => {
  const { loadTrackData,setVolume,setCrossfade   } = useAudio();
  const [selectedPlaylist, setSelectedPlaylist] = useState('uploads');
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(false);

  const handleAssignToDeck = (deckNumber, song) => {
    const trackUrl = `/api/audio/${song.user}/uploaded/${encodeURIComponent(song.filename)}`;
    const track = { ...song, url: trackUrl };
    loadTrackData(deckNumber, track);
  };

  const handleSongAdded = () => setPlaylistUpdateTrigger((prev) => !prev);

   // Funkcje zmiany głośności dla obu decków
   const handleVolumeChangeDeck1 = (newVolume) => setVolume(1, newVolume);
   const handleVolumeChangeDeck2 = (newVolume) => setVolume(2, newVolume);

   const handleCrossfadeChange = (newPosition) => setCrossfade(newPosition);


  return (
    <div className={styles.workspace}>
      <Header />
      <div  className={styles.waveforms}>
        <Waveform deckNumber={1} waveformColor="#FF4C1A"  playheadColor="#e4dbdb"/>
        <Waveform deckNumber={2} waveformColor="#00DD51"  playheadColor="#e4dbdb"/>
      </div>
      <section className={styles.toolbar}>
        <div className={styles.leftSection}>
          <Deck deckNumber={1} />
        </div>
        <div className={styles.middleSection}>
          <EQKnobs deckNumber={1} />
          <VolumeSlider initialValue={1} onVolumeChange={handleVolumeChangeDeck1} />
          {/* <GainMeter deckNumber={1} /> */}
          <VolumeSlider initialValue={1} onVolumeChange={handleVolumeChangeDeck2} />
          {/* <GainMeter deckNumber={2} /> */}
          <EQKnobs deckNumber={2} />
          <CrossFader onCrossfadeChange={handleCrossfadeChange} />
        </div>
        <div className={styles.rightSection}>
          <Deck deckNumber={2} />
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

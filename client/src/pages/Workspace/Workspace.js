// Workspace.js
// Komponent główny aplikacji DJ-owej, zarządzający interfejsem użytkownika, deckami, playlistami oraz integracją z kontrolerem MIDI.

import React, { useState, useEffect } from 'react';

// Importowanie komponentów interfejsu
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace';
import FileManager from '../../components/FileManager/FileManager';
import PlaylistManager from '../../components/PlaylistManager/PlaylistManager';
import Deck from '../../components/Deck/Deck';
import Waveform from '../../components/Waveform/Waveform';
import VolumeSlider from '../../components/VolumeSlider/VolumeSlider';
import CrossFader from '../../components/CrossFader/CrossFader';
import ConfirmDeckModal from '../../components/ConfirmDeckModal/ConfirmDeckModal';
import EQKnobs from '../../components/EQKnobs/EQKnobs';
import midiMappings from './MidiMappings.js';

// Importowanie hooka do zarządzania audio z AudioManager
import { useAudio } from '../../components/AudioManager/AudioManager';

// Importowanie stylów modułowych SCSS
import styles from './Workspace.module.scss';

const Workspace = () => {
  // Destrukturyzacja funkcji i stanów z hooka useAudio
  const {
    decks,
    loadTrackData,
    setVolume,
    setCrossfade,
    stopPlayback,
    playPause,
    handleCueMouseDown,
    handleCueMouseUp,
    decksInitializedRef,
  } = useAudio();

  // Stan do obsługi błędów MIDI
  const [error, setError] = useState(null);

  // Stan do przechowywania wybranej playlisty
  const [selectedPlaylist, setSelectedPlaylist] = useState('uploads');

  // Stan do wyzwalania aktualizacji playlisty
  const [playlistUpdateTrigger, setPlaylistUpdateTrigger] = useState(false);

  // Stan do zapamiętywania przypisań utworów do decków
  const [deckAssignments, setDeckAssignments] = useState({});

  // Stany do obsługi modala potwierdzenia przypisania utworu do decka
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingDeckNumber, setPendingDeckNumber] = useState(null);
  const [pendingSong, setPendingSong] = useState(null);

  // Funkcja przypisująca wybraną piosenkę do decka
  const assignTrackToDeck = (deckNumber, song) => {
    setDeckAssignments((prevAssignments) => ({
      ...prevAssignments,
      [deckNumber]: song._id,
    }));

    const trackUrl = `/api/audio/${song.user}/uploaded/${encodeURIComponent(song.filename)}`;
    const track = { ...song, url: trackUrl };
    loadTrackData(deckNumber, track);
  };

  // Funkcja obsługująca przypisanie utworu do decka z możliwością potwierdzenia, jeśli deck jest odtwarzany
  const handleAssignToDeck = (deckNumber, song) => {
    if (decks[deckNumber]?.isPlaying) {
      // Deck jest aktualnie odtwarzany, pokaż modal z potwierdzeniem
      setPendingDeckNumber(deckNumber);
      setPendingSong(song);
      setIsConfirmModalOpen(true);
    } else {
      // Deck nie odtwarza, wgraj utwór normalnie
      assignTrackToDeck(deckNumber, song);
    }
  };

  // Funkcja potwierdzająca przypisanie utworu do decka
  const handleConfirmLoad = () => {
    stopPlayback(pendingDeckNumber);
    assignTrackToDeck(pendingDeckNumber, pendingSong);
    setIsConfirmModalOpen(false);
    setPendingDeckNumber(null);
    setPendingSong(null);
  };

  // Funkcja anulująca przypisanie utworu do decka
  const handleCancelLoad = () => {
    setIsConfirmModalOpen(false);
    setPendingDeckNumber(null);
    setPendingSong(null);
  };

  // Funkcja wyzwalająca aktualizację playlisty po dodaniu utworu
  const handleSongAdded = () => {
    setPlaylistUpdateTrigger((prev) => !prev);
  };

  // Funkcje do zmiany głośności dla obu decków
  const handleVolumeChangeDeck1 = (newVolume) => setVolume(1, newVolume);
  const handleVolumeChangeDeck2 = (newVolume) => setVolume(2, newVolume);

  // Funkcja obsługująca zmianę pozycji crossfadera
  const handleCrossfadeChange = (newPosition) => setCrossfade(newPosition);

  // Funkcja obsługująca wiadomości MIDI
  const handleMIDIMessage = (event) => {
    if (!decksInitializedRef.current) {
      console.warn('Decks not initialized yet, ignoring MIDI message.');
      return;
    }

    const [status, control, value] = event.data;
    const command = status >> 4; // Typ polecenia
    const channel = status & 0xf; // Kanał MIDI

    console.log('MIDI Event:', { status, control, value, command, channel });

    const mappingKey = `${control}-${channel}`;

    if (command === 9 && value > 0) { // Note On
      const mapping = midiMappings.noteOn[mappingKey];
      if (mapping) {
        const { action, deck } = mapping;

        if (action === 'playPause') {
          // Debounce playPause dla decka
          if (debounceTimers[deck]) {
            clearTimeout(debounceTimers[deck]);
          }
          debounceTimers[deck] = setTimeout(() => {
            playPause(deck);
          }, 50); // Czas debounce w milisekundach
        } else if (action === 'cuePress') {
          handleCueMouseDown(deck); // Obsługa przycisku wciśniętego
        }
      }
    } else if (command === 8 || (command === 9 && value === 0)) { // Note Off
      const mapping = midiMappings.noteOff[mappingKey];
      if (mapping) {
        const { action, deck } = mapping;
        if (action === 'cueRelease') {
          handleCueMouseUp(deck); // Obsługa przycisku zwolnionego
        }
      }
    } else if (command === 11) { // Control Change
      if (control === 28) { // Suwak głośności (przykład)
        const deck = channel === 0 ? 1 : 2; // Deck 1 dla kanału 0, Deck 2 dla kanału 1
        let normalizedVolume = value / 127; // Normalizacja do zakresu 0–1

        // Zaokrąglanie do precyzji suwaka
        const step = 0.001; // Taki sam jak w VolumeSlider
        normalizedVolume = Math.round(normalizedVolume / step) * step;

        // Ustaw wartość 0 jako dokładne zero
        if (normalizedVolume < 0.008) {
          normalizedVolume = 0;
        }

        setVolume(deck, normalizedVolume);
      }
    }
  };

  // Funkcja obsługująca sukces połączenia MIDI
  const onMIDISuccess = (midiAccess) => {
    const inputs = midiAccess.inputs.values();

    for (let input of inputs) {
      console.log('Podłączone urządzenie MIDI:', input.name);
      input.onmidimessage = handleMIDIMessage;
    }
  };

  // Obiekt przechowujący timery debounce dla decków
  const debounceTimers = {};

  // Hook useEffect do inicjalizacji obsługi MIDI po załadowaniu komponentu
  useEffect(() => {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess()
        .then(onMIDISuccess)
        .catch((err) => setError(`Błąd MIDI: ${err.message}`));
    } else {
      setError('Twoja przeglądarka nie obsługuje Web MIDI API.');
    }
  }, []);

  return (
    <div className={styles.workspace}>
      {/* Nagłówek Workspace */}
      <Header />

      {/* Sekcja z waveformami dla obu decków */}
      <div className={styles.waveforms}>
        <Waveform
          deckNumber={1}
          waveformColor="#FF5722"
          playheadColor="#FFFFFF"
          cueColor="#DC143C"
          loopColor="rgba(30, 144, 255, 0.2)"
          loopLineColor="#1E90FF"
        />
        <Waveform
          deckNumber={2}
          waveformColor="#4CAF50"
          playheadColor="#FFFFFF"
          cueColor="#DC143C"
          loopColor="rgba(30, 144, 255, 0.2)"
          loopLineColor="#1E90FF"
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
            {/* Sekcja głośności */}
            <div className={styles.volfilter}>
              {/* Slider głośności lewego decka */}
              <div className={styles.volfilterleft}>
                <VolumeSlider
                  deckNumber={1}
                  initialValue={decks[1]?.volumeGain?.gain.value || 1}
                  onVolumeChange={handleVolumeChangeDeck1}
                />
              </div>

              {/* Slider głośności prawego decka */}
              <div className={styles.volfilterright}>
                <VolumeSlider
                  deckNumber={2}
                  initialValue={decks[2]?.volumeGain?.gain.value || 1}
                  onVolumeChange={handleVolumeChangeDeck2}
                />
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

      {/* Modal z potwierdzeniem przypisania utworu do decka */}
      {isConfirmModalOpen && (
        <ConfirmDeckModal
          deckNumber={pendingDeckNumber}
          onConfirm={handleConfirmLoad}
          onCancel={handleCancelLoad}
        />
      )}
    </div>
  );
};

export default Workspace;

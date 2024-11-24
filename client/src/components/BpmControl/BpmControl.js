import React, { useState, useEffect } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './BpmControl.module.scss';
import Up from '@mui/icons-material/ArrowDropUp';
import Down from '@mui/icons-material/ArrowDropDown';

function BpmControl({ deckNumber }) {
  const { decks, updateBpm } = useAudio();
  const deck = decks[deckNumber];
  const baseBpm = deck?.defaultBpm || 120;
  const bpm = deck?.bpm || baseBpm;

  const minBpm = Math.max(baseBpm - 40, 40);
  const maxBpm = baseBpm + 40;

  // Lokalny stan dla input
  const [inputValue, setInputValue] = useState(bpm);

  // Synchronizacja lokalnego stanu z aktualnym BPM z aplikacji
  useEffect(() => {
    setInputValue(bpm);
  }, [bpm]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value); // Umożliwienie wpisania dowolnej wartości
  };

  const handleInputBlur = () => {
    let newBpm = parseFloat(inputValue);

    if (isNaN(newBpm)) {
      // Przywróć poprzednią wartość BPM, jeśli wpis jest nieprawidłowy
      setInputValue(bpm);
      return;
    }

    // Ogranicz wartość do zakresu min/max
    newBpm = Math.max(minBpm, Math.min(newBpm, maxBpm));
    updateBpm(deckNumber, newBpm);
    setInputValue(newBpm); // Zaktualizuj lokalny stan
  };

  const incrementBpm = () => {
    const newBpm = Math.min(bpm + 1, maxBpm);
    updateBpm(deckNumber, newBpm);
  };

  const decrementBpm = () => {
    const newBpm = Math.max(bpm - 1, minBpm);
    updateBpm(deckNumber, newBpm);
  };

  return (
    <div className={styles.bpmControl}>
      <label>BPM</label>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur} // Ograniczenie wartości po opuszczeniu pola
          min={minBpm}
          max={maxBpm}
          className={styles.numberInput}
        />
        <div className={styles.buttons}>
          <button onClick={incrementBpm} className={styles.spinButton}>
            <Up />
          </button>
          <button onClick={decrementBpm} className={styles.spinButton}>
            <Down />
          </button>
        </div>
      </div>
    </div>
  );
}

export default BpmControl;

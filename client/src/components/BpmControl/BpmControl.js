import React from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './BpmControl.module.scss'; // Opcjonalne: dla stylizacji
import Up from '@mui/icons-material/ArrowDropUp';
import Down from '@mui/icons-material/ArrowDropDown';


function BpmControl({ deckNumber }) {
  const { decks, updateBpm } = useAudio();
  const deck = decks[deckNumber];
  const bpm = deck?.bpm || 120;

  const handleBpmChange = (e) => {
    const newBpm = parseFloat(e.target.value);
    if (isNaN(newBpm)) return;
    updateBpm(deckNumber, newBpm);
  };

  const incrementBpm = () => {
    const newBpm = Math.min(bpm + 1, 300); // Maksymalna wartość 300
    updateBpm(deckNumber, newBpm);
  };

  const decrementBpm = () => {
    const newBpm = Math.max(bpm - 1, 40); // Minimalna wartość 40
    updateBpm(deckNumber, newBpm);
  };

  return (
    <div className={styles.bpmControl}>
      <label>BPM</label>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          value={bpm}
          onChange={handleBpmChange}
          min="40"
          max="300"
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

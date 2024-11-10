// BpmControl.js
import React from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './BpmControl.module.scss'; // Opcjonalne: dla stylizacji

function BpmControl({ deckNumber }) {
  const { decks, updateBpm } = useAudio();
  const deck = decks[deckNumber];
  const bpm = deck?.bpm || 120;

  const handleBpmChange = (e) => {
    const newBpm = parseFloat(e.target.value);
    if (isNaN(newBpm)) return;
    updateBpm(deckNumber, newBpm);
  };

  return (
    <div className={styles.bpmControl}>
      <label>BPM:</label>
      <input
        type="number"
        value={bpm}
        onChange={handleBpmChange}
        min="40"
        max="300"
        className={styles.numberInput}
      />
    </div>
  );
}

export default BpmControl;

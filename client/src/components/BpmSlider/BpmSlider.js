// BpmSlider.js
import React from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './BpmSlider.module.scss';

const BpmSlider = ({ deckNumber }) => {
  const { decks, updateBpm } = useAudio();
  const deck = decks[deckNumber];
  const baseBpm = deck?.defaultBpm || 120;
  const bpm = deck?.bpm || baseBpm;

  // Definiowanie zakresu BPM z uwzględnieniem ±80 BPM, minimalne BPM to 40
  const minBpm = Math.max(baseBpm - 40, 40);
  const maxBpm = baseBpm + 40;

  const handleSliderChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    if (isNaN(newBpm)) return;
    updateBpm(deckNumber, newBpm);
  };

  return (
    <div className={styles.bpmSlider}>
      <div className={styles.label}>TEMPO</div>
      <input
        type="range"
        min={minBpm}
        max={maxBpm}
        step="1"
        value={bpm}
        onChange={handleSliderChange}
        className={styles.slider}
      />
      <div className={styles.bpmValue}>{bpm}</div>
    </div>
  );
};

export default BpmSlider;

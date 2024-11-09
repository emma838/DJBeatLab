// PitchFader.js
import React from 'react';
import styles from './PitchFader.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager';

function PitchFader({ deckNumber }) {
  const { decks, setPitch } = useAudio();
  const deck = decks[deckNumber];

  const handleChange = (e) => {
    const newPitch = parseFloat(e.target.value);
    setPitch(deckNumber, newPitch);
  };

  return (
    <div className={styles.pitchFaderContainer}>
      <label htmlFor={`pitch-slider-${deckNumber}`} className={styles.pitchLabel}>
        Pitch
      </label>
      <input
        id={`pitch-slider-${deckNumber}`}
        type="range"
        min="0.5"
        max="2"
        step="0.01"
        value={deck.pitch}
        onChange={handleChange}
        className={styles.pitchSlider}
      />
      <span className={styles.pitchValue}>{deck.pitch.toFixed(2)}x</span>
    </div>
  );
}

export default PitchFader;

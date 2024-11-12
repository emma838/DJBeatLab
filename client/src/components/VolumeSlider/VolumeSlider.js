// VolumeSlider.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './VolumeSlider.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager'; // Import useAudio
import Knob from '../Knob/Knob'; // Import Knob

const VolumeSlider = ({ deckNumber, initialValue = 1, onVolumeChange }) => {
  const [volume, setVolume] = useState(initialValue);

  const { updateEQ, decks } = useAudio();
  const deck = decks[deckNumber];

  if (!deck) {
    return <div>Deck nie jest dostępny</div>;
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const handleFilterChange = (value) => {
    updateEQ(deckNumber, 'filter', value);
  };

  return (
    <div className={styles.volumeSlider}>
      <label>Volume</label>
      <input
        type="range"
        min="0"
        max="1" // Ustaw maksymalną głośność na 1
        step="0.001"
        value={volume}
        onChange={handleVolumeChange}
        className={styles.slider}
      />
      {/* Dodanie pokrętła Filter */}
      <Knob
        label="Filter"
        value={deck.filterValue}
        min={-10}
        max={10}
        step={0.2}
        onChange={handleFilterChange}
        defaultValue={0}
        numTicks={100}
        tickSize={2}
        tickColor="#888"
        tickOffset={4}
        pointerLength={15}
        pointerColor="#333"
        pointerWidth={4}
        pointerLinecap="round"
        showScale={true}
      />
    </div>
  );
};

VolumeSlider.propTypes = {
  deckNumber: PropTypes.number.isRequired, // Dodanie deckNumber jako prop
  initialValue: PropTypes.number,
  onVolumeChange: PropTypes.func.isRequired,
};

export default VolumeSlider;

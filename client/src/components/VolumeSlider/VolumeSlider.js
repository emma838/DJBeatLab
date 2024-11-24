import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './VolumeSlider.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager'; // Import useAudio
import Knob from '../Knob/Knob'; // Import Knob

const VolumeSlider = ({ deckNumber, initialValue = 1, onVolumeChange }) => {
  const [volume, setVolume] = useState(initialValue);

  useEffect(() => {
    setVolume(initialValue); // Aktualizuj lokalny stan, jeśli initialValue się zmienia
  }, [initialValue]);

  const { updateEQ, decks } = useAudio();
  const deck = decks[deckNumber];
  const [filterValue, setFilterValue] = useState(0);

  if (!deck) {
    return <div>Deck nie jest dostępny</div>;
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const handleWheel = (e) => {
    e.preventDefault(); // Zapobiega przewijaniu strony
    const delta = e.deltaY > 0 ? -0.01 : 0.01; // Scroll w górę zwiększa, w dół zmniejsza
    const newVolume = Math.min(1, Math.max(0, volume + delta)); // Ogranicz zakres 0-1
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  const handleFilterChange = (value) => {
    setFilterValue(value);
    if (deck && deck.filter) {
      updateEQ(deckNumber, 'filter', value);
    } else {
      console.warn(`Deck ${deckNumber}: filter node not available yet.`);
    }
    };
  


  

  return (
    <div className={styles.volumeSlider}>
      <label>VOLUME</label>
      <div className={styles.scaleLabel}>
        <span>+</span>
        <span>-</span>
      </div>
      <div className={styles.scale}>
        {/* Kreski skali */}
        {[...Array(11)].map((_, index) => (
          <span key={index} className={styles.scaleMark}></span>
        ))}
      </div>
      <input
        type="range"
        min="0"
        max="1" // Ustaw maksymalną głośność na 1
        step="0.001"
        value={volume}
        onChange={handleVolumeChange}
        onWheel={handleWheel} // Dodanie obsługi scrolla
        className={styles.slider}
      />
      {/* Dodanie pokrętła Filter */}
      <Knob
        label="FILTER"
        value={deck?.filterValue ?? 0}
        min={-10}
        max={10}
        step={0.1}
        onChange={handleFilterChange}
        defaultValue={0}
        numTicks={25}
        tickSize={1}
        tickColor="#d1c6c6"
        tickOffset={6}
        pointerLength={15}
        pointerColor="#ea3c0c"
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

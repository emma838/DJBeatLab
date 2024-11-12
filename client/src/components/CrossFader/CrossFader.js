import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CrossFader.module.scss';

const Crossfader = ({ onCrossfadeChange }) => {
  const [position, setPosition] = useState(0.5); // Domyślnie ustawione na środek (0.5)

  const handleSliderChange = (e) => {
    const newPosition = parseFloat(e.target.value);
    setPosition(newPosition);
    onCrossfadeChange(newPosition); // Przekazanie wartości do funkcji obsługującej
  };

  return (
    <div className={styles.crossfader}>
      <label>Crossfader</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={position}
        onChange={handleSliderChange}
        className={styles.slider}
      />
    </div>
  );
};

Crossfader.propTypes = {
  onCrossfadeChange: PropTypes.func.isRequired, // Funkcja obsługi zmiany
};

export default Crossfader;

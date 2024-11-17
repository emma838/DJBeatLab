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
    <div className={styles.crossfaderContent}>
      <span>CROSSFADER</span>
    <div className={styles.crossfader}>
      <div className={styles.scale}>
        <div className={`${styles.scaleMark} ${styles.top}`} />
        <div className={`${styles.scaleMark} ${styles.middle}`} />
        <div className={`${styles.scaleMark} ${styles.bottom}`} />
      </div>
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
    </div>
  );
};

Crossfader.propTypes = {
  onCrossfadeChange: PropTypes.func.isRequired, // Funkcja obsługi zmiany
};

export default Crossfader;

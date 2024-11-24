import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CrossFader.module.scss';

const Crossfader = ({ onCrossfadeChange }) => {
  const [position, setPosition] = useState(0.5); // Domyślnie ustawione na środek (0.5)

  const handleSliderChange = (e) => {
    let newPosition = parseFloat(e.target.value);
    // Upewnij się, że wartość jest w zakresie 0 do 1
    newPosition = Math.max(0, Math.min(1, newPosition));
    setPosition(newPosition);
    onCrossfadeChange(newPosition); // Przekazanie wartości do funkcji obsługującej
  };

  const handleWheel = (e) => {
    e.preventDefault(); // Zapobiega przewijaniu strony
    const delta = e.deltaY > 0 ? -0.01 : 0.01; // Scroll w górę zwiększa, w dół zmniejsza
    let newPosition = position + delta;
    // Ogranicz zakres 0 do 1
    newPosition = Math.max(0, Math.min(1, newPosition));
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
          onWheel={handleWheel} // Dodanie obsługi scrolla
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

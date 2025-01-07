import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CrossFader.module.scss';
import Tooltip from '../ToolTip/ToolTip';

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
                    <Tooltip
        className={styles.tooltip}
        style={{ top: "10px", right: "105px", width: "15px", height: "15px" }}
        bubbleBgColor="#f1f1f1"
        iconColor="#000"
          position = "right"
        title="CROSSFADER"
        text="Allows you to control the volume simultaneously for both decks.</br> 
        <strong>Center position:</strong> Both decks are heard at the same volume level.</br>
         <strong>Shift to the left:</strong> Increases the volume of deck 1 while decreasing the volume of deck 2.</br>
         <strong>Shift to the right:</strong> Increases the volume of deck 2 while decreasing the volume of deck 1.</br>"
      />
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

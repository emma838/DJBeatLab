// FXHandler.js
import React, { useState } from 'react';
import { useAudio } from '../AudioManager/AudioManager';
import styles from './FXHandler.module.scss';

const FXHandler = ({ deckNumber }) => {
  const { updateReverbIntensity, updateDryGain } = useAudio();
  const [reverbIntensity, setReverbIntensity] = useState(0.5);
  const [dryGain, setDryGain] = useState(1);
  const [isReverbEnabled, setIsReverbEnabled] = useState(true);

  const handleReverbChange = (e) => {
    const intensity = parseFloat(e.target.value);
    setReverbIntensity(intensity);
    updateReverbIntensity(deckNumber, intensity);
  };

  const handleDryGainChange = (e) => {
    const gain = parseFloat(e.target.value);
    setDryGain(gain);
    updateDryGain(deckNumber, gain);
  };

  const toggleReverb = () => {
    const newState = !isReverbEnabled;
    setIsReverbEnabled(newState);
    if (newState) {
      updateReverbIntensity(deckNumber, reverbIntensity);
    } else {
      updateReverbIntensity(deckNumber, 0); // Wyłączenie reverbu
    }
  };

  return (
    <div className={styles.fxHandler}>
      <label>
        <input
          type="checkbox"
          checked={isReverbEnabled}
          onChange={toggleReverb}
        />
        Enable Reverb
      </label>
      {isReverbEnabled && (
        <>
          <label>Reverb Intensity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={reverbIntensity}
            onChange={handleReverbChange}
            className={styles.slider}
          />
        </>
      )}
      
    </div>
  );
};

export default FXHandler;

// VolumeSlider.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './VolumeSlider.module.scss';

const VolumeSlider = ({ initialValue = 1, onVolumeChange }) => {
  const [volume, setVolume] = useState(initialValue);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  return (
    <div className={styles.volumeSlider}>
      <label>Volume</label>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        className={styles.slider}
      />
    </div>
  );
};

VolumeSlider.propTypes = {
  initialValue: PropTypes.number,
  onVolumeChange: PropTypes.func.isRequired,
};

export default VolumeSlider;

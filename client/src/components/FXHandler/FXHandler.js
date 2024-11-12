import React, { useState } from 'react';
import { useAudio } from '../AudioManager/AudioManager';
import Knob from '../Knob/Knob';
import styles from './FXHandler.module.scss';

const FXHandler = ({ deckNumber }) => {
  const { updateReverbIntensity, updateDryGain, updateDelayIntensity, updateDelayTime, updateFlangerStrength } = useAudio();
  const [effectType, setEffectType] = useState('reverb'); // Domyślnie reverb
  const [effectIntensity, setEffectIntensity] = useState(0);
  const [delayTime, setDelayTime] = useState(0.3); // Domyślny czas opóźnienia dla delay

  const handleEffectChange = (e) => {
    setEffectType(e.target.value);
    setEffectIntensity(0); // Reset intensywności przy zmianie efektu
    setDelayTime(0.3); // Reset czasu opóźnienia dla delay
  };

  const handleEffectIntensityChange = (intensity) => {
    setEffectIntensity(intensity);
    if (effectType === 'reverb') {
      updateReverbIntensity(deckNumber, intensity);
    } else if (effectType === 'dryGain') {
      updateDryGain(deckNumber, intensity);
    } else if (effectType === 'delay') {
      updateDelayIntensity(deckNumber, intensity);
    } else if (effectType === 'flanger') {
      updateFlangerStrength(deckNumber, intensity);
    }
  };

  const handleDelayTimeChange = (time) => {
    setDelayTime(time);
    if (effectType === 'delay') {
      updateDelayTime(deckNumber, time);
    }
  };

  return (
    <div className={styles.fxHandler}>
      <label>Choose Effect</label>
      <select value={effectType} onChange={handleEffectChange} className={styles.select}>
        <option value="reverb">Reverb</option>
        <option value="dryGain">Dry Gain</option>
        <option value="delay">Delay</option>
        <option value="flanger">Flanger</option>
      </select>

      <label>{`${effectType.charAt(0).toUpperCase() + effectType.slice(1)} Intensity`}</label>
      <Knob
        value={effectIntensity}
        min={0}
        max={1}
        step={0.01}
        onChange={handleEffectIntensityChange}
        label={effectType.charAt(0).toUpperCase() + effectType.slice(1)}
      />

      {effectType === 'delay' && (
        <>
          <label>Delay Time</label>
          <Knob
            value={delayTime}
            min={0}
            max={1}
            step={0.01}
            onChange={handleDelayTimeChange}
            label="Time"
          />
        </>
      )}
    </div>
  );
};

export default FXHandler;

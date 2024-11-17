import React, { useState } from 'react';
import { useAudio } from '../AudioManager/AudioManager';
import Knob from '../Knob/Knob';
import styles from './FXHandler.module.scss';

const FXHandler = ({ deckNumber }) => {
  const {
    updateReverbIntensity,
    updateDelayIntensity,
    updateDelayTime,
    updateFlangerStrength,
  } = useAudio();

  const [effectIntensities, setEffectIntensities] = useState({
    reverb: 0,
    delay: 0,
    flanger: 0,
  });

  const [delayTime, setDelayTime] = useState(0.3); // Default delay time
  const [effectType, setEffectType] = useState('reverb'); // Default effect type

  const handleEffectTypeClick = (selectedEffect) => {
    setEffectType(selectedEffect);
  };

  const handleEffectIntensityChange = (newIntensity) => {
    setEffectIntensities((prevIntensities) => ({
      ...prevIntensities,
      [effectType]: newIntensity,
    }));

    if (effectType === 'reverb') {
      updateReverbIntensity(deckNumber, newIntensity);
    } else if (effectType === 'delay') {
      updateDelayIntensity(deckNumber, newIntensity);
    } else if (effectType === 'flanger') {
      updateFlangerStrength(deckNumber, newIntensity);
    }
  };

  const handleDelayTimeChange = (newTime) => {
    setDelayTime(newTime);
    if (effectType === 'delay') {
      updateDelayTime(deckNumber, newTime);
    }
  };

  const effectSettings = {
    reverb: { min: 0, max: 1, step: 0.1, defaultValue: 0, label: 'GAIN', numTicks: 11 },
    delay: { min: 0, max: 1, step: 0.1, defaultValue: 0, label: 'GAIN', numTicks: 11 },
    flanger: { min: 0, max: 1, step: 0.1, defaultValue: 0, label: 'GAIN', numTicks: 11 },
  };

  const delayTimeSettings = {
    min: 0,
    max: 1,
    step: 0.1,
    defaultValue: 0,
    label: 'TIME',
    numTicks: 11,
  };

  const currentEffectSettings = effectSettings[effectType];

  return (
    <div className={styles.fxHandler}>
      {/* Lista efektów */}
      <ul className={styles.effectList}>
        {['reverb', 'delay', 'flanger'].map((effect) => (
          <li
            key={effect}
            className={`${styles.effectItem} ${
              effectType === effect ? styles.activeEffect : ''
            }`}
            onClick={() => handleEffectTypeClick(effect)}
          >
            {effect.charAt(0).toUpperCase() + effect.slice(1)}
          </li>
        ))}
      </ul>

      {/* Knobs for selected effect */}
      <div className={styles.knobs}>
        <Knob
          value={effectIntensities[effectType]}
          min={currentEffectSettings.min}
          max={currentEffectSettings.max}
          step={currentEffectSettings.step}
          defaultValue={currentEffectSettings.defaultValue}
          onChange={handleEffectIntensityChange}
          label={currentEffectSettings.label}
          showScale={true}
          numTicks={currentEffectSettings.numTicks}
          tickLength={7}
          tickSize={1}
          tickColor="#d1c6c6"
          tickOffset={6}
        />

        {effectType === 'delay' && (
          <Knob
            value={delayTime}
            min={delayTimeSettings.min}
            max={delayTimeSettings.max}
            step={delayTimeSettings.step}
            defaultValue={delayTimeSettings.defaultValue}
            onChange={handleDelayTimeChange}
            label={delayTimeSettings.label}
            showScale={true}
            numTicks={delayTimeSettings.numTicks}
            tickLength={7}
            tickSize={1}
          tickColor="#d1c6c6"
          tickOffset={6}
          />
        )}
      </div>
    </div>
  );
};

export default FXHandler;

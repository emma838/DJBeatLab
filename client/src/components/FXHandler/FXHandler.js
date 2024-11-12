// src/components/FXHandler/FXHandler.js

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

  const [effectType, setEffectType] = useState('reverb'); // Domyślnie reverb
  const [effectIntensity, setEffectIntensity] = useState(0);
  const [delayTime, setDelayTime] = useState(0.3); // Domyślny czas opóźnienia dla delay

  const handleEffectChange = (e) => {
    const selectedEffect = e.target.value;
    setEffectType(selectedEffect);

    // Ustawianie wartości domyślnych dla intensywności i czasu delay
    if (selectedEffect === 'reverb') {
      setEffectIntensity(0);
    } else if (selectedEffect === 'delay') {
      setEffectIntensity(0);
      setDelayTime(0.3);
    } else if (selectedEffect === 'flanger') {
      setEffectIntensity(0);
    }
  };

  const handleEffectIntensityChange = (newIntensity) => {
    setEffectIntensity(newIntensity);
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

  // Ustawienia knobów dla różnych efektów
  const effectSettings = {
    reverb: {
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0,
      label: 'Strength',
      numTicks: 11,
    },
    delay: {
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0,
      label: 'Strength',
      numTicks: 11,
    },
    flanger: {
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 0,
      label: 'Strength',
      numTicks: 11,
    },
  };

  const delayTimeSettings = {
    min: 0.05,
    max: 1,
    step: 0.1,
    defaultValue: 0.3,
    label: 'Time',
    numTicks: 10,
  };

  const currentEffectSettings = effectSettings[effectType];

  return (
    <div className={styles.fxHandler}>
      <select value={effectType} onChange={handleEffectChange} className={styles.select}>
        <option value="reverb">Reverb</option>
        <option value="delay">Delay</option>
        <option value="flanger">Flanger</option>
      </select>
      <div className={styles.knobs}>
      <Knob
        value={effectIntensity}
        min={currentEffectSettings.min}
        max={currentEffectSettings.max}
        step={currentEffectSettings.step}
        defaultValue={currentEffectSettings.defaultValue}
        onChange={handleEffectIntensityChange}
        label={currentEffectSettings.label}
        showScale={true}
        numTicks={currentEffectSettings.numTicks}
        tickLength={7}
        tickColor="#515151"
        tickWidth={1}
      />

      {effectType === 'delay' && (
        <>
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
            tickLength={8}
            tickColor="#888"
            tickWidth={1}
          />
        </>
        
      )}
      </div>
    </div>
  );
};

export default FXHandler;

// GainMeter.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useAudio } from '../AudioManager/AudioManager';
import styles from './GainMeter.module.scss';

const GainMeter = ({ deckNumber }) => {
  const { decks } = useAudio();
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const deck = decks[deckNumber];
    if (!deck || !deck.analyser) return;

    const analyser = deck.analyser;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      setLevel(average);
      requestAnimationFrame(updateLevel);
    };

    updateLevel(); // Rozpocznij aktualizację poziomu głośności

    return () => cancelAnimationFrame(updateLevel);
  }, [decks, deckNumber]);

  // Oblicz ilość aktywnych segmentów na podstawie poziomu
  const activeSegments = Math.floor((level / 160) * 10);

  return (
    <div className={styles.gainMeter}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          className={`${styles.segment} ${
            i < activeSegments ? (i < 6 ? styles.green : i < 8 ? styles.yellow : styles.red) : ''
          }`}
        />
      ))}
    </div>
  );
};

GainMeter.propTypes = {
  deckNumber: PropTypes.number.isRequired,
};

export default GainMeter;

import React from 'react';
import PropTypes from 'prop-types';
import Knob from '../Knob/Knob';
import styles from './EQKnobs.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager';

const EQKnobs = ({ deckNumber }) => {
  const { updateEQ, decks } = useAudio();
  const deck = decks[deckNumber];

  if (!deck || !deck.lowShelf || !deck.midPeak || !deck.highShelf) {
    return <div className={styles.eq}>EQ nie jest dostępny</div>;
  }

  const handleLowChange = (value) => {
    updateEQ(deckNumber, 'low', value);
  };

  const handleMidChange = (value) => {
    updateEQ(deckNumber, 'mid', value);
  };

  const handleHighChange = (value) => {
    updateEQ(deckNumber, 'hi', value);
  };

  const handleFilterChange = (value) => {
    updateEQ(deckNumber, 'filter', value);
  };

  return (
    <div className={styles.eq}>
      <div className={styles.knobs}>
        <Knob
          label="Low"
          value={deck.lowShelf.gain.value}
          min={-12}
          max={12}
          step={1}
          onChange={handleLowChange}
        />
        <Knob
          label="Mid"
          value={deck.midPeak.gain.value}
          min={-12}
          max={12}
          step={1}
          onChange={handleMidChange}
        />
        <Knob
          label="High"
          value={deck.highShelf.gain.value}
          min={-12}
          max={12}
          step={1}
          onChange={handleHighChange}
        />
        <Knob
          label="Filter"
          value={deck.filter.frequency.value}
          min={-100}
          max={100}
          step={1}
          onChange={handleFilterChange}
        />
      </div>
    </div>
  );
};

EQKnobs.propTypes = {
  deckNumber: PropTypes.number.isRequired,
};

export default EQKnobs;

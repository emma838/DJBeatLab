// src/components/EQKnobs/EQKnobs.js

import React, { useState } from 'react'; // Dodajemy useState do importów
import PropTypes from 'prop-types';
import Knob from '../Knob/Knob';
import styles from './EQKnobs.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager';

const EQKnobs = ({ deckNumber }) => {
  const { updateEQ, decks } = useAudio();
  const deck = decks[deckNumber];

  // Stan lokalny do przechowywania wartości EQ przed załadowaniem utworu
  const [lowValue, setLowValue] = useState(0);
  const [midValue, setMidValue] = useState(0);
  const [highValue, setHighValue] = useState(0);

  const handleLowChange = (value) => {
    setLowValue(value);
    if (deck && deck.lowShelf) {
      updateEQ(deckNumber, 'low', value);
    } else {
      console.warn(`Deck ${deckNumber}: lowShelf node not available yet.`);
    }
  };

  const handleMidChange = (value) => {
    setMidValue(value);
    if (deck && deck.midPeak) {
      updateEQ(deckNumber, 'mid', value);
    } else {
      console.warn(`Deck ${deckNumber}: midPeak node not available yet.`);
    }
  };

  const handleHighChange = (value) => {
    setHighValue(value);
    if (deck && deck.highShelf) {
      updateEQ(deckNumber, 'hi', value);
    } else {
      console.warn(`Deck ${deckNumber}: highShelf node not available yet.`);
    }
  };

  return (
    <div className={styles.eq}>
      <div className={styles.knobs}>
      <Knob
          label="HIGH"
          value={deck?.highShelf?.gain?.value ?? highValue}
          min={-12}
          max={12}
          step={1}
          onChange={handleHighChange}
          defaultValue={0}
          numTicks={25}
          tickSize={1}
          tickColor="#d1c6c6"
          tickOffset={6}
          pointerLength={15}
          pointerColor="#ea3c0c"
          pointerWidth={4}
          pointerLinecap="round"
          showScale={true}
        />
        <Knob
          label="MID"
          value={deck?.midPeak?.gain?.value ?? midValue}
          min={-12}
          max={12}
          step={1}
          onChange={handleMidChange}
          defaultValue={0}
          numTicks={25}
          tickSize={1}
          tickColor="#d1c6c6"
          tickOffset={6}
          pointerLength={15}
          pointerColor="#ea3c0c"
          pointerWidth={4}
          pointerLinecap="round"
          showScale={true}
        />
<Knob
          label="LOW"
          value={deck?.lowShelf?.gain?.value ?? lowValue}
          min={-12}
          max={12}
          step={1}
          onChange={handleLowChange}
          defaultValue={0}
          numTicks={25}
          tickSize={1}
          tickColor="#d1c6c6"
          tickOffset={6}
          pointerLength={15}
          pointerColor="#ea3c0c"
          pointerWidth={4}
          pointerLinecap="round"
          showScale={true}
        />
      </div>
    </div>
  );
};

EQKnobs.propTypes = {
  deckNumber: PropTypes.number.isRequired,
};

export default EQKnobs;

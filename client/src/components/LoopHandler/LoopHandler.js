// src/components/LoopHandler.js
import React from 'react';
import { useAudio } from '../AudioManager/AudioManager';
import styles from './LoopHandler.module.scss';

const LoopHandler = ({ deckNumber }) => {
  const {
    setLoopStart,
    setLoopEnd,
    exitLoop,
    handlePredefinedLoop,
    decks,
  } = useAudio();

  const deck = decks[deckNumber];

  return (
    <div className={styles.loopHandler}>
      <div className={styles.predefinedLoops}>
        <div className={styles.loopButtons}>
          {[1, 2, 4, 8, 16, 32].map((bits) => (
            <button key={bits} onClick={() => handlePredefinedLoop(deckNumber, bits)}>
              {bits} bit
            </button>
          ))}
        </div>
      </div>
      <div className={styles.buttons}>
        <div className={styles.inout}>
        <button onClick={() => setLoopStart(deckNumber)}>In</button>
        <button onClick={() => setLoopEnd(deckNumber)}>Out</button>
        </div>
        <button onClick={() => exitLoop(deckNumber)}>Exit</button>
      </div>
      {/* <div className={styles.loopInfo}>
        {deck.isLooping && deck.loopStart !== null && deck.loopEnd !== null ? (
          <p>
            Looping from {deck.loopStart.toFixed(2)}s to {deck.loopEnd.toFixed(2)}s
          </p>
        ) : (
          <p>Loop is not active.</p>
        )}
      </div> */}
    </div>
  );
};

export default LoopHandler;

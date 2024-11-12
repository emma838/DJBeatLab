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
      <div className={styles.loopButtons}>
        {[1, 2, 4, 8, 16, 32].map((bits) => (
          <button
            key={bits}
            onClick={() => handlePredefinedLoop(deckNumber, bits)}
            disabled={deck.isLooping && deck.activePredefinedLoop !== bits}
            className={deck.activePredefinedLoop === bits ? styles.activeButton : ''}
          >
            {bits} bit
          </button>
        ))}
      </div>
      <div className={styles.buttons}>
        <div className={styles.inout}>
          <button
            onClick={() => setLoopStart(deckNumber)}
            disabled={deck.isLooping}
          >
            IN
          </button>
          <button
            onClick={() => setLoopEnd(deckNumber)}
            disabled={deck.loopStart === null || deck.loopEnd !== null || deck.activePredefinedLoop !== null}
          >
            OUT
          </button>
        </div>
        <button
          className={styles.exit}
          onClick={() => exitLoop(deckNumber)}
          disabled={!deck.isLooping || deck.activePredefinedLoop !== null}
        >
          EXIT
        </button>
      </div>
    </div>
  );
};

export default LoopHandler;

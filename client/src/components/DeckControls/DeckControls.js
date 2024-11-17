// DeckControls.js
import React from 'react';
import styles from './DeckControls.module.scss';

function DeckControls({ playPause, isPlaying, deckNumber, handleCueMouseDown, handleCueMouseUp }) {
  return (
    <div className={styles.deckControls}>
      <button onClick={playPause} className={`${styles.playPause} ${isPlaying ? styles.pause : styles.play}`}>
        {isPlaying ? 'PAUSE' : 'PLAY'}
      </button>
      <button
        onMouseDown={() => handleCueMouseDown(deckNumber)}
        onMouseUp={() => handleCueMouseUp(deckNumber)}
        onMouseLeave={(event) => {
          if (event.buttons !== 0) {
            // Only handle mouse leave if a button is pressed
            handleCueMouseUp(deckNumber);
          }
        }}
        className={styles.cue}
      >
        CUE
      </button>
    </div>
  );
}

export default DeckControls;

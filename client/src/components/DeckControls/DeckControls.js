// DeckControls.js
import React from 'react';
import styles from './DeckControls.module.scss';

function DeckControls({ playPause, isPlaying }) {
  return (
    <div className={styles.deckControls}>
      <button onClick={playPause} className={styles.controlButton}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
}

export default DeckControls;

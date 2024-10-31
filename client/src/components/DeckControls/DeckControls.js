// DeckControls.js
import React from 'react';
import styles from './DeckControls.module.scss'; // Ensure you have appropriate styles

function DeckControls({ playPause, isPlaying, onCueMouseDown, onCueMouseUp }) {
  return (
    <div className={styles.deckControls}>
      <button onClick={playPause} className={styles.controlButton}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onMouseDown={onCueMouseDown} // Handle mouse down for hold action
        onMouseUp={onCueMouseUp}     // Handle mouse up for click or hold release
        onMouseLeave={onCueMouseUp}  // Ensure playback stops if mouse leaves the button
        className={styles.controlButton}
      >
        CUE
      </button>
    </div>
  );
}

export default DeckControls;

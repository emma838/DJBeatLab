// Deck.js
import React from 'react';
import TrackInfo from '../TrackInfo/TrackInfo';
import DeckControls from '../DeckControls/DeckControls';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Deck.module.scss';

function Deck({ deckNumber }) {
  const { decks, playPause, handleCueMouseDown, handleCueMouseUp } = useAudio();
  const deck = decks[deckNumber];

  // Log track data for debugging
  console.log(`Deck ${deckNumber} Track Data:`, deck.track);

  // Determine the order of elements based on deckNumber
  const isDeckTwo = deckNumber === 2;

  return (
    <div className={styles.deck}>
      <div className={styles.top}>
        {isDeckTwo ? (
          <>
            <div className={styles.trackinfo2}></div>
            <div className={styles.trackinfo}>
              <TrackInfo
                track={deck.track}
                duration={deck.duration}
                currentTime={deck.currentTime}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles.trackinfo}>
              <TrackInfo
                track={deck.track}
                duration={deck.duration}
                currentTime={deck.currentTime}
              />
            </div>
            <div className={styles.trackinfo2}></div>
          </>
        )}
      </div>

      <div className={styles.bottom}>
        {isDeckTwo ? (
          <>
            <div className={styles.utilsRight}>
              <div className={styles.jogpitch}>
                <div className={styles.pitch}></div>
                <div className={styles.jog}></div>
              </div>
              <div className={styles.buttons}>
                <DeckControls
                  playPause={() => playPause(deckNumber)}
                  isPlaying={deck.isPlaying}
                  deckNumber={deckNumber}
                  handleCueMouseDown={handleCueMouseDown}
                  handleCueMouseUp={handleCueMouseUp}
                />
              </div>
            </div>
            <div className={styles.utilsLeft}></div>
          </>
        ) : (
          <>
            <div className={styles.utilsLeft}></div>
            <div className={styles.utilsRight}>
              <div className={styles.jogpitch}>
                <div className={styles.jog}></div>
                <div className={styles.pitch}></div>
              </div>
              <div className={styles.buttons}>
                <DeckControls
                  playPause={() => playPause(deckNumber)}
                  isPlaying={deck.isPlaying}
                  deckNumber={deckNumber}
                  handleCueMouseDown={handleCueMouseDown}
                  handleCueMouseUp={handleCueMouseUp}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Deck;

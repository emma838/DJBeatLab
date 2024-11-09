// Deck.js
import React from 'react';
import TrackInfo from '../TrackInfo/TrackInfo';
import DeckControls from '../DeckControls/DeckControls';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Deck.module.scss';

function Deck({ deckNumber }) {
  const { decks, playPause } = useAudio();
  const deck = decks[deckNumber];

  // Dodaj logowanie, aby sprawdzić dane tracka
  console.log(`Deck ${deckNumber} Track Data:`, deck.track);

  return (
    <div className={styles.deck}>
      <div className={styles.top}>
        <div className={styles.trackinfo}>
          <TrackInfo
            track={deck.track}
            duration={deck.duration}
            currentTime={deck.currentTime}
          />
        </div>
        <div className={styles.trackinfo2}></div>
      </div>

      <DeckControls
        playPause={() => playPause(deckNumber)}
        isPlaying={deck.isPlaying}
      />
    </div>
  );
}

export default Deck;

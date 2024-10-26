import React from 'react';
import TrackInfo from './TrackInfo/TrackInfo';
import styles from './Deck.module.scss';

function Deck({ deckId, song, audioManager }) {
  const currentTime = 72; // Przykładowa wartość aktualnego czasu odtwarzania (można później dynamicznie aktualizować)

    // Tworzymy `audioUrl` na podstawie `filename` song
    const audioUrl = song ? `/api/audio/${song.user}/${encodeURIComponent(song.filename)}` : null;
    console.log(`Deck ${deckId} - audioUrl:`, audioUrl); // Sprawdzamy URL w konsoli


  return (
    <div className={styles.deck}>
      {song ? (
        <TrackInfo 
          title={song.title} 
          author={song.author} 
          currentTime={currentTime} 
          duration={song.duration} 
          coverImage={song.coverImage}
          audioUrl={audioUrl} 
          waveformUrl={song.waveformUrl}
        />
      ) : (
        <p className={styles.noTrack}>No track loaded</p>
      )}
    </div>
  );
}

export default Deck;

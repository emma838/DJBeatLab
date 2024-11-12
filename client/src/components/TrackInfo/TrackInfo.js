// TrackInfo.js
import React from 'react';
import styles from './TrackInfo.module.scss';

function TrackInfo({ track, duration, currentTime }) {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className={styles.trackInfo}>
      {track && (
        <>
        <div  className={styles.titleauthor}>
        <div className={styles.title}>{track.title}</div>
        <div className={styles.author}>{track.author}</div>
        </div>
          <div className={styles.time}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </>
      )}
    </div>
  );
}

export default TrackInfo;

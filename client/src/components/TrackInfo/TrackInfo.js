// TrackInfo.js
import React from 'react';
import styles from './TrackInfo.module.scss'; // Ensure you have appropriate styles

function TrackInfo({ track, duration, currentTime, cuePoint }) {
  const formatTime = (time) => {
    if (isNaN(time) || time === undefined) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!track) return null;

  return (
    <div className={styles.trackInfo}>
      <div className={styles.songDetails}>
        <p className={styles.title}>{track.title}</p>
        <p className={styles.author}>{track.author}</p>
      </div>
      <div className={styles.timeInfo}>
        <span>Current: {formatTime(currentTime)}</span>
        <span>Duration: {formatTime(duration)}</span>
        <span>Cue: {formatTime(cuePoint)}</span>
      </div>
    </div>
  );
}

export default TrackInfo;

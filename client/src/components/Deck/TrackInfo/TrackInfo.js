import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import styles from './TrackInfo.module.scss';

function TrackInfo({ title, author, currentTime, duration, coverImage, audioUrl }) {
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

  useEffect(() => {
    if (!audioUrl) {
      console.error("audioUrl jest nieprawidłowy lub pusty:", audioUrl);
      return;
    }

    waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'grey',
        progressColor: 'green',
        cursorColor: 'blue', // Kolor kursora
        height: 80, // Zwiększenie wysokości waveformu
        barWidth: null, // Ustawienie `null` powoduje rysowanie ciągłej linii
        minPxPerSec: 1, // Większa wartość daje większą szczegółowość
        pixelRatio: 2, // Podwaja liczbę pikseli dla lepszej jakości
        responsive: true,
        scrollParent: false, // Wyłącza przewijanie
        fillParent: true, // Automatyczne dopasowanie do szerokości kontenera
        normalize: true
    });

    // Pobieranie pliku audio z tokenem autoryzacyjnym
    const loadAudioWithAuth = async () => {
      try {
        const response = await fetch(audioUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error(`Błąd podczas ładowania pliku audio: ${response.statusText}`);
        }

        const blob = await response.blob();
        waveSurferRef.current.loadBlob(blob); // Ładowanie blob do WaveSurfer
      } catch (error) {
        console.error("Nie udało się załadować pliku audio:", error);
      }
    };

    loadAudioWithAuth();

    return () => {
      waveSurferRef.current.destroy();
    };
  }, [audioUrl]);

  const handleWaveformClick = (e) => {
    const position = e.nativeEvent.offsetX / e.target.clientWidth;
    waveSurferRef.current.seekTo(position); 
    console.log(`Przeskocz do pozycji: ${position * duration} sekundy`);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className={styles.trackInfo}>
      <div className={styles.Info}>
        <div className={styles.cover}>
          <img src={coverImage} alt="Cover" className={styles.coverImage} />
        </div>
        <div className={styles.songInfo}>
          <p className={styles.title}>{title}</p>
          <p className={styles.author}>{author}</p>
          <span className={styles.timeInfo}>{formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>
      <div className={styles.waveform} ref={waveformRef} onClick={handleWaveformClick}></div>
    </div>
  );
}

export default TrackInfo;

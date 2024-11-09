// Waveform.js
import React, { useEffect, useRef, useMemo } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Waveform.module.scss';

function Waveform({
  deckNumber,
  waveformColor = '#007bff',
  playheadColor = '#007bff',
  barWidth = 3,       // Domyślna szerokość paska
  barSpacing = 1      // Domyślny odstęp między paskami
}) {
  const { decks, updateCurrentTime } = useAudio();
  const canvasRef = useRef(null);
  const isSeeking = useRef(false);
  const animationFrameRef = useRef(null);

  // Pobranie danych waveformu, długości i aktualnego czasu dla danego decku
  const waveformData = decks[deckNumber]?.waveformData;
  const duration = decks[deckNumber]?.duration;
  const currentTime = decks[deckNumber]?.currentTime;

  // Normalizacja peaks, aby maksymalna wartość wynosiła 1
  const normalizedPeaks = useMemo(() => {
    if (!waveformData || waveformData.length === 0) return [];
    const maxPeak = Math.max(...waveformData);
    if (maxPeak === 0) return waveformData;
    return waveformData.map(peak => peak / maxPeak);
  }, [waveformData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    adjustCanvasForDPR(canvas);

    const drawWaveform = () => {
      try {
        if (!normalizedPeaks || normalizedPeaks.length === 0 || !duration) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const peaks = normalizedPeaks;

        // Obliczenie całkowitej szerokości waveformu z uwzględnieniem odstępów
        const totalBars = peaks.length;
        const totalWidth = totalBars * (barWidth + barSpacing);

        const centerX = width / 2;
        const timeRatio = currentTime / duration;
        const shift = timeRatio * totalWidth - centerX;

        // Ustawienie koloru dla waveformu
        ctx.fillStyle = waveformColor;

        for (let i = 0; i < peaks.length; i++) {
          const peak = peaks[i];
          const x = i * (barWidth + barSpacing) - shift;

          const y = (1 - peak) * height / 2;
          const barHeight = peak * height;

          // Rysowanie tylko widocznych pasków
          if (x + barWidth >= 0 && x <= width) {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }

        // Rysowanie playhead (środkowej linii)
        ctx.fillStyle = playheadColor;
        ctx.fillRect(centerX - 1, 0, 2, height);
      } catch (error) {
        console.error('Error drawing waveform:', error);
      }
    };

    const animate = () => {
      drawWaveform();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [
    normalizedPeaks,
    duration,
    currentTime,
    waveformColor,
    playheadColor,
    barWidth,
    barSpacing
  ]);

  const adjustCanvasForDPR = (canvas) => {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  };

  const handleMouseDown = (event) => {
    event.preventDefault();
    isSeeking.current = true;
    handleSeek(event);
  };

  const handleMouseMove = (event) => {
    if (isSeeking.current) {
      event.preventDefault();
      handleSeek(event);
    }
  };

  const handleMouseUp = (event) => {
    if (isSeeking.current) {
      event.preventDefault();
      isSeeking.current = false;
    }
  };

  const handleSeek = (event) => {
    const deck = decks[deckNumber];
    const { duration, waveformData, currentTime } = deck;

    if (!waveformData || !duration) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const width = canvas.clientWidth;
    const centerX = width / 2;

    const totalWidth = waveformData.length * (barWidth + barSpacing);
    const timePerPixel = duration / totalWidth;

    // Oblicz różnicę czasu na podstawie przesunięcia kursora względem środka
    const timeOffset = (x - centerX) * timePerPixel;

    // Nowy czas to aktualny czas plus przesunięcie
    const newTime = currentTime + timeOffset;

    // Ogranicz czas między 0 a długość utworu
    const clampedTime = Math.max(0, Math.min(duration, newTime));

    updateCurrentTime(deckNumber, clampedTime);
  };

  console.log(`Rendering Waveform - Current Time: ${decks[deckNumber]?.currentTime}`);

  return (
    <div className={styles.waveformWrapper}>
      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        className={styles.waveform}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}

export default Waveform;

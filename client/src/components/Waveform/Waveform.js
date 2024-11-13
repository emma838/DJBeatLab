import React, { useEffect, useRef, useMemo } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Waveform.module.scss';

function Waveform({
  deckNumber,
  waveformColor = '#007bff',
  playheadColor = '#007bff',
  loopColor = 'rgba(255, 0, 0, 0.3)', // Półprzezroczysty czerwony dla pętli
  cueColor = '#FF0000', // Czerwony dla CUE
  loopLineColor = '#FF0000', // Czerwony dla linii pętli
  loopLineWidth = 2, // Grubość linii pętli
  barWidth = 3,
  barSpacing = 1,
}) {
  const { decks, updateCurrentTime, startPlayback, stopPlayback } = useAudio();
  const canvasRef = useRef(null);
  const isSeeking = useRef(false);
  const animationFrameRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const lastSeekTimeRef = useRef(0);


  // Extract necessary data from the deck
  const deck = decks[deckNumber];
  const waveformData = deck?.waveformData;
  const duration = deck?.duration;
  const currentTime = deck?.currentTime;
  const cuePoint = deck?.cuePoint || 0;
  const bpm = deck?.bpm || 120;
  const defaultBpm = deck?.defaultBpm || 120;
  const loopStart = deck?.loopStart;
  const loopEnd = deck?.loopEnd;
  const isLooping = deck?.isLooping;

  const pixelsPerSecond = 100; // Stała prędkość przesuwania waveforma
  const scaleFactor = defaultBpm / bpm; // Współczynnik skalowania

  // Normalize peaks so the maximum value is 1
  const normalizedPeaks = useMemo(() => {
    if (!waveformData || waveformData.length === 0) return [];
    const maxPeak = Math.max(...waveformData);
    if (maxPeak === 0) return waveformData;
    return waveformData.map((peak) => peak / maxPeak);
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

        // W funkcji drawWaveform, przed obliczeniem shift:
const currentTimeToUse = isSeeking.current ? lastSeekTimeRef.current : currentTime;

        const centerX = width / 2;
// Następnie użyj currentTimeToUse zamiast currentTime:
const shift = currentTimeToUse * pixelsPerSecond * scaleFactor - centerX;

        const timePerSample = duration / peaks.length;

        // Rysowanie zakresu pętli (jeśli aktywna)
        if (isLooping && loopStart !== null && loopEnd !== null) {
          const xLoopStart = loopStart * pixelsPerSecond * scaleFactor - shift;
          const xLoopEnd = loopEnd * pixelsPerSecond * scaleFactor - shift;

          const xStart = Math.max(0, xLoopStart);
          const xEnd = Math.min(width, xLoopEnd);

          if (xStart < width && xEnd > 0 && xEnd > xStart) {
            ctx.fillStyle = loopColor;
            ctx.fillRect(xStart, 0, xEnd - xStart, height);

            ctx.strokeStyle = loopLineColor;
            ctx.lineWidth = loopLineWidth;
            ctx.beginPath();
            ctx.moveTo(xLoopStart, 0);
            ctx.lineTo(xLoopStart, height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(xLoopEnd, 0);
            ctx.lineTo(xLoopEnd, height);
            ctx.stroke();
          }
        }

        // Ustawienie koloru waveforma
        ctx.fillStyle = waveformColor;

        for (let i = 0; i < peaks.length; i++) {
          const peak = peaks[i];
          const time = i * timePerSample;
          const x = time * pixelsPerSecond * scaleFactor - shift;

          const y = ((1 - peak) * height) / 2;
          const barHeight = peak * height;

          // Rysuj tylko widoczne słupki
          if (x + barWidth >= 0 && x <= width) {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }

        // Rysowanie beat grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;

        const timePerBeat = 60 / defaultBpm; // Użyj defaultBpm zamiast bpm
        const totalBeats = duration / timePerBeat;

        for (let i = 0; i <= totalBeats; i++) {
          const beatTime = i * timePerBeat;
          const xBeat = beatTime * pixelsPerSecond * scaleFactor - shift;

          if (xBeat >= 0 && xBeat <= width) {
            ctx.beginPath();
            ctx.moveTo(xBeat, 0);
            ctx.lineTo(xBeat, height);
            ctx.stroke();
          }
        }

        // Rysowanie głowicy odtwarzania (linia środkowa)
        ctx.fillStyle = playheadColor;
        ctx.fillRect(centerX - 1, 0, 2, height);

        // Rysowanie wskaźnika punktu CUE
        if (cuePoint >= 0 && cuePoint <= duration) {
          const xCue = cuePoint * pixelsPerSecond * scaleFactor - shift;

          if (xCue >= 0 && xCue <= width) {
            ctx.fillStyle = cueColor;
            ctx.fillRect(xCue - 1, 0, 2, height);
          }
        }
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
    cuePoint,
    loopStart,
    loopEnd,
    isLooping,
    waveformColor,
    playheadColor,
    loopColor,
    loopLineColor,
    loopLineWidth,
    barWidth,
    barSpacing,
    deckNumber,
    bpm,
    defaultBpm,
    pixelsPerSecond,
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

    // Sprawdź, czy utwór był odtwarzany
    wasPlayingRef.current = deck.isPlaying;

    if (deck.isPlaying) {
      stopPlayback(deckNumber);
    }
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
  
      // Update current time and ensure it's applied before playback resumes
      updateCurrentTime(deckNumber, lastSeekTimeRef.current, false);
  
      // If the track was playing before, resume playback after currentTime is updated
      if (wasPlayingRef.current) {
        // Use a timeout to ensure currentTime is updated before starting playback
        setTimeout(() => {
          startPlayback(deckNumber);
        }, 0);
      }
    }
  };
  

  const handleSeek = (event) => {
    if (!waveformData || !duration) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const width = canvas.clientWidth;
    const centerX = width / 2;

    const shift = currentTime * pixelsPerSecond * scaleFactor - centerX;

    const newTime = (x + shift) / (pixelsPerSecond * scaleFactor);

    const clampedTime = Math.max(0, Math.min(duration, newTime));

    lastSeekTimeRef.current = clampedTime;
    updateCurrentTime(deckNumber, clampedTime, false);
  };

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

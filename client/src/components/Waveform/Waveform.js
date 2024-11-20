//Waveform.js
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Waveform.module.scss';
import debounce from 'lodash.debounce'; // Opcjonalnie, do debouncingu

function Waveform({
  deckNumber,
  waveformColor = '#FF5722', // Zaktualizowane kolory
  playheadColor = '#FFFFFF',
  loopColor = 'rgba(180, 180, 180, 0.4)',
  cueColor = '#DC143C',
  loopLineColor = '#1E90FF',
  loopLineWidth = 3,
}) {
  const { decks, updateCurrentTime, startPlayback, stopPlayback } = useAudio();
  const canvasRef = useRef(null);
  const isSeeking = useRef(false);
  const animationFrameRef = useRef(null);
  const wasPlayingRef = useRef(false);
  const lastSeekTimeRef = useRef(0);

  // Stała liczba barów na sekundę
  const BARS_PER_SECOND = 100;

  // Stan do przechowywania szerokości canvasu
  const [canvasWidth, setCanvasWidth] = useState(0);

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

  const pixelsPerSecond = 150; // Stała prędkość przesuwania waveforma
  const scaleFactor = defaultBpm / bpm; // Współczynnik skalowania

  // Aktualizuj szerokość canvasu przy renderowaniu
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasWidth(canvas.clientWidth);
    }
  }, [deckNumber, duration]);

  // Obsługa zmiany rozmiaru okna z debouncingiem
  useEffect(() => {
    const handleResize = debounce(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        setCanvasWidth(canvas.clientWidth);
      }
    }, 200); // 200ms opóźnienia

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel(); // Usuń debouncing
    };
  }, []);

  // Obliczanie dynamicznej gęstości barów na podstawie długości utworu
  const desiredBarDensity = useMemo(() => {
    if (!duration) return 1000; // Domyślna wartość, jeśli długość utworu nie jest znana
    return Math.floor(duration * BARS_PER_SECOND);
  }, [duration]);

  // Normalize peaks so the maximum value is 1
  const normalizedPeaks = useMemo(() => {
    if (!waveformData || waveformData.length === 0) return [];
    const maxPeak = Math.max(...waveformData);
    if (maxPeak === 0) return waveformData;
    return waveformData.map((peak) => peak / maxPeak);
  }, [waveformData]);

  // Dynamicznie próbkuj peaks do desiredBarDensity używając średniej
  const sampledPeaks = useMemo(() => {
    if (!normalizedPeaks || normalizedPeaks.length === 0) return [];

    const totalBars = desiredBarDensity;
    const sampleSize = Math.floor(normalizedPeaks.length / totalBars);
    if (sampleSize < 1) return normalizedPeaks; // Jeśli mniej peaków niż desiredBarDensity

    const result = [];
    for (let i = 0; i < normalizedPeaks.length; i += sampleSize) {
      const segment = normalizedPeaks.slice(i, i + sampleSize);
      const averagePeak = segment.reduce((sum, peak) => sum + peak, 0) / segment.length;
      result.push(averagePeak);
    }
    return result;
  }, [normalizedPeaks, desiredBarDensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    adjustCanvasForDPR(canvas);

    const drawWaveform = () => {
      try {
        if (!sampledPeaks || sampledPeaks.length === 0 || !duration) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const peaks = sampledPeaks;

        // Ustawienie barWidth i barSpacing
        const barWidth = 2; // Możesz dostosować szerokość bary
        const barSpacing = 1; // Możesz dostosować odstęp między bary

        const centerX = width / 2;

        // Obliczanie shift
        const currentTimeToUse = isSeeking.current ? lastSeekTimeRef.current : currentTime;
        const shift = currentTimeToUse * pixelsPerSecond * scaleFactor - centerX;

        const timePerBar = duration / peaks.length;

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
          const time = i * timePerBar;
          const x = time * pixelsPerSecond * scaleFactor - shift;

          const y = ((1 - peak) * height) / 2;
          const barHeight = peak * height;

          // Rysuj tylko widoczne słupki
          if (x + barWidth >= 0 && x <= width) {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }

        // Rysowanie beat grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
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
        ctx.fillRect(centerX - 1, 0, 3, height);

        // Rysowanie wskaźnika punktu CUE
        if (cuePoint >= 0 && cuePoint <= duration) {
          const xCue = cuePoint * pixelsPerSecond * scaleFactor - shift;

          if (xCue >= 0 && xCue <= width) {
            ctx.fillStyle = cueColor;
            ctx.fillRect(xCue - 1, 0, 4, height);
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
    sampledPeaks,
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
    deckNumber,
    bpm,
    defaultBpm,
    pixelsPerSecond,
    cueColor,
    scaleFactor,
  ]);

  // Obsługa responsywności
  // (Debounced handleResize już jest zaimplementowany powyżej)

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

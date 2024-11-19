// Waveform.js
import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Waveform.module.scss';
import debounce from 'lodash.debounce';

function Waveform({
  deckNumber,
  waveformColor = '#FF5722',
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

  // Szerokość jednego beatu w pikselach
  const BEAT_WIDTH = 60; // Możesz dostosować tę wartość

  // Extract necessary data from the deck
  const deck = decks[deckNumber];
  const waveformData = deck?.waveformData;
  const duration = deck?.duration || 0;
  const currentTime = deck?.currentTime || 0;
  const cuePoint = deck?.cuePoint || 0;
  const bpm = deck?.bpm || 120;
  const defaultBpm = deck?.defaultBpm || 120;
  const loopStart = deck?.loopStart;
  const loopEnd = deck?.loopEnd;
  const isLooping = deck?.isLooping;

  const scaleFactor = defaultBpm / bpm; // Współczynnik skalowania

  // Aktualizuj szerokość canvasu przy renderowaniu
  const [canvasWidth, setCanvasWidth] = useState(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      setCanvasWidth(canvas.clientWidth);
    }
  }, [deckNumber]);

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

  // Obliczanie liczby beatów w utworze
  const totalBeats = useMemo(() => {
    if (!duration || !bpm) return 0;
    return duration / (60 / bpm);
  }, [duration, bpm]);

  // Normalize peaks so the maximum value is 1
  const normalizedPeaks = useMemo(() => {
    if (!waveformData || waveformData.length === 0) return [];
    const maxPeak = Math.max(...waveformData);
    if (maxPeak === 0) return waveformData;
    return waveformData.map((peak) => peak / maxPeak);
  }, [waveformData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    adjustCanvasForDPR(canvas);

    const drawWaveform = () => {
      try {
        if (!normalizedPeaks || normalizedPeaks.length === 0 || !duration) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const peaks = normalizedPeaks;

        // Ustawienie barWidth i barSpacing
        const barWidth = 2; // Możesz dostosować szerokość słupków
        const barSpacing = 1; // Możesz dostosować odstęp między słupkami

        const totalBars = peaks.length;
        const timePerBar = duration / totalBars;

        // Obliczanie całkowitej szerokości waveforma
        const totalWaveformWidth = totalBeats * BEAT_WIDTH;

        const centerX = width / 2;

        // Obliczanie shift
        const currentTimeToUse = isSeeking.current ? lastSeekTimeRef.current : currentTime;
        const xOffset = (currentTimeToUse / duration) * totalWaveformWidth - centerX;

        // Rysowanie zakresu pętli (jeśli aktywna)
        if (isLooping && loopStart !== null && loopEnd !== null) {
          const xLoopStart = (loopStart / duration) * totalWaveformWidth - xOffset;
          const xLoopEnd = (loopEnd / duration) * totalWaveformWidth - xOffset;

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
          const x = (time / duration) * totalWaveformWidth - xOffset;

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

        const secondsPerBeat = 60 / defaultBpm; // Użyj defaultBpm zamiast bpm
        const totalBeatsToDraw = Math.ceil(duration / secondsPerBeat);

        for (let i = 0; i <= totalBeatsToDraw; i++) {
          const beatTime = i * secondsPerBeat;
          const xBeat = (beatTime / duration) * totalWaveformWidth - xOffset;

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
          const xCue = (cuePoint / duration) * totalWaveformWidth - xOffset;

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
    deckNumber,
    bpm,
    defaultBpm,
    cueColor,
    scaleFactor,
    BEAT_WIDTH,
    totalBeats,
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

    const totalWaveformWidth = totalBeats * BEAT_WIDTH;
    const xOffset = (currentTime / duration) * totalWaveformWidth - centerX;

    const newTime = ((x + xOffset) / totalWaveformWidth) * duration;

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

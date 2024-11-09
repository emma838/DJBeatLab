// Waveform.js
import React, { useEffect, useRef, useMemo } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Waveform.module.scss';

function Waveform({
  deckNumber,
  waveformColor = '#007bff',
  playheadColor = '#007bff',
  barWidth = 3,
  barSpacing = 1,
}) {
  const { decks, updateCurrentTime } = useAudio();
  const canvasRef = useRef(null);
  const isSeeking = useRef(false);
  const animationFrameRef = useRef(null);

  // Extract necessary data from the deck
  const deck = decks[deckNumber];
  const waveformData = deck?.waveformData;
  const duration = deck?.duration;
  const currentTime = deck?.currentTime;
  const cuePoint = deck?.cuePoint || 0;

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

        // Calculate total width of the waveform including spacing
        const totalBars = peaks.length;
        const totalWidth = totalBars * (barWidth + barSpacing);

        const centerX = width / 2;
        const timeRatio = currentTime / duration;
        const shift = timeRatio * totalWidth - centerX;

        // Set color for the waveform
        ctx.fillStyle = waveformColor;

        for (let i = 0; i < peaks.length; i++) {
          const peak = peaks[i];
          const x = i * (barWidth + barSpacing) - shift;

          const y = ((1 - peak) * height) / 2;
          const barHeight = peak * height;

          // Draw only visible bars
          if (x + barWidth >= 0 && x <= width) {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }

        // Draw the playhead (center line)
        ctx.fillStyle = playheadColor;
        ctx.fillRect(centerX - 1, 0, 2, height);

        // Draw CUE point indicator
        if (cuePoint >= 0 && cuePoint <= duration) {
          const cueTimeRatio = cuePoint / duration;
          const xCue = cueTimeRatio * totalWidth;
          const xCueOnCanvas = xCue - shift;

          if (xCueOnCanvas >= 0 && xCueOnCanvas <= width) {
            ctx.fillStyle = '#FF0000'; // Choose your CUE point color
            ctx.fillRect(xCueOnCanvas - 1, 0, 2, height);
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
    waveformColor,
    playheadColor,
    barWidth,
    barSpacing,
    deckNumber,
    decks,
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
    if (!waveformData || !duration) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;

    const width = canvas.clientWidth;
    const centerX = width / 2;

    const totalWidth = waveformData.length * (barWidth + barSpacing);
    const timePerPixel = duration / totalWidth;

    // Calculate time difference based on cursor movement relative to the center
    const timeOffset = (x - centerX) * timePerPixel;

    // New time is the current time plus the offset
    const newTime = currentTime + timeOffset;

    // Clamp time between 0 and the duration of the track
    const clampedTime = Math.max(0, Math.min(duration, newTime));

    updateCurrentTime(deckNumber, clampedTime);
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

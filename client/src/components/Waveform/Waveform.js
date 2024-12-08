// Waveform.js
// Komponent odpowiedzialny za renderowanie waveformu utworu, obsługę interakcji użytkownika (seek, beat grid), oraz integrację z kontrolerem MIDI.

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Waveform.module.scss';
import debounce from 'lodash.debounce'; // Do debouncingu obsługi resize
import { throttle } from 'lodash';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

function Waveform({
  deckNumber,
  waveformColor = '#FF5722', // Kolor waveformu
  playheadColor = '#FFFFFF',  // Kolor linii playhead
  loopColor = 'rgba(180, 180, 180, 0.4)', // Kolor obszaru pętli
  cueColor = '#DC143C', // Kolor wskaźnika CUE
  loopLineColor = '#1E90FF', // Kolor linii pętli
  loopLineWidth = 3, // Grubość linii pętli
}) {
  // Destrukturyzacja funkcji z hooka useAudio
  const { decks, updateCurrentTime, startPlayback, stopPlayback } = useAudio();
  
  // Referencje do elementów DOM i stanów
  const canvasRef = useRef(null); // Referencja do canvasu
  const isSeeking = useRef(false); // Czy użytkownik aktualnie przesuwa waveform
  const animationFrameRef = useRef(null); // Referencja do requestAnimationFrame
  const wasPlayingRef = useRef(false); // Czy deck był odtwarzany przed seekiem
  const lastSeekTimeRef = useRef(0); // Ostatni czas seeku

  // Throttling funkcji updateCurrentTime, aby nie wywoływać jej zbyt często
  const throttledUpdateCurrentTime = useMemo(() => {
    return throttle((deckNumber, time) => {
      updateCurrentTime(deckNumber, time, false); // Aktualizacja czasu bez wznowienia odtwarzania
    }, 50); // Throttling co 50ms
  }, [updateCurrentTime]);

  // Stała określająca liczbę barów na sekundę
  const BARS_PER_SECOND = 100;

  // Stan przechowujący szerokość canvasu
  const [canvasWidth, setCanvasWidth] = useState(0);

  // Ekstrakcja danych z decka
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

  // Stan do przechowywania przesunięcia beatgridu
  const [beatGridOffsetTime, setBeatGridOffsetTime] = useState(0); // W sekundach

  // Stałe definiujące prędkość przesuwania waveformu oraz skalowanie na podstawie BPM
  const pixelsPerSecond = 150; // Prędkość przesuwania waveformu w pikselach na sekundę
  const scaleFactor = defaultBpm / bpm; // Skalowanie na podstawie BPM

  // Aktualizacja szerokości canvasu przy renderowaniu
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

  // Normalizacja peaków, aby maksymalna wartość wynosiła 1
  const normalizedPeaks = useMemo(() => {
    if (!waveformData || waveformData.length === 0) return [];
    const maxPeak = Math.max(...waveformData);
    if (maxPeak === 0) return waveformData;
    return waveformData.map((peak) => peak / maxPeak);
  }, [waveformData]);

  // Dynamiczne próbkowanie peaków do desiredBarDensity używając średniej
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

  // Rysowanie waveformu na canvasie
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    adjustCanvasForDPR(canvas); // Dopasowanie canvasu do Device Pixel Ratio

    const drawWaveform = () => {
      try {
        if (!sampledPeaks || sampledPeaks.length === 0 || !duration) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const peaks = sampledPeaks;

        // Ustawienie szerokości bary i odstępu między nimi
        const barWidth = 2; // Szerokość bary
        const barSpacing = 1; // Odstęp między bary

        const centerX = width / 2;

        // Obliczanie przesunięcia na podstawie aktualnego czasu odtwarzania
        const currentTimeToUse = isSeeking.current ? lastSeekTimeRef.current : currentTime;
        const shift = currentTimeToUse * pixelsPerSecond * scaleFactor - centerX;

        const timePerBar = duration / peaks.length;

        // Rysowanie zakresu pętli, jeśli aktywna
        if (isLooping && loopStart !== null && loopEnd !== null) {
          const xLoopStart = loopStart * pixelsPerSecond * scaleFactor - shift;
          const xLoopEnd = loopEnd * pixelsPerSecond * scaleFactor - shift;

          const xStart = Math.max(0, xLoopStart);
          const xEnd = Math.min(width, xLoopEnd);

          if (xStart < width && xEnd > 0 && xEnd > xStart) {
            // Rysowanie obszaru pętli
            ctx.fillStyle = loopColor;
            ctx.fillRect(xStart, 0, xEnd - xStart, height);

            // Rysowanie linii pętli
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

        // Ustawienie koloru waveformu
        ctx.fillStyle = waveformColor;

        // Rysowanie bary waveformu
        for (let i = 0; i < peaks.length; i++) {
          const peak = peaks[i];
          const time = i * timePerBar;
          const x = time * pixelsPerSecond * scaleFactor - shift;

          const y = ((1 - peak) * height) / 2;
          const barHeight = peak * height;

          // Rysuj tylko widoczne bary
          if (x + barWidth >= 0 && x <= width) {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }

        // Rysowanie beat gridu
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;

        const timePerBeat = 60 / defaultBpm; // Czas na jeden beat
        const totalBeats = duration / timePerBeat;

        for (let i = 0; i <= totalBeats; i++) {
          const beatTime = i * timePerBeat;
          const xBeat = (beatTime + beatGridOffsetTime) * pixelsPerSecond * scaleFactor - shift;

          if (xBeat >= 0 && xBeat <= width) {
            ctx.beginPath();
            ctx.moveTo(xBeat, 0);
            ctx.lineTo(xBeat, height);
            ctx.stroke();
          }
        }

        // Rysowanie linii playhead (środkowej)
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

    // Rozpoczęcie animacji
    animationFrameRef.current = requestAnimationFrame(animate);

    // Czyszczenie animacji przy odmontowaniu komponentu
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
    beatGridOffsetTime, // Dodanie beatGridOffsetTime do zależności
  ]);

  // Funkcja dostosowująca canvas do Device Pixel Ratio
  const adjustCanvasForDPR = (canvas) => {
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  };

  // Obsługa zdarzeń myszy do seekowania na waveformie
  const handleMouseDown = (event) => {
    event.preventDefault();
    isSeeking.current = true;

    // Sprawdzenie, czy deck był odtwarzany przed seekiem
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

      // Aktualizacja currentTime i wznowienie odtwarzania, jeśli było odtwarzane
      throttledUpdateCurrentTime(deckNumber, lastSeekTimeRef.current, false);

      if (wasPlayingRef.current) {
        // Wznowienie odtwarzania po aktualizacji currentTime
        setTimeout(() => {
          startPlayback(deckNumber);
        }, 0);
      }
    }
  };

  // Funkcja obliczająca nowy czas odtwarzania na podstawie pozycji kliknięcia
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
    throttledUpdateCurrentTime(deckNumber, clampedTime, false);
  };

  return (
    <div className={styles.waveformWrapper} style={{ position: 'relative' }}>
      {/* Przyciski do modyfikacji beatgridu */}
      <div
        style={{
          position: 'absolute',
          top: '10px', // Odstęp od góry
          left: '10px', // Odstęp od lewej
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Tło dla lepszej widoczności
          padding: '5px',
          borderRadius: '5px',
        }}
      >
        <div className={styles.gridAdjust}>
          {/* Przycisk przesunięcia beatgridu w lewo */}
          <button
            className={styles.gridButton}
            onClick={() => setBeatGridOffsetTime((prev) => prev - 0.01)} // Przesuń w lewo o 0.01 sekundy
          >
            <ChevronLeft />
          </button>
          <span>GRID</span>
          {/* Przycisk przesunięcia beatgridu w prawo */}
          <button
            onClick={() => setBeatGridOffsetTime((prev) => prev + 0.01)} // Przesuń w prawo o 0.01 sekundy
            className={styles.gridButton}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Canvas do renderowania waveformu */}
      <canvas
        ref={canvasRef}
        className={styles.waveform}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp} // Zatrzymaj seekowanie, gdy kursor opuści canvas
      />
    </div>
  );
}

export default Waveform;

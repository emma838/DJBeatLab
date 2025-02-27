// AudioManager.js
// Komponent odpowiadający za zarządzanie odtwarzaniem audio, efektami, pętlami, cue pointami oraz integracją z kontrolerem MIDI.

import React, { createContext, useContext, useRef, useReducer, useEffect } from 'react';

// Tworzenie kontekstu audio
export const AudioContext = createContext();

// Hook do korzystania z kontekstu audio
export function useAudio() {
  return useContext(AudioContext);
}

// Początkowy stan decków - każdy deck ma własny stan związany z odtwarzaniem, efektami, pętlą itp.
const initialDeckState = {
  1: {
    track: null,
    audioBuffer: null,
    waveformData: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    source: null,
    playbackStartTime: 0,
    startOffset: 0,
    cuePoint: 0,
    isCuePlaying: false,
    bpm: 120,
    defaultBpm: 120,
    wasPlaying: false,
    loopStart: null,
    loopEnd: null,
    isLooping: false,
    convolver: null,
    dryGain: null,
    wetGain: null,
    lowShelf: null,
    midPeak: null,
    highShelf: null,
    delayGain: null,
    delayNode: null,
    flangerDelay: null,
    flangerWetGain: null,
    flangerFeedbackGain: null,
    flangerLFO: null,
    flangerLFOGain: null,
    volumeGain: null,
    activePredefinedLoop: null,
    masterOutput: null,
    cueOutput: null,
  },
  2: {
    track: null,
    audioBuffer: null,
    waveformData: null,
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    source: null,
    playbackStartTime: 0,
    startOffset: 0,
    cuePoint: 0,
    isCuePlaying: false,
    bpm: 120,
    defaultBpm: 120,
    wasPlaying: false,
    loopStart: null,
    loopEnd: null,
    isLooping: false,
    convolver: null,
    dryGain: null,
    wetGain: null,
    lowShelf: null,
    midPeak: null,
    highShelf: null,
    delayGain: null,
    delayNode: null,
    flangerDelay: null,
    flangerWetGain: null,
    flangerFeedbackGain: null,
    flangerLFO: null,
    flangerLFOGain: null,
    volumeGain: null,
    activePredefinedLoop: null,
    masterOutput: null,
    cueOutput: null,
  },
};

// Reducer do zarządzania stanem decków
function decksReducer(state, action) {
  switch (action.type) {
    case 'SET_DECK':
      return {
        ...state,
        [action.deckNumber]: {
          ...state[action.deckNumber],
          ...action.payload,
        },
      };
    case 'SET_LOOP_START':
      return {
        ...state,
        [action.deckNumber]: {
          ...state[action.deckNumber],
          loopStart: action.payload,
        },
      };
    case 'SET_LOOP_END':
      return {
        ...state,
        [action.deckNumber]: {
          ...state[action.deckNumber],
          loopEnd: action.payload,
          isLooping: true,
        },
      };
    case 'SET_LOOP':
      return {
        ...state,
        [action.deckNumber]: {
          ...state[action.deckNumber],
          loopStart: action.payload.loopStart,
          loopEnd: action.payload.loopEnd,
          isLooping: true,
        },
      };
    case 'EXIT_LOOP':
      return {
        ...state,
        [action.deckNumber]: {
          ...state[action.deckNumber],
          loopStart: null,
          loopEnd: null,
          isLooping: false,
        },
      };
    default:
      return state;
  }
}

// Provider zarządzający audio - dostarcza kontekst do całej aplikacji
export function AudioProvider({ children }) {
  const [decks, dispatch] = useReducer(decksReducer, initialDeckState);

  // Referencja do najnowszego stanu decków
  const decksRef = useRef(decks);

  // AudioContext dla każdego decka
  const audioContexts = {
    1: useRef(null),
    2: useRef(null),
  };

  // currentTimeRef przechowuje bieżący czas odtwarzania
  const currentTimeRef = useRef({
    1: 0,
    2: 0,
  });

  // References do ID animacji (requestAnimationFrame)
  const animationFrameIds = useRef({});

  // References do obsługi przycisku CUE
  const isHold = useRef({});
  const holdTimer = useRef({});
  const isMouseDown = useRef({});

  // Inicjalizacja AudioContext
  useEffect(() => {
    if (!audioContexts[1].current) {
      audioContexts[1].current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!audioContexts[2].current) {
      audioContexts[2].current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Funkcja do ładowania pliku impulse response do efektu reverb
  const loadImpulseResponse = async (audioCtx) => {
    try {
      const response = await fetch('/LargeRoom.wav');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const irBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const convolver = audioCtx.createConvolver();
      convolver.buffer = irBuffer;
      console.log('Impulse response successfully loaded and convolver created.');
      return convolver;
    } catch (error) {
      console.error('Error loading impulse response:', error);
      return null;
    }
  };

  // Inicjalizacja GainNode dla głośności każdego decka
  useEffect(() => {
    Object.keys(audioContexts).forEach((deckNumber) => {
      if (!audioContexts[deckNumber].current) {
        audioContexts[deckNumber].current = new (window.AudioContext || window.webkitAudioContext)();
      }

      const volumeGain = audioContexts[deckNumber].current.createGain();
      volumeGain.gain.value = 1; // Domyślna głośność

      const crossfadeGain = audioContexts[deckNumber].current.createGain();
      crossfadeGain.gain.value = 1; // Domyślnie bez zmian

      // crossfadeGain łączy się z volumeGain (finalne wyjście)
      crossfadeGain.connect(volumeGain);

      dispatch({
        type: 'SET_DECK',
        deckNumber: parseInt(deckNumber, 10),
        payload: { volumeGain, crossfadeGain },
      });
    });
  }, []);

  // Funkcja do ustawiania głośności decka
  const setVolume = (deckNumber, volume) => {
    let deck = decksRef.current[deckNumber];
    const audioCtx = audioContexts[deckNumber]?.current;

    if (!deck) {
      console.warn(`Deck ${deckNumber} not initialized.`);
      return;
    }

    if (!deck.volumeGain) {
      if (!audioCtx) {
        console.error(`AudioContext for deck ${deckNumber} not found.`);
        return;
      }

      console.log(`Initializing volume gain node for deck ${deckNumber}`);
      const gainNode = audioCtx.createGain();
      gainNode.gain.value = volume; 
      gainNode.connect(audioCtx.destination);

      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { volumeGain: gainNode },
      });

      deck = { ...deck, volumeGain: gainNode };
    }

    deck.volumeGain.gain.value = volume;
    console.log(`Volume for deck ${deckNumber} set to ${volume}`);
  };

  // Funkcja do ładowania utworu i przygotowywania toru audio dla decka
  const loadTrackData = async (deckNumber, track) => {
    console.log(`Loading track on deck ${deckNumber}:`, track);
    try {
      const audioCtx = audioContexts[deckNumber].current;

      // Pobieranie pliku audio z API
      const response = await fetch(track.url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const deck = decksRef.current[deckNumber];
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

      // AnalyserNode do analizy poziomu sygnału
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      deck.volumeGain.connect(analyser);
      analyser.connect(audioCtx.destination);

      // Ładowanie reverb (impulse response)
      const convolver = await loadImpulseResponse(audioCtx);
      const dryGain = audioCtx.createGain();
      dryGain.gain.value = 0.6;
      const wetGain = audioCtx.createGain();
      wetGain.gain.value = 0;

      // EQ nodes
      const highShelf = audioCtx.createBiquadFilter();
      highShelf.type = 'highshelf';
      highShelf.frequency.value = 5000;
      highShelf.gain.value = 0;

      const midPeak = audioCtx.createBiquadFilter();
      midPeak.type = 'peaking';
      midPeak.frequency.value = 1000;
      midPeak.gain.value = 0;

      const lowShelf = audioCtx.createBiquadFilter();
      lowShelf.type = 'lowshelf';
      lowShelf.frequency.value = 300;
      lowShelf.gain.value = 0;

      // Delay
      const delayNode = audioCtx.createDelay();
      delayNode.delayTime.value = 0;
      const delayGain = audioCtx.createGain();
      delayGain.gain.value = 0;

      // Filter dla efektów
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.value = 1000;

      // Flanger
      const flangerDelay = audioCtx.createDelay();
      flangerDelay.delayTime.value = 0.003;
      const flangerWetGain = audioCtx.createGain();
      flangerWetGain.gain.value = 0;
      const flangerFeedbackGain = audioCtx.createGain();
      flangerFeedbackGain.gain.value = 0;
      const flangerLFO = audioCtx.createOscillator();
      const flangerLFOGain = audioCtx.createGain();
      flangerLFOGain.gain.value = 0.002;
      flangerLFO.type = 'sine';
      flangerLFO.frequency.value = 0.25;
      flangerLFO.connect(flangerLFOGain).connect(flangerDelay.delayTime);
      flangerLFO.start();

      // Połączenia źródła i efektów
      source.connect(lowShelf);
      lowShelf.connect(midPeak);
      midPeak.connect(highShelf);
      highShelf.connect(filter);

      filter.connect(dryGain);
      filter.connect(flangerDelay);
      filter.connect(convolver);
      filter.connect(delayNode);

      flangerDelay.connect(flangerFeedbackGain);
      flangerFeedbackGain.connect(flangerDelay);
      flangerDelay.connect(flangerWetGain);

      const effectsMixGain = audioCtx.createGain();
      flangerWetGain.connect(effectsMixGain);

      if (convolver) {
        convolver.connect(wetGain);
        wetGain.connect(effectsMixGain);
      }

      delayNode.connect(delayGain);
      delayGain.connect(effectsMixGain);
      dryGain.connect(effectsMixGain);

      effectsMixGain.connect(deck.crossfadeGain);
      deck.crossfadeGain.connect(deck.volumeGain);
      deck.volumeGain.connect(analyser);
      deck.volumeGain.connect(audioCtx.destination);

      // Ekstrakcja danych waveform
      const rawData = audioBuffer.getChannelData(0);
      const bpm = track.bpm || 120;
      const totalBeats = audioBuffer.duration / (60 / bpm);
      const SAMPLES_PER_BEAT = 20;
      const samples = Math.floor(totalBeats * SAMPLES_PER_BEAT);
      const waveformData = extractPeaks(rawData, samples);

      // Aktualizacja stanu decka po załadowaniu
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          track,
          audioBuffer,
          waveformData,
          duration: audioBuffer.duration,
          currentTime: 0,
          isPlaying: false,
          playbackStartTime: 0,
          startOffset: 0,
          cuePoint: 0,
          isCuePlaying: false,
          defaultBpm: track.bpm || 120,
          bpm: track.bpm || 120,
          wasPlaying: false,
          loopStart: null,
          loopEnd: null,
          isLooping: false,
          convolver,
          dryGain,
          wetGain,
          lowShelf,
          midPeak,
          highShelf,
          filter,
          filterValue: 0,
          delayNode,
          delayGain,
          flangerDelay,
          flangerWetGain,
          flangerFeedbackGain,
          flangerLFO,
          flangerLFOGain,
          volumeGain: deck.volumeGain,
          crossfadeGain: deck.crossfadeGain,
          analyser,
        },
      });

      console.log(`Track loaded on deck ${deckNumber}`);
    } catch (error) {
      console.error('Error loading track data:', error);
    }
  };

  // Funkcja do ekstrakcji peaków w celu generowania waveformów
  const extractPeaks = (data, samples) => {
    const blockSize = Math.floor(data.length / samples);
    const peaks = [];
    for (let i = 0; i < samples; i++) {
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(data[i * blockSize + j]);
      }
      peaks.push(sum / blockSize);
    }
    return peaks;
  };

  // Funkcja play/pause
  const playPause = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    console.log(`playPause called for deck ${deckNumber}, isPlaying: ${deck.isPlaying}`);

    if (!deck.audioBuffer) return;

    if (!deck.isPlaying) {
      startPlayback(deckNumber);
    } else {
      stopPlayback(deckNumber);
    }
  };

  // Rozpoczęcie odtwarzania
  const startPlayback = (deckNumber, startOffset = null) => {
    const deck = decksRef.current[deckNumber];
    const audioCtx = audioContexts[deckNumber].current;

    if (!deck.audioBuffer) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (startOffset === null) {
      startOffset = deck.currentTime || deck.cuePoint || 0;
    }

    if (startOffset >= deck.duration) {
      startOffset = 0;
    }

    console.log(`Starting playback from offset: ${startOffset.toFixed(2)} seconds`);

    if (deck.source) {
      deck.source.onended = null;
      deck.source.stop();
    }

    const source = audioCtx.createBufferSource();
    source.buffer = deck.audioBuffer;
    source.playbackRate.value = deck.bpm / deck.defaultBpm || 1;
    source.connect(deck.lowShelf).connect(deck.midPeak).connect(deck.highShelf);

    if (deck.isLooping && deck.loopStart !== null && deck.loopEnd !== null && deck.loopEnd > deck.loopStart) {
      source.loop = true;
      source.loopStart = deck.loopStart;
      source.loopEnd = deck.loopEnd;
      console.log(`Loop enabled: ${deck.loopStart.toFixed(2)}s to ${deck.loopEnd.toFixed(2)}s`);
    } else {
      source.loop = false;
    }

    source.start(0, startOffset);
    source.onended = () => {
      console.log(`Playback ended`);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          isPlaying: false,
          currentTime: deck.duration,
          source: null,
          isCuePlaying: false,
        },
      });
    };

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: {
        source,
        playbackStartTime: audioCtx.currentTime,
        startOffset,
        isPlaying: true,
      },
    });
  };

  // Restart odtwarzania (np. po zmianie pętli)
  const restartPlayback = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.isPlaying) {
      stopPlayback(deckNumber);
      startPlayback(deckNumber);
    }
  };

  // Zatrzymanie odtwarzania
  const stopPlayback = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    const audioCtx = audioContexts[deckNumber].current;

    console.log(`Stopping playback on deck ${deckNumber}`);

    if (deck.source) {
      deck.source.onended = null;
      deck.source.stop();

      let currentTime;
      if (deck.isLooping && deck.loopStart !== null && deck.loopEnd !== null) {
        const loopLength = deck.loopEnd - deck.loopStart;
        const elapsedTime = audioCtx.currentTime - deck.playbackStartTime;
        const playbackRate = deck.bpm / deck.defaultBpm || 1;
        currentTime = deck.loopStart + ((elapsedTime * playbackRate) % loopLength);
        console.log(`Calculated currentTime within loop: ${currentTime.toFixed(2)} seconds`);
      } else {
        currentTime = audioCtx.currentTime - deck.playbackStartTime + deck.startOffset;
        console.log(`Calculated currentTime without loop: ${currentTime.toFixed(2)} seconds`);
      }

      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          currentTime,
          isPlaying: false,
          source: null,
          isCuePlaying: false,
        },
      });
    }

    // Anulowanie animacji czasu
    if (animationFrameIds.current[deckNumber]) {
      cancelAnimationFrame(animationFrameIds.current[deckNumber]);
      delete animationFrameIds.current[deckNumber];
      console.log(`Animation frame canceled for deck ${deckNumber}`);
    }
  };

  // Aktualizacja czasu odtwarzania
  const updateTime = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.isPlaying) {
      return;
    }

    const audioCtx = audioContexts[deckNumber].current;
    const elapsedTime = audioCtx.currentTime - deck.playbackStartTime;
    const playbackRate = deck.bpm / deck.defaultBpm || 1;
    let currentTime;

    if (deck.isLooping && deck.loopStart !== null && deck.loopEnd !== null) {
      const loopLength = deck.loopEnd - deck.loopStart;
      if (loopLength <= 0) {
        dispatch({
          type: 'EXIT_LOOP',
          deckNumber,
        });
        return;
      }
      currentTime = deck.loopStart + ((elapsedTime * playbackRate) % loopLength);
    } else {
      currentTime = deck.startOffset + (elapsedTime * playbackRate);
    }

    if (currentTime >= deck.duration) {
      stopPlayback(deckNumber);
      return;
    }

    const now = Date.now();
    if (!deck.lastUpdateTime || now - deck.lastUpdateTime >= 20) {
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { currentTime, lastUpdateTime: now },
      });
    }

    animationFrameIds.current[deckNumber] = requestAnimationFrame(() => updateTime(deckNumber));
  };

  // Funkcja do zmiany aktualnej pozycji odtwarzania (seek)
  const updateCurrentTime = (deckNumber, time, resumePlayback = true) => {
    const deck = decksRef.current[deckNumber];
    const wasPlaying = deck.isPlaying;

    console.log(`Updating currentTime on deck ${deckNumber} to ${time}, wasPlaying: ${wasPlaying}`);

    if (wasPlaying) {
      stopPlayback(deckNumber);
    }

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: { currentTime: time },
    });

    if (wasPlaying && resumePlayback) {
      startPlayback(deckNumber, time);
    }
  };

  // Delikatne przesunięcie aktualnej pozycji odtwarzania
  const nudgePlayback = (deckNumber, timeDelta) => {
    const deck = decksRef.current[deckNumber];
    let newTime = deck.currentTime + timeDelta;

    newTime = Math.max(0, Math.min(deck.duration, newTime));
    console.log(`Nudging playback on deck ${deckNumber} by ${timeDelta} to new time ${newTime}`);
    updateCurrentTime(deckNumber, newTime);
  };

  // Ustawianie punktu CUE lub zatrzymanie odtwarzania i powrót do CUE
  const handleSetCuePoint = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.audioBuffer) return;

    if (!deck.isPlaying) {
      const currentPos = deck.currentTime;
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { cuePoint: currentPos },
      });
      console.log(`Cue point set at ${currentPos.toFixed(2)} seconds.`);
    } else {
      stopPlayback(deckNumber);
      setTimeout(() => {
        dispatch({
          type: 'SET_DECK',
          deckNumber,
          payload: { currentTime: deck.cuePoint },
        });
        console.log(`Playback stopped and returned to cue point at ${deck.cuePoint.toFixed(2)} seconds.`);
      }, 50);
    }
  };

  // Odtwarzanie od punktu CUE
  const playFromCue = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.audioBuffer) return;

    const cuePoint = deck.cuePoint || 0;
    if (cuePoint >= 0 && cuePoint <= deck.duration) {
      startPlayback(deckNumber, cuePoint);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          isPlaying: true,
          isCuePlaying: true,
        },
      });
      console.log(`Playing from cue point at ${cuePoint.toFixed(2)} seconds.`);
    } else {
      console.warn('Cue point is out of bounds.');
    }
  };

  // Zatrzymanie odtwarzania od punktu CUE i powrót do niego
  const stopFromCue = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.audioBuffer) return;

    if (deck.isCuePlaying) {
      stopPlayback(deckNumber);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          currentTime: deck.cuePoint,
          isCuePlaying: false,
        },
      });
      console.log(`Playback stopped and returned to cue point at ${deck.cuePoint.toFixed(2)} seconds.`);
    }
  };

  // Obsługa przycisku CUE (mouse down/up)
  const handleCueMouseDown = (deckNumber) => {
    isMouseDown.current[deckNumber] = true;
    isHold.current[deckNumber] = false;
    holdTimer.current[deckNumber] = setTimeout(() => {
      isHold.current[deckNumber] = true;
      playFromCue(deckNumber);
    }, 200);
  };

  const handleCueMouseUp = (deckNumber) => {
    if (!isMouseDown.current[deckNumber]) return;
    isMouseDown.current[deckNumber] = false;
    clearTimeout(holdTimer.current[deckNumber]);

    const deck = decksRef.current[deckNumber];

    if (isHold.current[deckNumber]) {
      stopPlayback(deckNumber);
      setTimeout(() => {
        dispatch({
          type: 'SET_DECK',
          deckNumber,
          payload: {
            currentTime: deck.cuePoint,
            isCuePlaying: false,
          },
        });
        console.log(`Playback stopped and returned to cue point at ${deck.cuePoint.toFixed(2)} seconds.`);
      }, 0);
    } else {
      handleSetCuePoint(deckNumber);
    }
  };

  // Obsługa jog wheel
  const startJogging = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.isPlaying) {
      console.log(`Jogging started on deck ${deckNumber}, pausing playback`);
      stopPlayback(deckNumber);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { wasPlaying: true },
      });
    } else {
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { wasPlaying: false },
      });
    }
  };

  const stopJogging = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.wasPlaying) {
      console.log(`Jogging ended on deck ${deckNumber}, resuming playback from ${deck.currentTime.toFixed(2)} seconds`);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { isPlaying: true, wasPlaying: false },
      });
      startPlayback(deckNumber);
      updateTime(deckNumber);
    }
  };

  // Aktualizacja BPM
  const updateBpm = (deckNumber, newBpm) => {
    const deck = decksRef.current[deckNumber];
    if (!deck) {
      console.error(`Deck ${deckNumber} is undefined.`);
      return;
    }

    if (!deck.defaultBpm) {
      console.error(`defaultBpm is undefined for deck ${deckNumber}.`);
      return;
    }

    const oldPlaybackRate = deck.bpm / deck.defaultBpm || 1;
    const newPlaybackRate = newBpm / deck.defaultBpm || 1;

    if (deck.isPlaying && deck.source) {
      const audioCtx = audioContexts[deckNumber].current;
      const elapsedTime = audioCtx.currentTime - deck.playbackStartTime;
      const currentTime = deck.startOffset + elapsedTime * oldPlaybackRate;

      deck.source.playbackRate.value = newPlaybackRate;
      const newStartOffset = currentTime;
      const newPlaybackStartTime = audioCtx.currentTime;

      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { bpm: newBpm, startOffset: newStartOffset, playbackStartTime: newPlaybackStartTime },
      });
    } else {
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { bpm: newBpm },
      });
    }
  };

  // Obsługa pętli (loop)
  const setLoopStart = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    const currentPoint = deck.currentTime;
    dispatch({
      type: 'SET_LOOP_START',
      deckNumber,
      payload: currentPoint,
    });
    console.log(`Loop start set at: ${currentPoint.toFixed(2)} seconds`);
  };

  const setLoopEnd = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    const currentPoint = deck.currentTime;
    dispatch({
      type: 'SET_LOOP_END',
      deckNumber,
      payload: currentPoint,
    });
    console.log(`Loop end set at: ${currentPoint.toFixed(2)} seconds`);
  };

  const exitLoop = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    const audioCtx = audioContexts[deckNumber].current;
    if (!deck.isLooping) return;

    console.log(`Exiting loop on deck ${deckNumber}`);
    const elapsedTime = audioCtx.currentTime - deck.playbackStartTime;
    const playbackRate = deck.bpm / deck.defaultBpm || 1;
    const currentTimeWithinLoop = deck.loopStart + ((elapsedTime * playbackRate) % (deck.loopEnd - deck.loopStart));

    dispatch({ type: 'EXIT_LOOP', deckNumber });
    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: {
        isLooping: false,
        loopStart: null,
        loopEnd: null,
        currentTime: currentTimeWithinLoop,
      },
    });

    stopPlayback(deckNumber);
    startPlayback(deckNumber, currentTimeWithinLoop);
  };

  const startLoop = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.loopStart !== null && deck.loopEnd !== null) {
      if (deck.loopEnd <= deck.loopStart) {
        console.warn(`Loop end (${deck.loopEnd.toFixed(2)}) must be greater than loop start (${deck.loopStart.toFixed(2)})`);
        dispatch({ type: 'EXIT_LOOP', deckNumber });
        return;
      }
      restartPlayback(deckNumber);
      console.log(`Loop started on deck ${deckNumber}`);
    }
  };

  const handlePredefinedLoop = (deckNumber, bits) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.audioBuffer) {
      console.warn(`No audio buffer loaded on deck ${deckNumber}.`);
      return;
    }

    if (deck.activePredefinedLoop === bits) {
      exitLoop(deckNumber);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          activePredefinedLoop: null,
        },
      });
      console.log(`Exited predefined loop of ${bits} bits on deck ${deckNumber}`);
      return;
    }

    if (deck.isLooping) {
      console.warn('Cannot set a new predefined loop while another loop is active.');
      return;
    }

    const bitDuration = 60 / deck.bpm;
    const loopLength = bits * bitDuration;
    const currentPoint = deck.currentTime;
    const newLoopEnd = currentPoint + loopLength;

    if (newLoopEnd > deck.duration) {
      console.warn('Predefined loop exceeds track duration.');
      return;
    }

    dispatch({
      type: 'SET_LOOP',
      deckNumber,
      payload: {
        loopStart: currentPoint,
        loopEnd: newLoopEnd,
      },
    });

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: {
        activePredefinedLoop: bits,
      },
    });

    console.log(`Predefined loop set to ${bits} bits on deck ${deckNumber}`);
  };

  // Obsługa efektów (reverb, EQ, delay, flanger)
  const updateReverbIntensity = (deckNumber, intensity) => {
    const deck = decksRef.current[deckNumber];
    if (deck.wetGain) {
      deck.wetGain.gain.value = intensity;
      console.log(`Reverb intensity updated on deck ${deckNumber}: ${intensity}`);
    } else {
      console.warn(`Wet gain node not found for deck ${deckNumber}`);
    }
  };

  const updateDryGain = (deckNumber, gain) => {
    const deck = decksRef.current[deckNumber];
    if (deck.dryGain) {
      deck.dryGain.gain.value = gain;
      console.log(`Dry gain updated on deck ${deckNumber}: ${gain}`);
    } else {
      console.warn(`Dry gain node not found for deck ${deckNumber}`);
    }
  };

  const updateEQ = (deckNumber, band, value) => {
    const deck = decksRef.current[deckNumber];
    if (!deck) return;

    let updatedBand = {};

    switch (band) {
      case 'hi':
        deck.highShelf.gain.value = value;
        updatedBand = { highShelf: deck.highShelf };
        break;
      case 'mid':
        deck.midPeak.gain.value = value;
        updatedBand = { midPeak: deck.midPeak };
        break;
      case 'low':
        deck.lowShelf.gain.value = value;
        updatedBand = { lowShelf: deck.lowShelf };
        break;
      case 'filter':
        if (value === 0) {
          deck.filter.type = 'allpass';
        } else if (value < 0) {
          deck.filter.type = 'highpass';
          deck.filter.frequency.value = 20 * Math.pow(10, ((-value) / 10) * 3);
        } else {
          deck.filter.type = 'lowpass';
          deck.filter.frequency.value = 20000 / Math.pow(10, (value / 10) * 3);
        }
        updatedBand = { filter: deck.filter, filterValue: value };
        break;
      default:
        console.warn(`Unknown EQ band: ${band}`);
    }

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: updatedBand,
    });
  };

  const updateDelayIntensity = (deckNumber, intensity) => {
    const deck = decksRef.current[deckNumber];
    if (deck.delayGain) {
      deck.delayGain.gain.value = intensity;
      console.log(`Delay intensity updated on deck ${deckNumber}: ${intensity}`);
    } else {
      console.warn(`Delay gain node not found for deck ${deckNumber}`);
    }
  };

  const updateDelayTime = (deckNumber, time) => {
    const deck = decksRef.current[deckNumber];
    if (deck.delayNode) {
      deck.delayNode.delayTime.value = time;
      console.log(`Delay time updated on deck ${deckNumber}: ${time}`);
    } else {
      console.warn(`Delay node not found for deck ${deckNumber}`);
    }
  };

  const updateFlangerStrength = (deckNumber, value) => {
    const deck = decksRef.current[deckNumber];
    if (deck.flangerWetGain && deck.flangerFeedbackGain) {
      const maxWetGain = 1;
      const maxFeedbackGain = 0.9;
      const normalizedValue = value / 1;

      if (value === 0) {
        deck.flangerWetGain.gain.value = 0;
        deck.flangerFeedbackGain.gain.value = 0;
      } else {
        deck.flangerWetGain.gain.value = normalizedValue * maxWetGain;
        deck.flangerFeedbackGain.gain.value = normalizedValue * maxFeedbackGain;
      }

      console.log(`Flanger strength updated on deck ${deckNumber}: ${value}`);
    } else {
      console.warn(`Flanger gain nodes not found for deck ${deckNumber}`);
    }
  };

  // Kontrola crossfadera
  const setCrossfade = (position) => {
    let crossfade1 = 1;
    let crossfade2 = 1;

    if (position < 0.5) {
      const factor = (0.5 - position) / 0.5;
      crossfade2 = Math.max(0, 1 - factor);
      crossfade1 = 1;
    } else if (position > 0.5) {
      const factor = (position - 0.5) / 0.5;
      crossfade1 = Math.max(0, 1 - factor);
      crossfade2 = 1;
    } else {
      crossfade1 = 1;
      crossfade2 = 1;
    }

    if (decksRef.current[1]?.crossfadeGain) {
      decksRef.current[1].crossfadeGain.gain.value = crossfade1;
    }
    if (decksRef.current[2]?.crossfadeGain) {
      decksRef.current[2].crossfadeGain.gain.value = crossfade2;
    }

    console.log(`Crossfader position: ${position}, Deck 1 Crossfade: ${crossfade1}, Deck 2 Crossfade: ${crossfade2}`);
  };

  // Synchronizacja decksRef z deckami
  useEffect(() => {
    decksRef.current = decks;
  }, [decks]);

  // Referencja do poprzedniego stanu decków
  const prevDecksRef = useRef(decks);

  // Monitorowanie zmian pętli w deckach
  useEffect(() => {
    Object.keys(decks).forEach((deckNumber) => {
      const prevDeck = prevDecksRef.current[deckNumber];
      const currentDeck = decks[deckNumber];

      const loopStarted = !prevDeck.isLooping && currentDeck.isLooping;
      const loopEnded = prevDeck.isLooping && !currentDeck.isLooping;

      if (loopStarted) {
        console.log(`Loop started on deck ${deckNumber}`);
      }
      if (loopEnded) {
        console.log(`Loop ended on deck ${deckNumber}`);
      }

      if (loopStarted || loopEnded) {
        if (currentDeck.isPlaying) {
          console.log(`Loop state changed on deck ${deckNumber}, restarting playback.`);
          restartPlayback(deckNumber);
        }
      }
    });

    prevDecksRef.current = decks;
  }, [decks]);

  // Uruchamianie updateTime, gdy isPlaying jest true
  useEffect(() => {
    Object.keys(decks).forEach((deckNumber) => {
      const deck = decks[deckNumber];
      const isAnimating = animationFrameIds.current[deckNumber] != null;

      if (deck.isPlaying && !isAnimating) {
        updateTime(deckNumber);
      } else if (!deck.isPlaying && isAnimating) {
        cancelAnimationFrame(animationFrameIds.current[deckNumber]);
        delete animationFrameIds.current[deckNumber];
      }
    });
  }, [decks]);

  const decksInitializedRef = useRef(false);

  // Inicjalizacja volumeGain po załadowaniu komponentu
  useEffect(() => {
    Object.keys(audioContexts).forEach((deckNumber) => {
      if (!audioContexts[deckNumber].current) {
        audioContexts[deckNumber].current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const volumeGain = audioContexts[deckNumber].current.createGain();
      volumeGain.gain.value = 1;

      dispatch({
        type: 'SET_DECK',
        deckNumber: parseInt(deckNumber, 10),
        payload: { volumeGain },
      });
    });

    decksInitializedRef.current = true;
  }, []);

  return (
    <AudioContext.Provider
      value={{
        decks,
        loadTrackData,
        playPause,
        startPlayback,
        stopPlayback,
        updateCurrentTime,
        nudgePlayback,
        handleCueMouseDown,
        handleCueMouseUp,
        startJogging,
        stopJogging,
        updateBpm,
        setLoopStart,
        setLoopEnd,
        exitLoop,
        handlePredefinedLoop,
        playFromCue,
        stopFromCue,
        updateReverbIntensity,
        updateDryGain,
        updateEQ,
        updateDelayIntensity,
        updateDelayTime,
        updateFlangerStrength,
        setVolume,
        setCrossfade,
        currentTimeRef,
        decksInitializedRef,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

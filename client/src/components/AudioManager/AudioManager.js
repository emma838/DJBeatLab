// AudioManager.js
import React, { createContext, useContext, useRef, useReducer, useEffect } from 'react';

// Tworzenie kontekstu audio
export const AudioContext = createContext();

// Hook do korzystania z kontekstu audio
export function useAudio() {
  return useContext(AudioContext);
}

// Początkowy stan decków
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
  },
};

// Reduktor do zarządzania stanem decków
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

// Provider do zarządzania audio
export function AudioProvider({ children }) {
  const [decks, dispatch] = useReducer(decksReducer, initialDeckState);

  // Reference do przechowywania najnowszego stanu decków
  const decksRef = useRef(decks);

  // Inicjalizacja AudioContexts dla każdego decka
  const audioContexts = {
    1: useRef(null),
    2: useRef(null),
  };

  // References do przechowywania ID animacji
  const animationFrameIds = useRef({});

  // References dla logiki przycisku CUE
  const isHold = useRef({});
  const holdTimer = useRef({});
  const isMouseDown = useRef({});

  // Inicjalizacja AudioContexts
  useEffect(() => {
    if (!audioContexts[1].current) {
      audioContexts[1].current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!audioContexts[2].current) {
      audioContexts[2].current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Funkcja do ładowania impulse response dla reverbu
  const loadImpulseResponse = async (audioCtx) => {
    try {
      const response = await fetch('/LargeRoom.wav'); // Upewnij się, że plik jest w folderze public
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

  // Funkcja do ładowania danych ścieżki audio
  const loadTrackData = async (deckNumber, track) => {
    console.log(`Loading track on deck ${deckNumber}:`, track);

    try {
      const audioCtx = audioContexts[deckNumber].current;

      const response = await fetch(track.url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Ładowanie impulse response dla efektu reverb
      const convolver = await loadImpulseResponse(audioCtx);
      const dryGain = audioCtx.createGain();
      dryGain.gain.value = 1; // Sygnał suchy
      const wetGain = audioCtx.createGain();
      wetGain.gain.value = 0.5; // Efekt reverb, początkowa wartość

      // Tworzenie źródła audio
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;

// Definiowanie węzłów EQ dla 'hi', 'mid', 'low' oraz filtra typu low-pass/hi-pass
const highShelf = audioCtx.createBiquadFilter();
highShelf.type = 'highshelf';
highShelf.frequency.value = 5000; // Można dostosować częstotliwość dla wysokich tonów
highShelf.gain.value = 0;

const midPeak = audioCtx.createBiquadFilter();
midPeak.type = 'peaking';
midPeak.frequency.value = 1000; // Można dostosować częstotliwość dla średnich tonów
midPeak.gain.value = 0;

const lowShelf = audioCtx.createBiquadFilter();
lowShelf.type = 'lowshelf';
lowShelf.frequency.value = 150; // Można dostosować częstotliwość dla niskich tonów
lowShelf.gain.value = 0;

const filter = audioCtx.createBiquadFilter();
filter.type = 'allpass'; // Początkowo neutralny filtr
filter.frequency.value = 1000; // Częstotliwość początkowa

// Łączenie źródła z filtrami
source.connect(lowShelf).connect(midPeak).connect(highShelf).connect(filter).connect(audioCtx.destination);

      // Połączenie EQ z dryGain i destination
      highShelf.connect(dryGain).connect(audioCtx.destination);

      // Połączenie EQ z convolver (reverb) i wetGain
      if (convolver) {
        highShelf.connect(convolver).connect(wetGain).connect(audioCtx.destination);
        console.log(`Convolver loaded and connected for deck ${deckNumber}`);
      } else {
        console.warn(`Convolver could not be loaded for deck ${deckNumber}`);
      }

      // Przetwarzanie danych waveforma
      const rawData = audioBuffer.getChannelData(0);
      const samples = 6000;
      const waveformData = extractPeaks(rawData, samples);

      // Aktualizacja stanu decka
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
        },
      });

      console.log(`Track loaded on deck ${deckNumber}`);
    } catch (error) {
      console.error('Error loading track data:', error);
    }
  };

  // Funkcja do ekstrakcji peaków z danych audio
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

    // dispatch({
    //   type: 'SET_DECK',
    //   deckNumber,
    //   payload: {
    //     isPlaying: !deck.isPlaying,
    //   },
    // });
  };

  // Funkcja do rozpoczęcia odtwarzania
 // Funkcja do rozpoczęcia odtwarzania
const startPlayback = (deckNumber) => {
  const deck = decksRef.current[deckNumber];
  const audioCtx = audioContexts[deckNumber].current;

  console.log(`Starting playback on deck ${deckNumber}`);

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  let startOffset = deck.currentTime;
  if (startOffset >= deck.duration) {
    startOffset = 0;
  }

  console.log(`Playback starting from offset: ${startOffset.toFixed(2)} seconds`);

  // Stop any existing source to prevent overlap
  if (deck.source) {
    deck.source.onended = null;
    deck.source.stop();
  }

  // Tworzenie nowego źródła audio
  const source = audioCtx.createBufferSource();
  source.buffer = deck.audioBuffer;
  source.playbackRate.value = deck.bpm / deck.defaultBpm || 1; // Ustawienie playbackRate

  // Połączenie źródła z EQ nodes
  source.connect(deck.lowShelf).connect(deck.midPeak).connect(deck.highShelf);

  // Ustawienie pętli, jeśli aktywna
  if (deck.isLooping && deck.loopStart !== null && deck.loopEnd !== null && deck.loopEnd > deck.loopStart) {
    source.loop = true;
    source.loopStart = deck.loopStart;
    source.loopEnd = deck.loopEnd;
    console.log(`Loop enabled on deck ${deckNumber}: ${deck.loopStart.toFixed(2)}s to ${deck.loopEnd.toFixed(2)}s`);
  } else {
    source.loop = false;
  }

  source.start(0, startOffset);

  source.onended = () => {
    console.log(`Playback ended on deck ${deckNumber}`);
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

  const playbackStartTime = audioCtx.currentTime;

  dispatch({
    type: 'SET_DECK',
    deckNumber,
    payload: {
      source,
      playbackStartTime,
      startOffset,
      isPlaying: true,
    },
  });

  // Uruchomienie aktualizacji czasu
  updateTime(deckNumber);
};


  // Funkcja do restartowania odtwarzania (używana przy zmianach pętli)
  const restartPlayback = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.isPlaying) {
      stopPlayback(deckNumber);
      startPlayback(deckNumber);
    }
  };

  // Funkcja do zatrzymania odtwarzania
  // Funkcja do zatrzymania odtwarzania
const stopPlayback = (deckNumber) => {
  const deck = decksRef.current[deckNumber];
  const audioCtx = audioContexts[deckNumber].current;

  console.log(`Stopping playback on deck ${deckNumber}`);

  if (deck.source) {
    deck.source.onended = null; // Zapobieganie wywoływaniu onended
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

  // Anulowanie animacji
  if (animationFrameIds.current[deckNumber]) {
    cancelAnimationFrame(animationFrameIds.current[deckNumber]);
    delete animationFrameIds.current[deckNumber];
  }
};


  // Funkcja do aktualizacji czasu odtwarzania
  const updateTime = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.isPlaying) {
      console.log(`Deck ${deckNumber} is not playing. Exiting updateTime.`);
      return;
    }

    const audioCtx = audioContexts[deckNumber].current;
    const elapsedTime = audioCtx.currentTime - deck.playbackStartTime;
    const playbackRate = deck.bpm / deck.defaultBpm || 1;
    let currentTime;

    if (deck.isLooping && deck.loopStart !== null && deck.loopEnd !== null) {
      const loopLength = deck.loopEnd - deck.loopStart;
      if (loopLength <= 0) {
        console.warn(`Invalid loop length on deck ${deckNumber}. Exiting loop.`);
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

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: { currentTime },
    });

    animationFrameIds.current[deckNumber] = requestAnimationFrame(() => updateTime(deckNumber));
  };

  // Funkcja do aktualizacji bieżącego czasu (seek)
  const updateCurrentTime = (deckNumber, time) => {
    const deck = decksRef.current[deckNumber];
    const wasPlaying = deck.isPlaying;

    console.log(`Updating currentTime on deck ${deckNumber} to ${time}, wasPlaying: ${wasPlaying}`);

    if (wasPlaying) {
      console.log(`Stopping playback on deck ${deckNumber} before updating currentTime`);
      stopPlayback(deckNumber);
    }

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: { currentTime: time },
    });

    if (wasPlaying) {
      console.log(`Resuming playback and updateTime on deck ${deckNumber} after updating currentTime`);
      startPlayback(deckNumber);
    }
  };

  // Funkcja do delikatnego przesuwania odtwarzania
  const nudgePlayback = (deckNumber, timeDelta) => {
    const deck = decksRef.current[deckNumber];
    let newTime = deck.currentTime + timeDelta;

    // Ograniczenie nowego czasu między 0 a długością ścieżki
    newTime = Math.max(0, Math.min(deck.duration, newTime));

    console.log(`Nudging playback on deck ${deckNumber} by ${timeDelta} seconds to new time ${newTime}`);
    updateCurrentTime(deckNumber, newTime);
  };

  // Funkcja do ustawiania punktu CUE lub zatrzymywania odtwarzania
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
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { currentTime: deck.cuePoint },
      });
      console.log(`Playback stopped and returned to cue point at ${deck.cuePoint.toFixed(2)} seconds.`);
    }
  };

  // Funkcja do odtwarzania od punktu CUE
  const playFromCue = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.audioBuffer) return;
    const cuePoint = deck.cuePoint;

    if (cuePoint >= 0 && cuePoint <= deck.duration) {
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          currentTime: cuePoint,
          isPlaying: true,
          isCuePlaying: true,
        },
      });
      console.log(`Playing from cue point at ${cuePoint.toFixed(2)} seconds.`);
      startPlayback(deckNumber);
    } else {
      console.warn('Cue point is out of bounds.');
    }
  };

  // Funkcja do zatrzymania odtwarzania od punktu CUE
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

  // Funkcje do kontroli jog wheel
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
      if (deck.isLooping) {
        // Looping będzie obsługiwane przez useEffect
      } else {
        startPlayback(deckNumber);
      }
      updateTime(deckNumber);
    }
  };

  // Funkcje obsługujące przycisk CUE
  const handleCueMouseDown = (deckNumber) => {
    isMouseDown.current[deckNumber] = true; // Ustawienie stanu przycisku
    isHold.current[deckNumber] = false;
    holdTimer.current[deckNumber] = setTimeout(() => {
      isHold.current[deckNumber] = true;
      playFromCue(deckNumber);
    }, 200); // 200ms próg dla hold
  };

  const handleCueMouseUp = (deckNumber) => {
    if (!isMouseDown.current[deckNumber]) {
      // Jeśli przycisk nie był naciśnięty na tym decku, ignoruj
      return;
    }
    isMouseDown.current[deckNumber] = false; // Resetowanie stanu przycisku
    clearTimeout(holdTimer.current[deckNumber]);
    if (isHold.current[deckNumber]) {
      stopFromCue(deckNumber);
    } else {
      handleSetCuePoint(deckNumber);
    }
  };

  // Funkcja do aktualizacji BPM
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

      // Aktualizacja playbackRate na źródle audio
      deck.source.playbackRate.value = newPlaybackRate;

      // Aktualizacja startOffset i playbackStartTime dla ciągłości odtwarzania
      const newStartOffset = currentTime;
      const newPlaybackStartTime = audioCtx.currentTime;

      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { bpm: newBpm, startOffset: newStartOffset, playbackStartTime: newPlaybackStartTime },
      });
    } else {
      // Jeśli nie odtwarzane, po prostu aktualizuj BPM
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { bpm: newBpm },
      });
    }
  };

  // Funkcje do obsługi pętli (loops)
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
    dispatch({
      type: 'EXIT_LOOP',
      deckNumber,
    });
    console.log(`Exited loop on deck ${deckNumber}`);
    // Jeśli deck jest odtwarzany, wznowienie normalnego odtwarzania od loopEnd
    const deck = decksRef.current[deckNumber];
    if (deck.isPlaying) {
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { currentTime: deck.loopEnd },
      });
      startPlayback(deckNumber);
    }
  };

  // Funkcja do rozpoczęcia pętli
  const startLoop = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.loopStart !== null && deck.loopEnd !== null) {
      // Upewnienie się, że loopEnd jest większy niż loopStart
      if (deck.loopEnd <= deck.loopStart) {
        console.warn(`Loop end (${deck.loopEnd.toFixed(2)}) must be greater than loop start (${deck.loopStart.toFixed(2)})`);
        dispatch({
          type: 'EXIT_LOOP',
          deckNumber,
        });
        return;
      }

      // Restart playback to apply loop settings
      restartPlayback(deckNumber);

      console.log(`Loop started on deck ${deckNumber} from ${deck.loopStart.toFixed(2)}s to ${deck.loopEnd.toFixed(2)}s`);
    }
  };

  // Funkcja do obsługi predefined loop
  const handlePredefinedLoop = (deckNumber, bits) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.audioBuffer) {
      console.warn(`No audio buffer loaded on deck ${deckNumber}.`);
      return;
    }

    // Obliczenie długości jednego bitu na podstawie BPM
    const bitDuration = 60 / deck.bpm; // sekundy na bit
    const loopLength = bits * bitDuration;

    const currentPoint = deck.currentTime;
    const newLoopEnd = currentPoint + loopLength;

    if (newLoopEnd > deck.duration) {
      console.warn('Predefined loop exceeds track duration.');
      return;
    }

    // Ustawienie pętli w jednym akcji
    dispatch({
      type: 'SET_LOOP',
      deckNumber,
      payload: {
        loopStart: currentPoint,
        loopEnd: newLoopEnd,
      },
    });

    console.log(`Predefined loop set to ${bits} bits (${loopLength.toFixed(2)} seconds) on deck ${deckNumber}`);
  };

  // Funkcje do obsługi efektów
  const updateReverbIntensity = (deckNumber, intensity) => {
    const deck = decksRef.current[deckNumber];
    if (deck.wetGain) {
      deck.wetGain.gain.value = intensity;
      console.log(`Reverb intensity updated on deck ${deckNumber}:`, intensity);
    } else {
      console.warn(`Wet gain node not found for deck ${deckNumber}`);
    }
  };

  const updateDryGain = (deckNumber, gain) => {
    const deck = decksRef.current[deckNumber];
    if (deck.dryGain) {
      deck.dryGain.gain.value = gain;
      console.log(`Dry gain updated on deck ${deckNumber}:`, gain);
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
          deck.filter.type = 'lowpass';
          deck.filter.frequency.value = 1000 + value * -10;
        } else {
          deck.filter.type = 'highpass';
          deck.filter.frequency.value = 1000 + value * 10;
        }
        updatedBand = { filter: deck.filter };
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
  

  // Synchronizacja decksRef.current z najnowszym stanem decks
  useEffect(() => {
    decksRef.current = decks;
  }, [decks]);

  // Reference do przechowywania poprzedniego stanu decków dla porównania w useEffect
  const prevDecksRef = useRef(decks);

  // useEffect do monitorowania zmian pętli i restartowania odtwarzania
  useEffect(() => {
    Object.keys(decks).forEach((deckNumber) => {
      const prevDeck = prevDecksRef.current[deckNumber];
      const currentDeck = decks[deckNumber];

      const loopStarted = !prevDeck.isLooping && currentDeck.isLooping;
      const loopEnded = prevDeck.isLooping && !currentDeck.isLooping;

      if (loopStarted) {
        console.log(`Loop started on deck ${deckNumber}: ${currentDeck.loopStart.toFixed(2)}s to ${currentDeck.loopEnd.toFixed(2)}s`);
      }
      if (loopEnded) {
        console.log(`Loop ended on deck ${deckNumber}`);
      }

      if (loopStarted || loopEnded) {
        if (currentDeck.isPlaying) {
          console.log(`Loop state changed on deck ${deckNumber}. Restarting playback to apply loop settings.`);
          restartPlayback(deckNumber);
        }
      }
    });

    // Aktualizacja poprzedniego stanu
    prevDecksRef.current = decks;
  }, [decks]);

  // useEffect do uruchamiania updateTime, gdy isPlaying jest true
  useEffect(() => {
    Object.keys(decks).forEach((deckNumber) => {
      const deck = decks[deckNumber];
      if (deck.isPlaying && !animationFrameIds.current[deckNumber]) {
        updateTime(deckNumber);
      }
    });
  }, [decks]);

  return (
    <AudioContext.Provider
      value={{
        decks,
        loadTrackData,
        playPause,
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

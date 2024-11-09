// AudioManager.js
import React, { createContext, useContext, useRef, useReducer, useEffect } from 'react';

export const AudioContext = createContext();

export function useAudio() {
  return useContext(AudioContext);
}

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
  },
};

function decksReducer(state, action) {
  switch (action.type) {
    case 'SET_DECK':
      console.log(`Dispatching SET_DECK for deck ${action.deckNumber}:`, action.payload);
      return {
        ...state,
        [action.deckNumber]: {
          ...state[action.deckNumber],
          ...action.payload,
        },
      };
    default:
      return state;
  }
}

export function AudioProvider({ children }) {
  const [decks, dispatch] = useReducer(decksReducer, initialDeckState);

  // Referencja do przechowywania najnowszego stanu decks
  const decksRef = useRef(decks);

  // Inicjalizacja AudioContexts
  const audioContexts = {
    1: useRef(null),
    2: useRef(null),
  };

  // Referencje do przechowywania ID animacji
  const animationFrameIds = useRef({});

  useEffect(() => {
    if (!audioContexts[1].current) {
      audioContexts[1].current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!audioContexts[2].current) {
      audioContexts[2].current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const loadTrackData = async (deckNumber, track) => {
    console.log(`Loading track on deck ${deckNumber}:`, track);
    try {
      const response = await fetch(track.url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const arrayBuffer = await response.arrayBuffer();
      audioContexts[deckNumber].current.decodeAudioData(
        arrayBuffer,
        (audioBuffer) => {
          const rawData = audioBuffer.getChannelData(0);
          const samples = 6000; // Liczba próbek dla waveform
          const waveformData = extractPeaks(rawData, samples);

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
            },
          });

          console.log(`Track loaded on deck ${deckNumber}`);
        },
        (error) => {
          console.error('Error decoding audio data:', error);
        }
      );
    } catch (error) {
      console.error('Error loading track data:', error);
    }
  };

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

  const playPause = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    console.log(`playPause called for deck ${deckNumber}, isPlaying: ${deck.isPlaying}`);
    if (!deck.audioBuffer) return;

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: {
        isPlaying: !deck.isPlaying,
      },
    });
  };

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

    const source = audioCtx.createBufferSource();
    source.buffer = deck.audioBuffer;
    source.connect(audioCtx.destination);
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
      },
    });
  };

  const stopPlayback = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    const audioCtx = audioContexts[deckNumber].current;

    console.log(`Stopping playback on deck ${deckNumber}`);

    if (deck.source) {
      deck.source.onended = null; // Zapobiega wywołaniu onended
      deck.source.stop();

      const currentTime = (audioCtx.currentTime - deck.playbackStartTime) + deck.startOffset;

      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: {
          currentTime,
          isPlaying: false,
          source: null,
        },
      });
    }

    // Anulowanie animacji
    if (animationFrameIds.current[deckNumber]) {
      cancelAnimationFrame(animationFrameIds.current[deckNumber]);
      delete animationFrameIds.current[deckNumber];
    }
  };

  const updateTime = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (!deck.isPlaying) {
      console.log(`Deck ${deckNumber} is not playing. Exiting updateTime.`);
      return;
    }

    const audioCtx = audioContexts[deckNumber].current;
    const currentTime = (audioCtx.currentTime - deck.playbackStartTime) + deck.startOffset;

    console.log(`Updating currentTime for deck ${deckNumber}: ${currentTime}`);

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

  const updateCurrentTime = (deckNumber, time) => {
    const deck = decksRef.current[deckNumber];
    const wasPlaying = deck.isPlaying;

    console.log(`Updating currentTime on deck ${deckNumber} to ${time}`);

    if (wasPlaying) {
      stopPlayback(deckNumber);
    }

    dispatch({
      type: 'SET_DECK',
      deckNumber,
      payload: { currentTime: time },
    });

    if (wasPlaying) {
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { isPlaying: true },
      });
    }
  };

  // Połączone useEffect
  useEffect(() => {
    decksRef.current = decks;
    Object.keys(decks).forEach((deckNumber) => {
      const deck = decks[deckNumber];
      if (deck.isPlaying && !deck.source && deck.audioBuffer) {
        console.log(`Starting playback and updateTime for deck ${deckNumber}`);
        startPlayback(deckNumber);
        updateTime(deckNumber);
      }
      // Opcjonalnie: zatrzymaj odtwarzanie, jeśli isPlaying zmieniło się na false
      if (!deck.isPlaying && deck.source) {
        stopPlayback(deckNumber);
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
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

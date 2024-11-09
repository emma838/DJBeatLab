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
    cuePoint: 0,
    isCuePlaying: false,
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

  // Reference to store the latest state of decks
  const decksRef = useRef(decks);

  // Initialize AudioContexts
  const audioContexts = {
    1: useRef(null),
    2: useRef(null),
  };

  // References to store animation IDs
  const animationFrameIds = useRef({});

  // References for CUE button logic
  const isHold = useRef({});
  const holdTimer = useRef({});
  const isMouseDown = useRef({}); // Added reference

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
          const samples = 6000; // Number of samples for waveform
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
              cuePoint: 0,
              isCuePlaying: false,
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
      },
    });
  };

  const stopPlayback = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    const audioCtx = audioContexts[deckNumber].current;

    console.log(`Stopping playback on deck ${deckNumber}`);

    if (deck.source) {
      deck.source.onended = null; // Prevent onended from firing
      deck.source.stop();

      const currentTime = audioCtx.currentTime - deck.playbackStartTime + deck.startOffset;

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

    // Cancel animation
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
    const currentTime = audioCtx.currentTime - deck.playbackStartTime + deck.startOffset;

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

  // Set a new cue point or stop playback if playing
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

  // Play from the cue point
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
    } else {
      console.warn('Cue point is out of bounds.');
    }
  };

  // Stop playback and return to cue point
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

  // Handle mouse down on CUE button
  const handleCueMouseDown = (deckNumber) => {
    isMouseDown.current[deckNumber] = true; // Set mouse down state
    isHold.current[deckNumber] = false;
    holdTimer.current[deckNumber] = setTimeout(() => {
      isHold.current[deckNumber] = true;
      playFromCue(deckNumber);
    }, 200); // 200ms threshold for hold
  };

  // Handle mouse up on CUE button
  const handleCueMouseUp = (deckNumber) => {
    if (!isMouseDown.current[deckNumber]) {
      // Mouse was not pressed down on this deck, so ignore
      return;
    }
    isMouseDown.current[deckNumber] = false; // Reset mouse down state
    clearTimeout(holdTimer.current[deckNumber]);
    if (isHold.current[deckNumber]) {
      stopFromCue(deckNumber);
    } else {
      handleSetCuePoint(deckNumber);
    }
  };

  useEffect(() => {
    decksRef.current = decks;
    Object.keys(decks).forEach((deckNumber) => {
      const deck = decks[deckNumber];
      if (deck.isPlaying && !deck.source && deck.audioBuffer) {
        console.log(`Starting playback and updateTime for deck ${deckNumber}`);
        startPlayback(deckNumber);
        updateTime(deckNumber);
      }
      // Stop playback if isPlaying changed to false
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
        handleCueMouseDown,
        handleCueMouseUp,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

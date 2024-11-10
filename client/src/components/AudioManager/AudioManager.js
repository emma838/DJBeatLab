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
    bpm: 120, // Default BPM
    defaultBpm: 120, // Default BPM
    wasPlaying: false, // Tracks if the deck was playing before jogging
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
    bpm: 120, // Default BPM
    defaultBpm: 120, // Default BPM
    wasPlaying: false, // Tracks if the deck was playing before jogging
  },
};

function decksReducer(state, action) {
  switch (action.type) {
    case 'SET_DECK':
      // console.log(`Dispatching SET_DECK for deck ${action.deckNumber}:`, action.payload);
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
  const isMouseDown = useRef({});

  useEffect(() => {
    if (!audioContexts[1].current) {
      audioContexts[1].current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!audioContexts[2].current) {
      audioContexts[2].current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const loadTrackData = async (deckNumber, track) => {
    console.log(`Loading track on deck ${deckNumber}:`, track); // Log track information and deckNumber

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

                // Log BPM values before dispatch
                console.log(`Setting defaultBpm for deck ${deckNumber}:`, track.bpm || 0);
                console.log(`Setting bpm for deck ${deckNumber}:`, track.bpm || 0);

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
                        defaultBpm: track.bpm || 0, // Use track BPM or default
                        bpm: track.bpm || 0,
                        wasPlaying: false, // Initialize
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
    source.playbackRate.value = deck.bpm / deck.defaultBpm || 1; // Ustaw playbackRate
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
  
    // Rozpocznij aktualizację czasu
    updateTime(deckNumber);
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
    const elapsedTime = audioCtx.currentTime - deck.playbackStartTime;
    const playbackRate = deck.bpm / deck.defaultBpm || 1;
    const scaledElapsedTime = elapsedTime * playbackRate;
    const currentTime = deck.startOffset + scaledElapsedTime;
  
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
      updateTime(deckNumber);
    }
  };

  // Function to nudge playback by a time delta
  const nudgePlayback = (deckNumber, timeDelta) => {
    const deck = decksRef.current[deckNumber];
    let newTime = deck.currentTime + timeDelta;

    // Clamp newTime between 0 and duration
    newTime = Math.max(0, Math.min(deck.duration, newTime));

    console.log(`Nudging playback on deck ${deckNumber} by ${timeDelta} seconds to new time ${newTime}`);

    updateCurrentTime(deckNumber, newTime);
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

  // New Functions for Jogging Control

  // Called when user starts interacting with the jog wheel
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

  // Called when user stops interacting with the jog wheel
  const stopJogging = (deckNumber) => {
    const deck = decksRef.current[deckNumber];
    if (deck.wasPlaying) {
      console.log(`Jogging ended on deck ${deckNumber}, resuming playback from ${deck.currentTime} seconds`);
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { isPlaying: true, wasPlaying: false },
      });
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
  
      // Aktualizuj playbackRate na źródle audio
      deck.source.playbackRate.value = newPlaybackRate;
  
      // Ustaw nowy startOffset i playbackStartTime, aby currentTime pozostało ciągłe
      const newStartOffset = currentTime;
      const newPlaybackStartTime = audioCtx.currentTime;
  
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { bpm: newBpm, startOffset: newStartOffset, playbackStartTime: newPlaybackStartTime },
      });
    } else {
      // Jeśli nie odtwarzamy, po prostu zaktualizuj BPM
      dispatch({
        type: 'SET_DECK',
        deckNumber,
        payload: { bpm: newBpm },
      });
    }
  };
  
  useEffect(() => {
    decksRef.current = decks;
    Object.keys(decks).forEach((deckNumber) => {
      const deck = decks[deckNumber];
      if (deck.isPlaying && !deck.source && deck.audioBuffer) {
        // console.log(`Starting playback and updateTime for deck ${deckNumber}`);
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
        nudgePlayback,
        handleCueMouseDown,
        handleCueMouseUp,
        startJogging, // Expose startJogging
        stopJogging,  // Expose stopJogging
        updateBpm,    // Expose updateBpm
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

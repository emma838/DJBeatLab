// AudioManager.js
import React, { createContext, useState } from 'react';

export const AudioContext = createContext();

export function AudioProvider({ children }) {
  const [audioCtx, setAudioCtx] = useState(null);
  const [deck1, setDeck1] = useState({ buffer: null, source: null, gainNode: null, blobUrl: null });
  const [deck2, setDeck2] = useState({ buffer: null, source: null, gainNode: null, blobUrl: null });

  const initializeAudioContext = () => {
    if (!audioCtx) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      setAudioCtx(context);
    }
  };

  const loadTrack = async (deckNumber, url) => {
    try {
      if (!audioCtx) {
        console.error('AudioContext is not initialized');
        return;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const blob = new Blob([arrayBuffer]);
      const blobUrl = URL.createObjectURL(blob);

      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);

      if (deckNumber === 1) {
        setDeck1({ buffer: audioBuffer, source: null, gainNode, blobUrl });
      } else {
        setDeck2({ buffer: audioBuffer, source: null, gainNode, blobUrl });
      }
    } catch (error) {
      console.error('Error loading track:', error);
    }
  };

  const playTrack = (deckNumber) => {
    if (!audioCtx) {
      console.error('AudioContext is not initialized');
      return;
    }

    const deck = deckNumber === 1 ? deck1 : deck2;
    if (deck.buffer) {
      const source = audioCtx.createBufferSource();
      source.buffer = deck.buffer;
      source.connect(deck.gainNode);
      source.start();
      if (deckNumber === 1) {
        setDeck1((prev) => ({ ...prev, source }));
      } else {
        setDeck2((prev) => ({ ...prev, source }));
      }
    }
  };

  const stopTrack = (deckNumber) => {
    const deck = deckNumber === 1 ? deck1 : deck2;
    if (deck.source) {
      deck.source.stop();
      if (deckNumber === 1) {
        setDeck1((prev) => ({ ...prev, source: null }));
      } else {
        setDeck2((prev) => ({ ...prev, source: null }));
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        audioCtx,
        initializeAudioContext,
        deck1,
        deck2,
        loadTrack,
        playTrack,
        stopTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

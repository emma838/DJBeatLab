import { useState, useEffect } from 'react';

const AudioManager = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [deck1, setDeck1] = useState({ source: null, gainNode: null, volumeNode: null });
  const [deck2, setDeck2] = useState({ source: null, gainNode: null, volumeNode: null });

  useEffect(() => {
    // Inicjalizacja AudioContext przy montowaniu komponentu
    const context = new (window.AudioContext || window.webkitAudioContext)();
    setAudioContext(context);

    // Tworzymy i konfigurujemy kanały
    setDeck1(createDeckChannel(context));
    setDeck2(createDeckChannel(context));

    return () => {
      context.close();
    };
  }, []);

  // Funkcja do tworzenia kanału audio z GainNode i VolumeNode
  const createDeckChannel = (context) => {
    const gainNode = context.createGain();
    const volumeNode = context.createGain();
    gainNode.connect(volumeNode);
    volumeNode.connect(context.destination);

    return {
      source: null, // Utwór będzie przypisany później
      gainNode,
      volumeNode
    };
  };

  // Funkcja do ładowania utworu na dany deck
  const loadTrack = (deckNumber, trackUrl) => {
    const deck = deckNumber === 1 ? deck1 : deck2;

    // Usuwamy poprzednie źródło (jeśli istnieje)
    if (deck.source) {
      deck.source.stop();
    }

    const source = audioContext.createBufferSource();
    fetch(trackUrl)
      .then(response => response.arrayBuffer())
      .then(data => audioContext.decodeAudioData(data))
      .then(buffer => {
        source.buffer = buffer;
        source.connect(deck.gainNode); // Podłączamy źródło do GainNode
        deck.source = source;
        if (deckNumber === 1) setDeck1(deck);
        else setDeck2(deck);
      });
  };

  // Funkcje do sterowania odtwarzaniem
  const playTrack = (deckNumber) => {
    const deck = deckNumber === 1 ? deck1 : deck2;
    if (deck.source) {
      deck.source.start(0);
    }
  };

  const pauseTrack = (deckNumber) => {
    const deck = deckNumber === 1 ? deck1 : deck2;
    if (deck.source) {
      deck.source.stop();
    }
  };

  // Funkcje ustawiania gain i volume
  const setGain = (deckNumber, value) => {
    const deck = deckNumber === 1 ? deck1 : deck2;
    deck.gainNode.gain.value = value;
  };

  const setVolume = (deckNumber, value) => {
    const deck = deckNumber === 1 ? deck1 : deck2;
    deck.volumeNode.gain.value = value;
  };

  // Funkcja synchronizacji decków
  const syncDecks = () => {
    // Funkcja synchronizacji BPM i beatmatching pomiędzy deck1 i deck2
    // np. dopasowanie `playbackRate` lub manipulacja czasem startu odtwarzania
  };

  return {
    loadTrack,
    playTrack,
    pauseTrack,
    setGain,
    setVolume,
    syncDecks
  };
};

export default AudioManager;

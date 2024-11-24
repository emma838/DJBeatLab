// src/components/AudioManager/AudioControl.js

let playPauseFunction = null;
let getDecksFunction = null;

/**
 * Sets the playPause function from AudioManager.
 * @param {Function} func - The playPause function.
 */
export const setPlayPauseFunction = (func) => {
  playPauseFunction = func;
};

/**
 * Calls the playPause function for a specific deck.
 * @param {number} deckNumber - The deck number (1 or 2).
 */
export const playPause = (deckNumber) => {
  if (playPauseFunction) {
    playPauseFunction(deckNumber);
  } else {
    console.error('playPause function is not set.');
  }
};

/**
 * Sets the getDecks function from AudioManager.
 * @param {Function} func - The function to get decks.
 */
export const setGetDecksFunction = (func) => {
  getDecksFunction = func;
};

/**
 * Retrieves the current decks' state.
 * @returns {Object} The current decks' state.
 */
export const getDecks = () => {
  if (getDecksFunction) {
    return getDecksFunction();
  } else {
    console.error('getDecks function is not set.');
    return {};
  }
};

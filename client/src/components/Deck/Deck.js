// Deck.js
import React from 'react';
import TrackInfo from '../TrackInfo/TrackInfo';
import DeckControls from '../DeckControls/DeckControls';
import JogWheel from '../JogWheel/JogWheel';
import BpmSlider from '../BpmSlider/BpmSlider';
import BpmControl from '../BpmControl/BpmControl';
import LoopHandler from '../LoopHandler/LoopHandler';
import FXHandler from '../FXHandler/FXHandler';
import Tooltip from '../ToolTip/ToolTip';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './Deck.module.scss';

function Deck({ deckNumber }) {
  const { decks, playPause, handleCueMouseDown, handleCueMouseUp, updateBpm } = useAudio();
  const deck = decks[deckNumber];

  // Sprawdzenie, czy deck jest zainicjalizowany, zanim użyjemy jego właściwości
  if (!deck) {
    console.warn(`Deck ${deckNumber} is not initialized yet.`);
    return null;
  }

  // Determine the order of elements based on deckNumber
  const isDeckTwo = deckNumber === 2;

  return (
    <div className={styles.deck}>
      <div className={styles.top}>
        {isDeckTwo ? (
          <>
            <div className={styles.trackinfo}>
              <TrackInfo
                track={deck.track}
                duration={deck.duration}
                currentTime={deck.currentTime}
              />
            </div>
          </>
        ) : (
          <>
            <div className={styles.trackinfo}>
              <TrackInfo
                track={deck.track}
                duration={deck.duration}
                currentTime={deck.currentTime}
              />
            </div>
          </>
        )}
      </div>

      <div className={styles.bottom}>
        {isDeckTwo ? (
          <>
            <div className={styles.utilsRight}>
              <div className={styles.jogpitch}>
                <div className={styles.pitch}>
                                 
                <BpmSlider deckNumber={deckNumber} />
                </div>
                <div className={styles.jog2}>
                  <JogWheel deckNumber={deckNumber} />
                </div>
              </div>
              <div className={styles.buttonsBpm}>
              <div className={styles.bpm}>
              <BpmControl
                deckNumber={deckNumber}
                baseBpm={deck.defaultBpm}
                onBpmChange={(newBpm) => updateBpm(deckNumber, newBpm)}
              />
              </div>
              <div className={styles.buttons2}>
                <DeckControls
                  playPause={() => playPause(deckNumber)}
                  isPlaying={deck.isPlaying}
                  deckNumber={deckNumber}
                  handleCueMouseDown={handleCueMouseDown}
                  handleCueMouseUp={handleCueMouseUp}
                />
              </div>
              </div>
            </div>
            <div className={styles.utilsLeft}>
              <div className={styles.loops}>
              <Tooltip
  className={styles.tooltip}
  style={{ top: "3px", left: "3px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  title="Jak ustawić BPM?"
  text="Kliknij na pole BPM, aby ręcznie wpisać wartość."
/>
              <h3>LOOPS</h3>
              <LoopHandler deckNumber={deckNumber} />
              </div>
              <div className={styles.fxs}>
              <Tooltip
  className={styles.tooltip}
  style={{ top: "3px", left: "3px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  title="Jak ustawić BPM?"
  text="Kliknij na pole BPM, aby ręcznie wpisać wartość."
/>
              <h3>FX</h3>
              <FXHandler deckNumber={deckNumber} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.utilsLeft}>
              <div className={styles.loops}>
              <Tooltip
  className={styles.tooltip}
  style={{ top: "3px", right: "3px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  title="Jak ustawić BPM?"
  text="Kliknij na pole BPM, aby ręcznie wpisać wartość."
/>
                <h3>LOOPS</h3>
              <LoopHandler deckNumber={deckNumber} />
              </div>
              <div className={styles.fxs}>

              <Tooltip
  className={styles.tooltip}
  style={{ top: "3px", right: "3px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  title="Jak ustawić BPM?"
  text="Kliknij na pole BPM, aby ręcznie wpisać wartość."
/>
              <h3>FX</h3>
              <FXHandler deckNumber={deckNumber} />
              </div>
            </div>
            <div className={styles.utilsRight}>
              <div className={styles.jogpitch}>

                <div className={styles.jog}>
                  
                  <JogWheel deckNumber={deckNumber} />
                </div>
                <div className={styles.pitch}>
                <BpmSlider deckNumber={deckNumber} />
                
                </div>
              </div>
              <div className={styles.buttonsBpm}>
              <div className={styles.buttons}>
                <DeckControls
                  playPause={() => playPause(deckNumber)}
                  isPlaying={deck.isPlaying}
                  deckNumber={deckNumber}
                  handleCueMouseDown={handleCueMouseDown}
                  handleCueMouseUp={handleCueMouseUp}
                />
              </div>
              <div className={styles.bpm2}>
              <BpmControl
                deckNumber={deckNumber}
                baseBpm={deck.defaultBpm}
                onBpmChange={(newBpm) => updateBpm(deckNumber, newBpm)}
              />
              </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Deck;

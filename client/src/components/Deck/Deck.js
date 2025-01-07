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
                <Tooltip
        className={styles.tooltip}
        style={{ top: "20px", right: "20px", width: "15px", height: "15px" }}
        bubbleBgColor="#f1f1f1"
        iconColor="#000"
          position = "right"
        title="JOG WHEEL"
        text="Turning the Jog Wheel to the right or left allows you to quickly skip to a specific point in the track.</br> "
      />
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
                              <Tooltip
  className={styles.tooltip}
  style={{ top: "20px", right: "10px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  position = "right"
  title="CUE"
  text="<strong>Setting the CUE point:</strong> If the track is stopped, pressing CUE sets the start point (cue point) at the current playback position.</br>
   <strong>Temporary playback:</strong> Holding CUE plays the track from the set cue point. Releasing the button stops playback and returns to the cue point.</br> 
   <strong>Return to the cue point:</strong> Pressing CUE while the track is playing stops the track and returns playback to the saved cue point.</br>"
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
  position = "right"
  title="LOOPS"
  text="Creating repeating sections of the track.</br>
   <strong>Automatic:</strong> Select the loop length (e.g., 1, 2, 4, 8 beats) to immediately lock playback within that range.</br> 
   <strong>Manual:</strong>Click IN to set the start point and OUT to set the end point to define your own loop, and click EXIT to exit the loop."
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
    position = "right"
  title="FX"
  text="The effects section allows you to add sound effects to the track.</br> 
  <strong>Reverb</strong> simulates a space effect.</br> 
  <strong>Delay</strong> repeats the sound with a delay.</br>
   <strong>Flanger</strong> modulates the sound with a shift.</br>"
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
  position = "left"
  title="LOOPS"
  text="Creating repeating sections of the track.</br>
   <strong>Automatic:</strong> Select the loop length (e.g., 1, 2, 4, 8 beats) to immediately lock playback within that range.</br> 
   <strong>Manual:</strong>Click IN to set the start point and OUT to set the end point to define your own loop, and click EXIT to exit the loop."
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
  position="left"
  title="FX"
  text="The effects section allows you to add sound effects to the track.</br> 
  <strong>Reverb</strong> simulates a space effect.</br> 
  <strong>Delay</strong> repeats the sound with a delay.</br>
   <strong>Flanger</strong> modulates the sound with a shift.</br>"
/>
              <h3>FX</h3>
              <FXHandler deckNumber={deckNumber} />
              </div>
            </div>
            <div className={styles.utilsRight}>
              <div className={styles.jogpitch}>

                <div className={styles.jog}>
                <Tooltip
        className={styles.tooltip}
        style={{ top: "20px", left: "20px", width: "15px", height: "15px" }}
        bubbleBgColor="#f1f1f1"
        iconColor="#000"
          position = "left"
        title="JOG WHEEL"
        text="Turning the Jog Wheel to the right or left allows you to quickly skip to a specific point in the track.</br>"
      />
                  <JogWheel deckNumber={deckNumber} />
                </div>
                <div className={styles.pitch}>
                <BpmSlider deckNumber={deckNumber} />
                
                </div>
              </div>
              <div className={styles.buttonsBpm}>
              <div className={styles.buttons}>
              <Tooltip
  className={styles.tooltip}
  style={{ top: "20px", right: "10px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  position = "right"
  title="CUE"
  text="<strong>Setting the CUE point:</strong> If the track is stopped, pressing CUE sets the start point (cue point) at the current playback position.</br>
   <strong>Temporary playback:</strong> Holding CUE plays the track from the set cue point. Releasing the button stops playback and returns to the cue point.</br> 
   <strong>Return to the cue point:</strong> Pressing CUE while the track is playing stops the track and returns playback to the saved cue point.</br>"
/>
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

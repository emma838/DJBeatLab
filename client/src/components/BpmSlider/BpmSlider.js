import React from 'react';
import { useAudio } from '../../components/AudioManager/AudioManager';
import styles from './BpmSlider.module.scss';
import Tooltip from '../ToolTip/ToolTip';


const BpmSlider = ({ deckNumber }) => {
  const { decks, updateBpm } = useAudio();
  const deck = decks[deckNumber];
  const baseBpm = deck?.defaultBpm || 120;
  const bpm = deck?.bpm || baseBpm;

  const minBpm = Math.max(baseBpm - 40, 40);
  const maxBpm = baseBpm + 40;

  const handleSliderChange = (e) => {
    const newBpm = parseInt(e.target.value, 10);
    if (isNaN(newBpm)) return;
    updateBpm(deckNumber, newBpm);
  };

  const handleWheel = (e) => {
    e.preventDefault(); // Zapobiega przewijaniu strony
    const delta = e.deltaY > 0 ? -1 : 1; // Scroll w dół zmniejsza, w górę zwiększa
    const newBpm = Math.max(minBpm, Math.min(maxBpm, bpm + delta)); // Ogranicz BPM do zakresu
    updateBpm(deckNumber, newBpm);
  };

  return (
    <div className={styles.bpmSliderContent}>
      <div className={styles.label}>PITCH</div>
                      <Tooltip
              className={styles.tooltip}
              style={{ top: "5px", right: "5px", width: "15px", height: "15px" }}
              bubbleBgColor="#f1f1f1"
              iconColor="#000"
                position = "right"
              title="PITCH and BPM"
              text="<strong>PITCH Fader</strong> allows you to change the playback speed/pitch of the track.</br>
               <strong>BPM Value</strong> (beats per minute) determines the tempo of the track."
            />
      <div className={styles.bpmSlider}>
        <div className={styles.scale}>
          <div className={`${styles.scaleMark} ${styles.top}`} />
          <div className={`${styles.scaleMark} ${styles.middle}`} />
          <div className={`${styles.scaleMark} ${styles.bottom}`} />
        </div>
        <input
          type="range"
          min={minBpm}
          max={maxBpm}
          step="1"
          value={bpm}
          onChange={handleSliderChange}
          onWheel={handleWheel} // Dodanie obsługi scrolla
          className={styles.slider}
        />
      </div>
    </div>
  );
};

export default BpmSlider;

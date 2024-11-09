// JogWheel.js
import React, { useRef, useEffect, useState } from 'react';
import styles from './JogWheel.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager';

function JogWheel({ deckNumber }) {
  const { decks, nudgePlayback, startJogging, stopJogging } = useAudio();
  const deck = decks[deckNumber];

  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);

  const { currentTime, duration, bpm } = deck;

  // Calculate duration of 4 bars
  const secondsPerBeat = 60 / bpm;
  const durationOfBar = secondsPerBeat * 4; // Duration of 1 bar
  const durationOfFullRotation = durationOfBar * 4; // Duration of 4 bars

  useEffect(() => {
    if (!duration) return;

    // Calculate rotation based on currentTime
    const rotationDegrees = (currentTime / durationOfFullRotation) * 360;
    setRotation(rotationDegrees);
  }, [currentTime, durationOfFullRotation]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    lastAngle.current = getAngle(e);
    startJogging(deckNumber);
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;

    const angle = getAngle(e);
    let angleDelta = angle - lastAngle.current;

    // Handle angle wrapping
    if (angleDelta > 180) angleDelta -= 360;
    if (angleDelta < -180) angleDelta += 360;

    lastAngle.current = angle;

    // Calculate time delta
    const timeDelta = (angleDelta / 360) * durationOfFullRotation;

    // Nudge playback position
    nudgePlayback(deckNumber, timeDelta);

    // Update rotation immediately
    setRotation((prevRotation) => prevRotation + angleDelta);
  };

  const handleMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;
      stopJogging(deckNumber);
    }
  };

  const getAngle = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    return angle;
  };

  return (
    <div
      className={styles.jogWheelContainer}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={wheelRef}
        className={styles.jogWheel}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <div className={styles.jogWheelCenter}></div>
        <div className={styles.jogWheelIndicator}></div>
      </div>
    </div>
  );
}

export default JogWheel;

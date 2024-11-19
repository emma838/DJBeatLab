import React, { useRef, useEffect, useState } from 'react';
import styles from './JogWheel.module.scss';
import { useAudio } from '../../components/AudioManager/AudioManager';

function JogWheel({ deckNumber }) {
  const { decks, nudgePlayback, startJogging, stopJogging, updateCurrentTime } = useAudio();
  const deck = decks[deckNumber];

  const wheelRef = useRef(null);
  const [rotation, setRotation] = useState(0);
  const isDragging = useRef(false);
  const lastAngle = useRef(0);

  const { currentTime, duration, bpm, defaultBpm } = deck;
  
  const currentTimeRef = useRef(deck.currentTime);

  // Calculate duration of 4 bars
  const secondsPerBeat = 60 / bpm;
  const durationOfBar = secondsPerBeat * 4; // Duration of 1 bar
  const playbackRate = bpm / (defaultBpm || 120);// Fallback to 120 BPM if defaultBpm is not set
  const durationOfFullRotation = durationOfBar * 4 * playbackRate; // Duration of 4 bars, scaled by playback rate

  useEffect(() => {
    if (!duration) return;
    currentTimeRef.current = deck.currentTime;

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
  
    // Update local currentTimeRef
    let newTime = currentTimeRef.current + timeDelta;
    newTime = Math.max(0, Math.min(deck.duration, newTime));
    currentTimeRef.current = newTime;
  
    // Update rotation immediately
    setRotation((prevRotation) => prevRotation + angleDelta);
  
    // Update the deck's currentTime
    updateCurrentTime(deckNumber, newTime, false);
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


// JogWheel.js
// import React, { useRef, useEffect, useState } from 'react';
// import styles from './JogWheel.module.scss';
// import { useAudio } from '../../components/AudioManager/AudioManager';

// function JogWheel({ deckNumber }) {
//   const {
//     decks,
//     currentTimeRef,
//     startJogging,
//     stopJogging,
//     updateCurrentTime,
//   } = useAudio();

//   const deck = decks[deckNumber];

//   const wheelRef = useRef(null);
//   const isDragging = useRef(false);
//   const lastAngle = useRef(0);
//   const [rotation, setRotation] = useState(0);

//   // Refs dla dynamicznych zmiennych
//   const bpmRef = useRef(120); // Inicjalizacja domyślnym BPM
//   const defaultBpmRef = useRef(120); // Inicjalizacja domyślnym BPM
//   const durationRef = useRef(1); // Inicjalizacja domyślnym czasem trwania
//   const durationOfFullRotationRef = useRef(1); // Inicjalizacja, aby zapobiec dzieleniu przez zero

//   const previousTimeRef = useRef(0); // Ref do przechowywania poprzedniego czasu

//   // Aktualizacja refów, gdy zmienia się deck
//   useEffect(() => {
//     if (deck) {
//       bpmRef.current = deck.bpm || 120;
//       defaultBpmRef.current = deck.defaultBpm || 120;
//       durationRef.current = deck.duration || 1;

//       const secondsPerBeat = 60 / bpmRef.current;
//       const durationOfBar = secondsPerBeat * 4;
//       const playbackRate = bpmRef.current / defaultBpmRef.current || 1;
//       durationOfFullRotationRef.current =
//         durationOfBar * 4 * playbackRate || 1; // Zapobieganie dzieleniu przez zero

//       // Resetowanie previousTimeRef przy zmianie utworu
//       previousTimeRef.current = currentTimeRef.current[deckNumber] || 0; // **Zmienione**
//     }
//   }, [deck]);

//   // Efekt animacji rotacji
//   useEffect(() => {
//     let animationFrameId;

//     const animateRotation = () => {
//       if (
//         !currentTimeRef ||
//         !currentTimeRef.current ||
//         !durationOfFullRotationRef.current
//       ) {
//         animationFrameId = requestAnimationFrame(animateRotation);
//         return;
//       }

//       const currentTime = currentTimeRef.current[deckNumber] || 0;
//       const durationOfFullRotation = durationOfFullRotationRef.current || 1; // Zapobieganie dzieleniu przez zero

//       // Oblicz różnicę czasu
//       let deltaTime = currentTime - previousTimeRef.current;

//       // Aktualizacja previousTimeRef przed dalszymi obliczeniami
//       previousTimeRef.current = currentTime; // **Upewniamy się, że previousTimeRef jest aktualizowane**

//       // Obsługa sytuacji, gdy deltaTime jest ujemne (np. po przewinięciu lub loopingu)
//       if (deltaTime < 0) {
//         deltaTime = 0;
//       }

//       // Oblicz zmianę rotacji
//       const deltaRotation = (deltaTime / durationOfFullRotation) * 360;

//       // Zaktualizuj rotację
//       setRotation((prevRotation) => prevRotation + deltaRotation);

//       animationFrameId = requestAnimationFrame(animateRotation);
//     };

//     animationFrameId = requestAnimationFrame(animateRotation);

//     return () => {
//       cancelAnimationFrame(animationFrameId);
//     };
//   }, [deckNumber]);

//   // Obsługa zdarzeń
//   const handleMouseDown = (e) => {
//     e.preventDefault();
//     isDragging.current = true;
//     lastAngle.current = getAngle(e);
//     startJogging(deckNumber);

//     // Synchronizacja previousTimeRef z currentTime podczas rozpoczęcia interakcji
//     previousTimeRef.current = currentTimeRef.current[deckNumber] || 0; // **Dodane**
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging.current) return;

//     const angle = getAngle(e);
//     let angleDelta = angle - lastAngle.current;

//     if (angleDelta > 180) angleDelta -= 360;
//     if (angleDelta < -180) angleDelta += 360;

//     lastAngle.current = angle;

//     const durationOfFullRotation =
//       durationOfFullRotationRef.current || 1; // Zapobieganie dzieleniu przez zero
//     const timeDelta = (angleDelta / 360) * durationOfFullRotation;

//     let newTime =
//       currentTimeRef.current[deckNumber] || 0;
//     newTime += timeDelta;
//     newTime = Math.max(0, Math.min(deck?.duration || 0, newTime));

//     // Aktualizacja currentTimeRef
//     currentTimeRef.current[deckNumber] = newTime;

//     // Aktualizacja rotacji
//     setRotation((prevRotation) => prevRotation + angleDelta);

//     // Aktualizacja previousTimeRef, aby uniknąć dużych deltaTime przy następnej animacji
//     previousTimeRef.current = newTime; // **Dodane**

//     // Aktualizacja currentTime decka
//     updateCurrentTime(deckNumber, newTime, false);
//   };

//   const handleMouseUp = () => {
//     if (isDragging.current) {
//       isDragging.current = false;
//       stopJogging(deckNumber);
//     }
//   };

//   const getAngle = (e) => {
//     const rect = wheelRef.current.getBoundingClientRect();
//     const x = e.clientX - (rect.left + rect.width / 2);
//     const y = e.clientY - (rect.top + rect.height / 2);
//     const angle = Math.atan2(y, x) * (180 / Math.PI);
//     return angle;
//   };

//   return (
//     <div
//       className={styles.jogWheelContainer}
//       onMouseDown={handleMouseDown}
//       onMouseMove={handleMouseMove}
//       onMouseUp={handleMouseUp}
//       onMouseLeave={handleMouseUp}
//     >
//       <div
//         ref={wheelRef}
//         className={styles.jogWheel}
//         style={{ transform: `rotate(${rotation}deg)` }}
//       >
//         <div className={styles.jogWheelCenter}></div>
//         <div className={styles.jogWheelIndicator}></div>
//       </div>
//     </div>
//   );
// }

// export default JogWheel;

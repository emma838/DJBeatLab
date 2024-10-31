// Waveform.js
import React, { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import styles from './Waveform.module.scss';

function Waveform({ deckNumber, trackUrl }) {
  const waveformRef = useRef(null);
  const waveSurferRef = useRef(null);

  useEffect(() => {
    if (waveformRef.current && !waveSurferRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#ccc',
        progressColor: '#007bff',
        cursorColor: '#007bff',
        height: 80,
        responsive: true,
        normalize: true,
      });
    }
    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (trackUrl && waveSurferRef.current) {
      console.log('Loading track URL into WaveSurfer:', trackUrl);
      waveSurferRef.current.load(trackUrl);
    }
  }, [trackUrl]);

  return <div className={styles.waveform} ref={waveformRef}></div>;
}

export default Waveform;

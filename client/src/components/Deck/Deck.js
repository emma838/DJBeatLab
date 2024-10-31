// Deck.js
import React, { useState, useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import TrackInfo from '../TrackInfo/TrackInfo';
import DeckControls from '../DeckControls/DeckControls';
import styles from './Deck.module.scss'; // Ensure you have appropriate styles

function Deck({ deckNumber, track }) {
  const waveSurferRef = useRef(null);
  const waveformContainerRef = useRef(null);
  const holdTimer = useRef(null);   // Timer for hold detection
  const isHold = useRef(false);     // Flag to indicate a hold action

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cuePoint, setCuePoint] = useState(0); // Initialize to 0:00
  const [isCuePlaying, setIsCuePlaying] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (waveformContainerRef.current && !waveSurferRef.current) {
      waveSurferRef.current = WaveSurfer.create({
        container: waveformContainerRef.current,
        waveColor: '#ccc',
        progressColor: '#007bff',
        cursorColor: '#007bff',
        height: 80,
        responsive: true,
        normalize: true,
        // No regions plugin
      });

      // Event listeners
      waveSurferRef.current.on('ready', () => {
        const trackDuration = waveSurferRef.current.getDuration();
        setDuration(trackDuration);
        waveSurferRef.current.seekTo(0); // Start at 0
        setCuePoint(0); // Set default cue point to 0:00
      });

      waveSurferRef.current.on('audioprocess', () => {
        if (waveSurferRef.current.isPlaying()) {
          setCurrentTime(waveSurferRef.current.getCurrentTime());
        }
      });

      waveSurferRef.current.on('seek', () => {
        setCurrentTime(waveSurferRef.current.getCurrentTime());
      });

      waveSurferRef.current.on('play', () => {
        setIsPlaying(true);
      });

      waveSurferRef.current.on('pause', () => {
        setIsPlaying(false);
      });

      waveSurferRef.current.on('finish', () => {
        setIsPlaying(false);
        setIsCuePlaying(false);
        waveSurferRef.current.seekTo(0); // Reset to the beginning
        setCuePoint(0); // Optionally reset cue point to 0:00
      });
    }

    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy();
        waveSurferRef.current = null;
      }
    };
  }, []);

  // Load and fetch track
  useEffect(() => {
    const fetchAndLoadTrack = async () => {
      if (track && waveSurferRef.current) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.error('No authentication token found in localStorage');
            return;
          }

          const response = await fetch(track.url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          waveSurferRef.current.load(blobUrl);

          // Clean up the blob URL after it's loaded
          waveSurferRef.current.on('ready', () => {
            URL.revokeObjectURL(blobUrl);
            setDuration(waveSurferRef.current.getDuration());
            setCurrentTime(0);
            waveSurferRef.current.seekTo(0); // Ensure playback starts at 0
            setCuePoint(0); // Set default cue point to 0:00
          });
        } catch (error) {
          console.error('Error fetching and loading track:', error);
        }
      }
    };

    fetchAndLoadTrack();
  }, [track]);

  // Play or pause the track
  const playPause = () => {
    if (waveSurferRef.current) {
      waveSurferRef.current.playPause();
    }
  };

  // Set a new cue point or stop playback if playing
  const handleSetCuePoint = () => {
    if (!waveSurferRef.current) return;

    if (!isPlaying) { // Only allow setting cue point when paused
      const currentPos = waveSurferRef.current.getCurrentTime();
      setCuePoint(currentPos);
      console.log(`Cue point set at ${currentPos.toFixed(2)} seconds.`);
    } else {
      // If the track is playing, clicking CUE should stop playback and return to cue point
      waveSurferRef.current.pause();
      waveSurferRef.current.seekTo(cuePoint / waveSurferRef.current.getDuration());
      setIsCuePlaying(false);
      console.log(`Playback stopped and returned to cue point at ${cuePoint.toFixed(2)} seconds.`);
    }
  };

  // Play from the cue point
  const playFromCue = () => {
    if (!waveSurferRef.current) return;
    if (cuePoint < 0 || cuePoint > duration) {
      console.warn('Cue point is out of bounds.');
      return;
    }

    waveSurferRef.current.play(cuePoint);
    setIsCuePlaying(true);
    console.log(`Playing from cue point at ${cuePoint.toFixed(2)} seconds.`);
  };

  // Stop playback and return to cue point
  const stopFromCue = () => {
    if (!waveSurferRef.current || !isCuePlaying) return;

    waveSurferRef.current.pause();
    waveSurferRef.current.seekTo(cuePoint / waveSurferRef.current.getDuration());
    setIsCuePlaying(false);
    console.log(`Playback stopped and returned to cue point at ${cuePoint.toFixed(2)} seconds.`);
  };

  // Handle mouse down on CUE button
  const handleCueMouseDown = () => {
    isHold.current = false;
    holdTimer.current = setTimeout(() => {
      isHold.current = true;
      playFromCue();
    }, 200); // 200ms threshold for hold
  };

  // Handle mouse up on CUE button
  const handleCueMouseUp = () => {
    clearTimeout(holdTimer.current);
    if (isHold.current) {
      stopFromCue();
    } else {
      handleSetCuePoint();
    }
  };

  return (
    <div className={styles.deck}>
      <TrackInfo
        track={track}
        duration={duration}
        currentTime={currentTime}
        cuePoint={cuePoint}
      />
      <div ref={waveformContainerRef} className={styles.waveform}></div>
      <DeckControls
        playPause={playPause}
        isPlaying={isPlaying}
        onCueMouseDown={handleCueMouseDown}
        onCueMouseUp={handleCueMouseUp}
      />
    </div>
  );
}

export default Deck;

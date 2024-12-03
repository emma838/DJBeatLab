// src/components/AnalyzeOnUpload/AnalyzeOnUpload.js

import { useEffect } from 'react';
import aubio from 'aubiojs'; // Upewnij się, że aubio jest poprawnie zainstalowane

const AnalyzeOnUpload = ({ arrayBuffer, onComplete, onError }) => {
  useEffect(() => {
    let isCancelled = false; // Flaga do anulowania analizy, jeśli komponent zostanie odmontowany

    const analyze = async () => {
      try {
        console.log('Analysis started');
        const AubioModule = await aubio();
        const { Tempo, Pitch } = AubioModule;
        console.log('Aubio module loaded');

        // Klonowanie ArrayBuffer, aby zapobiec jego odłączeniu
        const clonedBuffer = arrayBuffer.slice(0);

        // Dekodowanie audio
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(clonedBuffer);
        console.log('Audio decoded');

        // Konwersja do mono
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;

        const totalDuration = length / sampleRate;
        const analysisDuration = 40;
        const halfAnalysis = analysisDuration / 2;

        let startSample;
        let endSample;

        if (totalDuration > analysisDuration) {
          const midTime = totalDuration / 2;
          startSample = Math.floor((midTime - halfAnalysis) * sampleRate);
          endSample = Math.floor((midTime + halfAnalysis) * sampleRate);
        } else {
          startSample = 0;
          endSample = length;
        }

        startSample = Math.max(0, startSample);
        endSample = Math.min(length, endSample);

        let monoAudioData = new Float32Array(endSample - startSample);

        for (let channel = 0; channel < numberOfChannels; channel++) {
          const channelData = audioBuffer.getChannelData(channel);
          for (let i = startSample; i < endSample; i++) {
            monoAudioData[i - startSample] += channelData[i];
          }
        }

        // Uśrednianie wartości
        for (let i = 0; i < monoAudioData.length; i++) {
          monoAudioData[i] /= numberOfChannels;
        }
        console.log('Converted to mono and averaged channels');

        // Normalizacja RMS
        const calculateRMS = (buffer) => {
          let sum = 0;
          buffer.forEach(sample => {
            sum += sample * sample;
          });
          return Math.sqrt(sum / buffer.length);
        };

        const rms = calculateRMS(monoAudioData);
        if (rms > 0) {
          monoAudioData = monoAudioData.map(sample => sample / rms);
        }
        console.log('Normalized RMS');

        // Buffer size i hop size
        const bufferSize = 2048;
        const hopSize = 128;

        const tempoDetector = new Tempo(bufferSize, hopSize, sampleRate);
        const pitchMethod = 'yinfft';
        const pitchDetector = new Pitch(pitchMethod, bufferSize, hopSize, sampleRate);

        let bpmResult = null;
        let bpmValues = [];
        let pitchesDetected = [];

        for (let i = 0; i + bufferSize <= monoAudioData.length; i += hopSize) {
          if (isCancelled) {
            console.log('Analysis cancelled');
            return;
          }

          let buffer = monoAudioData.slice(i, i + bufferSize);

          tempoDetector.do(buffer);
          const currentBpm = tempoDetector.getBpm();
          if (currentBpm && currentBpm > 0) {
            bpmValues.push(currentBpm);
          }

          const pitch = pitchDetector.do(buffer);
          if (pitch && pitch > 0) {
            pitchesDetected.push(pitch);
          }
        }

        // Uśrednianie BPM
        if (bpmValues.length > 0) {
          bpmValues.sort((a, b) => a - b);
          const medianIndex = Math.floor(bpmValues.length / 2);
          bpmResult = Math.trunc(bpmValues[medianIndex]);
        }

        // Estymacja tonacji
        const estimateKeyFromPitches = (pitches) => {
          if (pitches.length === 0) return { detectedKey: 'Unknown', camelot: 'Unknown' };
        
          const noteNamesArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
          const noteToCamelot = {
            'C': '8B', 'C#': '3B', 'D': '10B', 'D#': '5B', 'E': '12B', 
            'F': '7B', 'F#': '2B', 'G': '9B', 'G#': '4B', 'A': '11B', 
            'A#': '6B', 'B': '1B',
            'C#m': '3A', 'Dm': '10A', 'D#m': '5A', 'Em': '12A', 
            'Fm': '7A', 'F#m': '2A', 'Gm': '9A', 'G#m': '4A', 
            'Am': '11A', 'A#m': '6A', 'Bm': '1A',
          };
        
          const noteCounts = {};
          pitches.forEach((freq) => {
            const noteNumber = 12 * (Math.log2(freq / 440)) + 69;
            const noteIndex = Math.round(noteNumber) % 12;
            const note = noteNamesArray[(noteIndex + 12) % 12];
            noteCounts[note] = (noteCounts[note] || 0) + 1;
          });
        
          const sortedNotes = Object.entries(noteCounts).sort((a, b) => b[1] - a[1]);
          const mostCommonNote = sortedNotes[0]?.[0] || 'Unknown';
        
          // Zakładamy tonację molową jako domyślną, ale można to zmodyfikować w oparciu o inne dane.
          const inferredKey = `${mostCommonNote}m`; // Domyślnie w molowej (np. 'Bm')
          const camelotCode = noteToCamelot[inferredKey] || 'Unknown';
        
          return {
            detectedKey: inferredKey.replace('m', ' minor'), // Formatowanie na "B minor"
            camelot: camelotCode,
          };
        };
        

        const { detectedKey, camelot } = estimateKeyFromPitches(pitchesDetected);

        console.log('Analysis completed:', { bpm: bpmResult, key: detectedKey, camelot });
        onComplete({ bpm: bpmResult, key: camelot });
      } catch (error) {
        console.error('Error in audio analysis:', error);
        onError(error);
      }
    };

    analyze();

    return () => {
      isCancelled = true;
    };
  }, [arrayBuffer, onComplete, onError]);

  return null;
};

export default AnalyzeOnUpload;

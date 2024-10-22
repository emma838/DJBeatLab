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
        const analysisDuration = 30;
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

        // Przetwarzanie wstępne: filtracja i normalizacja
        const offlineContext = new OfflineAudioContext(1, monoAudioData.length, sampleRate);
        const audioBufferMono = offlineContext.createBuffer(1, monoAudioData.length, sampleRate);
        audioBufferMono.copyToChannel(monoAudioData, 0);

        const source = offlineContext.createBufferSource();
        source.buffer = audioBufferMono;

        // Filtry
        const highPassFilter = offlineContext.createBiquadFilter();
        highPassFilter.type = 'highpass';
        highPassFilter.frequency.value = 100;

        const bandPassFilter = offlineContext.createBiquadFilter();
        bandPassFilter.type = 'bandpass';
        bandPassFilter.frequency.value = 3000;
        bandPassFilter.Q.value = 1;

        const lowPassFilter = offlineContext.createBiquadFilter();
        lowPassFilter.type = 'lowpass';
        lowPassFilter.frequency.value = 5000;

        // Połączenia: Źródło -> High-Pass -> Band-Pass -> Low-Pass -> Destination
        source.connect(highPassFilter);
        highPassFilter.connect(bandPassFilter);
        bandPassFilter.connect(lowPassFilter);
        lowPassFilter.connect(offlineContext.destination);

        source.start(0);
        console.log('Filters connected and started');

        const renderedBuffer = await offlineContext.startRendering();
        console.log('Offline rendering completed');

        monoAudioData = renderedBuffer.getChannelData(0);

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

        const totalHopSteps = Math.floor((monoAudioData.length - bufferSize) / hopSize);
        console.log(`Total hop steps: ${totalHopSteps}`);

        for (let i = 0; i + bufferSize <= monoAudioData.length; i += hopSize) {
          if (isCancelled) {
            console.log('Analysis cancelled');
            return;
          }

          let buffer = monoAudioData.slice(i, i + bufferSize);
          buffer = applyHanningWindow(buffer);

          tempoDetector.do(buffer);
          const currentBpm = tempoDetector.getBpm();
          if (currentBpm && currentBpm > 0) {
            bpmValues.push(currentBpm);
          }

          const pitch = pitchDetector.do(buffer);
          if (pitch && pitch > 0) {
            pitchesDetected.push(pitch);
          }

          // Aktualizacja postępu na podstawie hop steps
          // Możesz tutaj dodać inne mechanizmy śledzenia postępu, jeśli potrzebujesz
        }

        console.log('Loop analysis completed');

// Uśrednianie BPM
if (bpmValues.length > 0) {
  bpmValues.sort((a, b) => a - b);
  const medianIndex = Math.floor(bpmValues.length / 2);
  bpmResult = Math.trunc(bpmValues[medianIndex]); // Obcinanie wartości po przecinku
} else {
  bpmResult = Math.trunc(tempoDetector.getBpm()); // Obcinanie wartości po przecinku
}


        // Estymacja tonacji
        const estimateKeyFromPitches = (pitches) => {
          if (pitches.length === 0) return 'Nieznana';
          const noteNames = pitches.map((freq) => {
            const noteNumber = 12 * (Math.log2(freq / 440)) + 69;
            const noteIndex = Math.round(noteNumber) % 12;
            const noteNamesArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return noteNamesArray[(noteIndex + 12) % 12];
          });
          const noteCounts = {};
          noteNames.forEach((note) => {
            noteCounts[note] = (noteCounts[note] || 0) + 1;
          });
          let maxCount = 0;
          let mostCommonNote = 'Nieznana';
          for (const note in noteCounts) {
            if (noteCounts[note] > maxCount) {
              maxCount = noteCounts[note];
              mostCommonNote = note;
            }
          }
          return mostCommonNote;
        };

        let detectedKey = 'Nieznana';
        if (pitchesDetected.length >= 10) {
          detectedKey = estimateKeyFromPitches(pitchesDetected);
        }

        console.log('Analysis completed:', { bpm: bpmResult, key: detectedKey });
        console.log('Calling onComplete');
        onComplete({ bpm: bpmResult, key: detectedKey });
      } catch (error) {
        console.error('Error in audio analysis:', error);
        onError(error);
      }
    };

    const applyHanningWindow = (buffer) => {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] *= 0.5 * (1 - Math.cos((2 * Math.PI * i) / (buffer.length - 1)));
      }
      return buffer;
    };

    analyze();

    // Cleanup funkcja do anulowania analizy, jeśli komponent zostanie odmontowany
    return () => {
      isCancelled = true;
      console.log('Cleanup: analysis cancelled');
    };
  }, [arrayBuffer, onComplete, onError]); // Usunięcie onProgress z zależności

  return null; // Ten komponent nie renderuje nic
};

export default AnalyzeOnUpload;

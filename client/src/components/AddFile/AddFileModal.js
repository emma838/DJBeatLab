// src/components/AddFileModal/AddFileModal.js

import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import AnalyzeOnUpload from '../AnalyzeOnUpload/AnalyzeOnUpload';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation'; // Importowanie LoadingAnimation
import styles from './AddFileModal.module.scss';

const AddFileModal = ({ isOpen, onClose, updateDirectories }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const arrayBufferRef = useRef(null); // Przechowuje ArrayBuffer
  const [bpm, setBpm] = useState(null);
  const [key, setKey] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false); // Kontroluje Renderowanie AnalyzeOnUpload

  // Obsługa zmiany pliku
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Jeśli analiza jest już w toku, zignoruj nowe pliki
    if (isAnalyzing) {
      alert('Analiza jest już w toku. Proszę poczekać na jej zakończenie.');
      return;
    }

    setSelectedFile(file);
    setBpm(null);
    setKey(null);
    setIsAnalyzing(true);
    setAnalysisStarted(false);

    try {
      const buffer = await file.arrayBuffer();
      arrayBufferRef.current = buffer.slice(0); // Klonowanie bufora
      setAnalysisStarted(true); // Uruchom AnalyzeOnUpload
      console.log('File loaded and buffer set');
    } catch (error) {
      console.error('Error reading file:', error);
      setIsAnalyzing(false);
      alert('Wystąpił błąd podczas czytania pliku. Spróbuj ponownie.');
    }
  };

  // Memoizowane funkcje callback
  const handleAnalysisComplete = useCallback(({ bpm, key }) => {
    setBpm(bpm);
    setKey(key);
    console.log('Analysis complete:', { bpm, key });
    // Zwiększone opóźnienie, aby pozwolić na zakończenie animacji
    setTimeout(() => {
      setIsAnalyzing(false); // Zatrzymaj analizę
      setAnalysisStarted(false); // Odmontuj AnalyzeOnUpload
    }, 500); // Opóźnienie 500ms
  }, []);

  const handleAnalysisError = useCallback((error) => {
    console.error('Error during analysis:', error);
    setIsAnalyzing(false);
    setAnalysisStarted(false);
    alert('Wystąpił błąd podczas analizy pliku. Spróbuj ponownie.');
  }, []);

  // Obsługa przesyłania pliku
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFile && bpm && key) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('bpm', bpm);
      formData.append('key', key);

      try {
        const response = await axios.post('/api/files/upload', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          console.log('File uploaded:', response.data);

          // Zaktualizuj listę plików
          updateDirectories();
          onClose(); // Zamknij modal po sukcesie
        } else {
          console.error('Error uploading file:', response.data);
          alert('Błąd wgrywania pliku na serwer.');
        }
      } catch (error) {
        console.error('Server error:', error);
        alert('Wystąpił błąd podczas przesyłania pliku. Spróbuj ponownie.');
      }
    } else {
      alert('Proszę wybrać plik i poczekać na zakończenie analizy.');
    }
  };

  return (
    isOpen && (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>Wgraj plik</h2>
          <form onSubmit={handleSubmit}>
            <input type="file" accept=".mp3,.wav" onChange={handleFileChange} />

            {/* Komponent AnalyzeOnUpload */}
            {analysisStarted && arrayBufferRef.current && (
              <AnalyzeOnUpload
                arrayBuffer={arrayBufferRef.current}
                onComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            )}

            {/* Spinner i animowane kropki zamiast paska postępu */}
            {isAnalyzing && <LoadingAnimation />}

            {/* Wyświetlanie wyników analizy */}
            {bpm && key && (
              <div className={styles.analysisResults}>
                <p>BPM: {bpm ? Math.trunc(bpm) : 'Nieznane'}</p>
                <p>Tonacja: {key}</p>
              </div>
            )}

            {/* Przyciski */}
            {/* Przycisk "Dodaj plik" pojawia się tylko po analizie */}
            {bpm && key && (
              <button type="submit" className={styles.uploadButton}>
                Dodaj plik
              </button>
            )}
            <button type="button" onClick={onClose} className={styles.closeButton}>
              Anuluj
            </button>
          </form>
        </div>
      </div>
    )
  );
};

export default AddFileModal;

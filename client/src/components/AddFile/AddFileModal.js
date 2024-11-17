// src/components/AddFileModal/AddFileModal.js

import React, { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import AnalyzeOnUpload from '../AnalyzeOnUpload/AnalyzeOnUpload';
import LoadingAnimation from '../LoadingAnimation/LoadingAnimation';
import styles from './AddFileModal.module.scss';
import UploadIcon from '@mui/icons-material/Upload';

const AddFileModal = ({ isOpen, onClose, updateDirectories }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const arrayBufferRef = useRef(null);
  const [bpm, setBpm] = useState(null);
  const [key, setKey] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);

  // Obsługa zmiany pliku
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (isAnalyzing) {
      alert('Analiza jest już w toku.');
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    setBpm(null);
    setKey(null);
    setIsAnalyzing(true);
    setAnalysisStarted(false);
    setAnalysisCompleted(false);

    try {
      const buffer = await file.arrayBuffer();
      arrayBufferRef.current = buffer.slice(0);
      setAnalysisStarted(true);
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
    setAnalysisCompleted(true);
    console.log('Analysis complete:', { bpm, key });
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStarted(false);
    }, 500);
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
          updateDirectories();
          onClose();
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
          <h2>Dodaj utwór</h2>
          <form onSubmit={handleSubmit}>
            {/* Ukryty input typu file */}
            <input
              type="file"
              id="fileInput"
              accept=".mp3,.wav"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            {/* Etykieta działająca jako przycisk */}
            <label htmlFor="fileInput" className={styles.customFileUpload}>
              <UploadIcon className={styles.uploadIcon} />
              <span className={styles.uploadText}>
                Wybierz plik
              </span>
            </label>
            {/* Kontener wyników analizy */}
            <div className={styles.analysisContainer}>
              {/* Sekcja Plik */}
              <div className={styles.analysisRow}>
                <span className={styles.label}>Plik: </span>
                <span className={styles.value}>{fileName || 'Brak wybranego pliku'}</span>
              </div>
              {/* Kontener Statusu Analizy */}
              <div className={styles.analysisStatusContainer}>
                {isAnalyzing && selectedFile ? (
                  <>
                    <LoadingAnimation />
                  </>
                ) : analysisCompleted ? (
                  <span className={styles.analysisCompleted}>Analiza zakończona</span>
                ) : null}
              </div>
              {/* Sekcja BPM */}
              <div className={styles.analysisRow}>
                <span className={styles.label}>BPM:</span>
                <span className={styles.value}>
                  {isAnalyzing && selectedFile ? (
                    '---'
                  ) : bpm ? (
                    Math.trunc(bpm)
                  ) : (
                    '-'
                  )}
                </span>
              </div>
              {/* Sekcja Tonacja */}
              <div className={styles.analysisRow}>
                <span className={styles.label}>Tonacja:</span>
                <span className={styles.value}>
                  {isAnalyzing && selectedFile ? (
                    '---'
                  ) : key ? (
                    key
                  ) : (
                    '-'
                  )}
                </span>
              </div>
             
              {/* Komponent AnalyzeOnUpload */}
              {analysisStarted && arrayBufferRef.current && (
                <AnalyzeOnUpload
                  arrayBuffer={arrayBufferRef.current}
                  onComplete={handleAnalysisComplete}
                  onError={handleAnalysisError}
                />
              )}
            </div>
            {/* Przyciski */}
            <div className={styles.buttonContainer}>
              <button
                type="submit"
                className={`${styles.button} ${styles.uploadButton}`}
                disabled={!bpm || !key}
              >
                Dodaj plik
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`${styles.button} ${styles.closeButton}`}
              >
                Anuluj
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default AddFileModal;

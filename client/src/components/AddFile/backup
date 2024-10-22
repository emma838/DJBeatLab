// AddFileModal.js - Komponent do wgrywania plików użytkownika
// Opis: Komponent `AddFileModal` umożliwia użytkownikowi wgrywanie plików audio (mp3, wav). Po poprawnym wgraniu pliku komponent zamyka modal i aktualizuje listę plików w głównym zarządzaniu plikami.

import React, { useState } from 'react';
import axios from 'axios'; // Import Axios
import styles from './AddFileModal.module.scss';

const AddFileModal = ({ isOpen, onClose, updateDirectories }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]); // Zapisz wybrany plik
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFile) {
      const formData = new FormData();
      formData.append('file', selectedFile);
  
      try {
        const response = await axios.post('/api/files/upload', formData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data',
          },
        });
  
        if (response.status === 200) {
          console.log('Plik wgrany:', response.data);
  
          // Zaktualizuj listę plików
          updateDirectories((prev) => ({
            ...prev,
            uploaded: [...prev.uploaded, selectedFile.name], // Dodaj nowy plik
          }));
          onClose(); // Zamknij modal po sukcesie
        } else {
          console.error('Błąd wgrywania pliku:', response.data);
        }
      } catch (error) {
        console.error('Błąd serwera', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Wgraj plik</h2>
        <form onSubmit={handleSubmit}>
          <input type="file" accept=".mp3,.wav" onChange={handleFileChange} />
          <button type="submit" className={styles.uploadButton}>Dodaj plik</button>
          <button type="button" onClick={onClose} className={styles.closeButton}>Anuluj</button>
        </form>
      </div>
    </div>
  );
};

export default AddFileModal;
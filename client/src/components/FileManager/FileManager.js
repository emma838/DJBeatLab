// FileManager.js - Komponent do zarządzania plikami i playlistami użytkownika
// Opis: Komponent `FileManager` umożliwia użytkownikowi przeglądanie i zarządzanie plikami (wgranymi, nagranymi) oraz playlistami.
// Użytkownik może dodać nowe pliki oraz playlisty, a także zmieniać nazwy istniejących playlist.

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Użycie Axios do komunikacji z backendem
import AddFileModal from '../AddFile/AddFileModal';
import ManagePlaylist from '../ManagePlaylist/ManagePlaylist';
import styles from './FileManager.module.scss';

const FileManager = () => {
  const [directories, setDirectories] = useState({
    uploaded: [],
    recorded: []
  });

  const [playlists, setPlaylists] = useState([]);
  const [isUploadedOpen, setIsUploadedOpen] = useState(true);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);

  const toggleUploaded = () => setIsUploadedOpen(!isUploadedOpen);

  const openAddFile = () => setIsAddFileOpen(true);
  const closeAddFile = () => setIsAddFileOpen(false);

  // Funkcja do pobierania plików z backendu
  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('/api/files/uploaded', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 200) {
        setDirectories((prev) => ({
          ...prev,
          uploaded: response.data.files, // Zaktualizuj listę plików
        }));
      }
    } catch (err) {
      console.error('Błąd serwera przy pobieraniu plików:', err);
    }
  };

  // Funkcja do pobierania playlist
const fetchPlaylists = async () => {
  try {
    const response = await axios.get('/api/playlist/get-playlists', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (response.status === 200) {
      setPlaylists(response.data.playlists); // Załóżmy, że lista playlist jest zwracana jako 'playlists'
    } else {
      console.error('Błąd przy pobieraniu playlist:', response.data);
    }
  } catch (err) {
    console.error('Błąd serwera przy pobieraniu playlist:', err);
  }
};

  // Pobieranie listy plików i playlist przy ładowaniu komponentu
  useEffect(() => {
    fetchUploadedFiles();
    fetchPlaylists();
  }, []);

  // Aktualizacja katalogów po dodaniu nowego pliku
  const updateDirectories = () => {
    fetchUploadedFiles(); // Ponowne pobranie plików po wgraniu
  };

  return (
    <div className={styles.fileManagerContainer}>
      {/* Uploaded Files */}
      <div className={isUploadedOpen ? styles.open : ''}>
        <h3 onClick={toggleUploaded} className={styles.folderHeader}>
          {isUploadedOpen ? '▼' : '►'} Uploaded Files
          <button onClick={openAddFile} className={styles.addButton}>+</button> {/* Przycisk do wgrywania plików */}
        </h3>
        {isUploadedOpen && (
          <ul className={styles.fileList}>
            {directories.uploaded.length > 0 ? (
              directories.uploaded.map((file, index) => (
                <li key={index} className={styles.fileItem}>{file}</li>
              ))
            ) : (
              <li className={styles.emptyItem}>Brak plików wgranych przez użytkownika</li>
            )}
          </ul>
        )}
      </div>

 {/* Playlists */}
 <ManagePlaylist playlists={playlists} setPlaylists={setPlaylists} />

      {/* Recorded */}
      {/* <div className={isRecordedOpen ? styles.open : ''}>
        <h3 onClick={toggleRecorded} className={styles.folderHeader}>
          {isRecordedOpen ? '▼' : '►'} Recorded
        </h3>
        {isRecordedOpen && (
          <ul className={styles.fileList}>
            {directories.recorded.length > 0 ? (
              directories.recorded.map((file, index) => (
                <li key={index} className={styles.fileItem}>{file}</li>
              ))
            ) : (
              <li className={styles.emptyItem}>Brak nagrań</li>
            )}
          </ul>
        )}
      </div> */}

      {/* Modal do wgrywania plików */}
      {isAddFileOpen && <AddFileModal isOpen={isAddFileOpen} onClose={closeAddFile} updateDirectories={updateDirectories} />}
    </div>
  );
};

export default FileManager;

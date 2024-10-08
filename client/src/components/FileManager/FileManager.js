// FileManager.js - Komponent do zarządzania plikami i playlistami użytkownika
// Opis: Komponent `FileManager` umożliwia użytkownikowi przeglądanie i zarządzanie plikami (wgranymi, nagranymi) oraz playlistami.
// Użytkownik może dodać nowe pliki oraz playlisty, a także zmieniać nazwy istniejących playlist.

import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Użycie Axios do komunikacji z backendem
import AddFileModal from '../AddFile/AddFileModal';
import RenameInlineEdit from '../RenameInlineEdit/RenameInlineEdit';
import styles from './FileManager.module.scss';

const FileManager = () => {
  const [directories, setDirectories] = useState({
    uploaded: [],
    playlists: [],
    recorded: []
  });

  const [isUploadedOpen, setIsUploadedOpen] = useState(true);
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(true);
  const [isRecordedOpen, setIsRecordedOpen] = useState(true);
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);

  const toggleUploaded = () => setIsUploadedOpen(!isUploadedOpen);
  const togglePlaylists = () => setIsPlaylistsOpen(!isPlaylistsOpen);
  const toggleRecorded = () => setIsRecordedOpen(!isRecordedOpen);

  // Otwieranie i zamykanie modala do wgrywania plików
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

  // Pobieranie listy plików i playlist przy ładowaniu komponentu
  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // Aktualizacja katalogów po dodaniu nowego pliku
  const updateDirectories = () => {
    fetchUploadedFiles(); // Ponowne pobranie plików po wgraniu
  };

  // Dodawanie nowej playlisty
  const addPlaylist = async () => {
    const playlistName = `playlist ${directories.playlists.length + 1}`; // Generuj nazwę playlisty

    try {
      const response = await axios.post('/api/files/playlists', { name: playlistName }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setDirectories((prev) => ({
          ...prev,
          playlists: [...prev.playlists, response.data.playlist],
        }));
      } else {
        console.error('Błąd tworzenia playlisty');
      }
    } catch (error) {
      console.error('Błąd serwera', error);
    }
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
      <div className={isPlaylistsOpen ? styles.open : ''}>
        <h3 onClick={togglePlaylists} className={styles.folderHeader}>
          {isPlaylistsOpen ? '▼' : '►'} Playlists
          <button onClick={addPlaylist} className={styles.addButton}>+</button> {/* Przycisk do dodawania playlist */}
        </h3>
        {isPlaylistsOpen && (
          <ul className={styles.fileList}>
            {directories.playlists.length > 0 ? (
              directories.playlists.map((playlist, index) => (
                <li key={playlist._id} className={styles.fileItem}>
                  <RenameInlineEdit
                    text={playlist.name}
                    onSave={(newName) => {
                      const updatedPlaylists = [...directories.playlists];
                      updatedPlaylists[index].name = newName;
                      setDirectories((prev) => ({
                        ...prev,
                        playlists: updatedPlaylists,
                      }));
                    }}
                  />
                  <button onClick={() => console.log('Usuń playlistę')} className={styles.deleteButton}>X</button>
                </li>
              ))
            ) : (
              <li className={styles.emptyItem}>Brak playlist</li>
            )}
          </ul>
        )}
      </div>

      {/* Recorded */}
      <div className={isRecordedOpen ? styles.open : ''}>
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
      </div>

      {/* Modal do wgrywania plików */}
      {isAddFileOpen && <AddFileModal isOpen={isAddFileOpen} onClose={closeAddFile} updateDirectories={updateDirectories} />}
    </div>
  );
};

export default FileManager;

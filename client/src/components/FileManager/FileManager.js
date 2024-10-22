import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddFileModal from '../AddFile/AddFileModal';
import styles from './FileManager.module.scss';

const FileManager = ({ selectedPlaylist, onSongAdded }) => {
  const [directories, setDirectories] = useState({
    uploaded: [],
    recorded: []
  });
  const [isAddFileOpen, setIsAddFileOpen] = useState(false);

  const openAddFile = () => setIsAddFileOpen(true);
  const closeAddFile = () => setIsAddFileOpen(false);

  // Funkcja do aktualizacji listy plików
  const updateDirectories = async () => {
    try {
      const response = await axios.get('/api/files/uploaded', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 200) {
        setDirectories((prev) => ({
          ...prev,
          uploaded: response.data.files,
        }));
      }
    } catch (err) {
      console.error('Błąd serwera przy pobieraniu plików:', err);
    }
  };

  // Funkcja do dodawania utworu do playlisty
  const addSongToPlaylist = async (songId) => {
    if (!songId) {
      console.error('songId jest undefined');
      return;
    }

    if (!selectedPlaylist) {
      console.error('selectedPlaylist jest undefined');
      return;
    }

    try {
      const response = await axios.post('/api/playlist/add-song', {
        playlistId: selectedPlaylist,
        songId: songId,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        console.log('Utwór dodany do playlisty:', response.data.playlist);

        if (onSongAdded) {
          onSongAdded();
        }
      } else {
        console.error('Błąd podczas dodawania utworu do playlisty:', response.data);
      }
    } catch (err) {
      console.error('Błąd serwera podczas dodawania utworu do playlisty:', err);
    }
  };

  // Funkcja do usuwania pliku
 // Funkcja do usuwania pliku
const deleteFile = async (songId) => {
  try {
    const response = await axios.delete(`/api/files/delete/${songId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    console.log(response.data.msg); // Sprawdź odpowiedź z serwera

    // Po udanym usunięciu pliku odśwież listę plików
    updateDirectories(); // Odśwież listę plików
  } catch (error) {
    console.error('Błąd podczas usuwania pliku:', error);
  }
};

  

  useEffect(() => {
    updateDirectories(); // Załaduj pliki po załadowaniu komponentu
  }, []);

  return (
    <div className={styles.fileManagerContainer}>
      {/* Uploaded Files */}
      <div className={styles.headerContainer}>
        <h3 className={styles.folderHeader}>
          <div className={styles.folderHeaderLeft}>Uploads</div>
          <div className={styles.folderHeaderRight}>
            <button onClick={openAddFile} className={styles.fileButton}>+</button>
          </div>
        </h3>
      </div>
      <div className={styles.fileListContainer}>
        <ul className={styles.fileList}>
          {directories.uploaded.length > 0 ? (
            directories.uploaded.map((file, index) => (
              <li key={index} className={styles.fileItem}>
                <span
                  onDoubleClick={() => addSongToPlaylist(file._id)}
                  className={styles.fileName}
                >
                  {file.filename}
                </span>
                <button
                  onClick={() => deleteFile(file._id)}
                  className={styles.deleteButton}
                >
                  X
                </button>
              </li>
            ))
          ) : (
            <li className={styles.emptyItem}>Brak plików wgranych przez użytkownika</li>
          )}
        </ul>
      </div>

      {/* Modal do wgrywania plików */}
      {isAddFileOpen && (
        <AddFileModal
          isOpen={isAddFileOpen}
          onClose={closeAddFile}
          updateDirectories={updateDirectories} // Przekazanie funkcji do modala
        />
      )}
    </div>
  );
};

export default FileManager;

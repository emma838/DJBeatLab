import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { addPlaylist, deletePlaylist, renamePlaylist } from '../ManagePlaylist/ManagePlaylist';
import RenameInlineEdit from '../RenameInlineEdit/RenameInlineEdit';
import styles from './PlaylistManager.module.scss';

const PlaylistManager = ({ selectedPlaylist, setSelectedPlaylist, playlistUpdateTrigger }) => { 
  const [playlists, setPlaylists] = useState([]);
  const [editing, setEditing] = useState(false); 
  const [currentPlaylistSongs, setCurrentPlaylistSongs] = useState([]); // Stan dla listy utworów

  // Funkcja pobierająca playlisty z serwera
  const fetchPlaylists = async () => {
    try {
      const response = await axios.get('/api/playlist/get-playlists', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 200) {
        setPlaylists(response.data.playlists);
      }
    } catch (err) {
      console.error('Błąd serwera przy pobieraniu playlist:', err);
    }
  };

  // Funkcja pobierająca wszystkie utwory użytkownika
  const fetchAllSongs = async () => {
    try {
      const response = await axios.get('/api/playlist/all-songs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 200) {
        setCurrentPlaylistSongs(response.data.songs); // Ustawienie wszystkich utworów użytkownika
      }
    } catch (err) {
      console.error('Błąd serwera przy pobieraniu wszystkich utworów użytkownika:', err);
    }
  };

  // Funkcja pobierająca utwory z wybranej playlisty
  const fetchPlaylistSongs = useCallback(async (playlistId) => {
    if (playlistId === 'uploads') {
      fetchAllSongs(); // Jeśli wybrana jest 'uploads', pobierz wszystkie utwory
      return;
    }

    try {
      const response = await axios.get(`/api/playlist/${playlistId}/songs`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.status === 200) {
        setCurrentPlaylistSongs(response.data.songs); // Ustawienie listy utworów dla wybranej playlisty
      }
    } catch (err) {
      console.error('Błąd serwera przy pobieraniu utworów:', err);
    }
  }, []);

  // Funkcja do obsługi dodawania nowej playlisty
  const handleAddPlaylist = async () => {
    const newPlaylist = await addPlaylist(playlists, setPlaylists);
    if (newPlaylist) {
      setSelectedPlaylist(newPlaylist._id); // Automatyczne ustawienie nowej playlisty jako wybranej
    }
  };

  // Funkcja do obsługi usuwania wybranej playlisty
  const handleDeletePlaylist = async () => {
    if (selectedPlaylist !== 'uploads') {
      await deletePlaylist(selectedPlaylist, playlists, setPlaylists);
      setSelectedPlaylist('uploads'); // Po usunięciu playlisty ustawiamy 'uploads' jako domyślną
    }
  };

  // Funkcja do zmiany nazwy wybranej playlisty
  const handleRenamePlaylist = async (newName) => {
    if (selectedPlaylist !== 'uploads' && newName.trim() !== '') {
      await renamePlaylist(selectedPlaylist, newName, playlists, setPlaylists);
      setEditing(false); // Zakończ tryb edycji po zmianie nazwy
    } else {
      alert('Nazwa playlisty nie może być pusta.');
    }
  };

  // Funkcja do anulowania trybu edycji
  const handleCancelEditing = () => {
    setEditing(false);
  };

  const handleRemoveSong = async (songId) => {
    try {
      const response = await axios.post('/api/playlist/remove-song', {
        playlistId: selectedPlaylist, 
        songId: songId, 
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
  
      if (response.status === 200) {
        fetchPlaylistSongs(selectedPlaylist); // Odśwież listę utworów po usunięciu
      }
    } catch (err) {
      console.error('Błąd serwera podczas usuwania utworu z playlisty:', err);
    }
  };

  // Funkcja do formatu czasu w minutach i sekundach
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`; // Dodaj zero, jeśli sekundy są mniejsze niż 10
  };
  
  // Pobierz listę playlist przy załadowaniu komponentu
  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Za każdym razem, gdy zmienia się wybrana playlista lub playlistUpdateTrigger, pobierz jej utwory
  useEffect(() => {
    if (selectedPlaylist) {
      fetchPlaylistSongs(selectedPlaylist);
    }
  }, [selectedPlaylist, playlistUpdateTrigger, fetchPlaylistSongs]);

  return (
    <div className={styles.playlistManagerContainer}>
      <div className={styles.playlistContainer}>
      <div className={styles.topBar}>
        <p>channel</p>
        <p>title</p>
        <p>artist</p>
        <p>duration</p>
        <p>bpm</p>
        <p>key</p>
      </div>

      {/* Zawartość wybranej playlisty */}
      <ul className={styles.playlistContent}>
        {currentPlaylistSongs.length === 0 ? (
          <li>Brak utworów do wyświetlenia</li>
        ) : (
          currentPlaylistSongs.map((song, index) => (
            <li key={index} className={styles.songItem}>
              <div className={styles.songControls}>
                <button className={styles.channelBtn}>1</button> {/* Przycisk 1 */}
                <button className={styles.channelBtn}>2</button> {/* Przycisk 2 */}
              </div>
              <div className={styles.songInfo}>
                <p className={styles.songTitle}>{song.title}</p>
                <p className={styles.songAuthor}>{song.author}</p>
                <p className={styles.songDuration}>{formatDuration(song.duration)}</p>
                <p className={styles.songBpm}>{song.bpm}</p>
                <p className={styles.songKey}>{song.key}</p>
              </div>
              <button className={styles.deleteSongButton} onClick={() => handleRemoveSong(song._id)}>x</button> {/* Przycisk usuń */}
            </li>
          ))
        )}
      </ul>
      </div>
      <div className={styles.settingsContainer}>
      <p>Playlista: </p>
        {/* Lista rozwijana z playlistami */}
        {editing ? (
          <RenameInlineEdit
            initialValue={playlists.find((playlist) => playlist._id === selectedPlaylist)?.name || 'uploads'}
            onRename={handleRenamePlaylist}
            onCancel={handleCancelEditing}  
            autoFocus 
          />
        ) : (
          <select
            className={styles.dropdown}
            value={selectedPlaylist}
            onChange={(e) => setSelectedPlaylist(e.target.value)} 
          >
            <option value="uploads">uploads</option>
            {playlists.map((playlist) => (
              <option key={playlist._id} value={playlist._id}>
                {playlist.name}
              </option>
            ))}
          </select>
        )}

        {/* Przyciski do zarządzania playlistą */}
        <div className={styles.buttons}>
          <button className={styles.editButton} onClick={() => setEditing(true)} disabled={selectedPlaylist === 'uploads'}>
            zmień nazwę
          </button>
          <button className={styles.addButton} onClick={handleAddPlaylist}>dodaj</button>
          <button
            className={styles.deleteButton}
            onClick={handleDeletePlaylist}
            disabled={selectedPlaylist === 'uploads'}
          >
            usuń
          </button>
        </div>
      </div>
    </div>
    
  );
};

export default PlaylistManager;

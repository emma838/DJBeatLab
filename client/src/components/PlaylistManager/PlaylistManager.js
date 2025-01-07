import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { addPlaylist, deletePlaylist, renamePlaylist } from '../ManagePlaylist/ManagePlaylist';
import RenameInlineEdit from '../RenameInlineEdit/RenameInlineEdit';
// import { AudioContext } from '../AudioManager/AudioManager';
import styles from './PlaylistManager.module.scss';
import PlaylistAdd from '@mui/icons-material/PlaylistAdd';
import PlaylistRemove from '@mui/icons-material/PlaylistRemove';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import ArrowDropUp from '@mui/icons-material/ArrowDropUp';
import ArrowDropDown from '@mui/icons-material/ArrowDropDown';
import Tooltip from '../ToolTip/ToolTip';


const PlaylistManager = ({ selectedPlaylist, setSelectedPlaylist, playlistUpdateTrigger, onAssignToDeck, deckAssignments  }) => {
  // const { setCurrentTrack } = useContext(AudioContext);
  const [playlists, setPlaylists] = useState([]);
  const [editing, setEditing] = useState(false);
  const [currentPlaylistSongs, setCurrentPlaylistSongs] = useState([]); // Stan dla listy utworów
  const [sortOrder, setSortOrder] = useState({}); // Stan dla kierunku sortowania

  const camelotColors = {
    "1A": "#00ff00", // Zielony (dla A-Flat Minor)
    "1B": "#66ffcc", // Miętowy (dla B-Major)
    "2A": "#33cccc",
    "2B": "#66ccff",
    "3A": "#0099ff",
    "3B": "#3366ff",
    "4A": "#0000ff",
    "4B": "#6666ff",
    "5A": "#9900cc",
    "5B": "#cc33cc",
    "6A": "#ff00ff",
    "6B": "#ff66cc",
    "7A": "#ff3399",
    "7B": "#ff6699",
    "8A": "#ff3366",
    "8B": "#ff6666",
    "9A": "#ff3300",
    "9B": "#ff6633",
    "10A": "#ff6600",
    "10B": "#ff9933",
    "11A": "#ffcc00",
    "11B": "#ffff33",
    "12A": "#ccff00",
    "12B": "#99ff33"
  };

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
        setCurrentPlaylistSongs(response.data.songs); 
        // Ustawienie wszystkich utworów użytkownika
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
        // const a  = response.data.songs;
        // setCurrentPlaylistSongs(a.sort((a, b) => a.title.localeCompare(b.title)));
        console.log(response.data.songs);
        setCurrentPlaylistSongs(response.data.songs);
        // Ustawienie listy utworów dla wybranej playlisty
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
 // Funkcja sortująca
  const handleSort = (criteria) => {
    console.log('criteria', criteria);
    if (!currentPlaylistSongs || currentPlaylistSongs.length === 0) return;

    // Ustaw domyślny kierunek sortowania na rosnący
    const isAscending = sortOrder[criteria] !== 'asc'; 

    const sortedSongs = [...currentPlaylistSongs].sort((a, b) => {
      const valueA = criteria === 'bpm' ? a[criteria] : a[criteria]?.toString().toLowerCase();
      const valueB = criteria === 'bpm' ? b[criteria] : b[criteria]?.toString().toLowerCase();

      if (valueA < valueB) return isAscending ? -1 : 1;
      if (valueA > valueB) return isAscending ? 1 : -1;
      return 0;
    });

    setCurrentPlaylistSongs(sortedSongs);

    // Zaktualizuj kierunek sortowania
    setSortOrder({
      ...sortOrder,
      [criteria]: isAscending ? 'asc' : 'desc',
    });
  };
  
  // Funkcja do formatu czasu w minutach i sekundach
  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`; // Dodaj zero, jeśli sekundy są mniejsze niż 10
  };

  // Funkcja do przypisywania utworu do decka i ustawienia go jako aktualny utwór
  // const handleAssignToDeck = (deckNumber, song) => {
  //   const trackUrl = `/api/audio/${song.user}/uploaded/${encodeURIComponent(song.filename)}`;
  //   setCurrentTrack(deckNumber, { ...song, url: trackUrl, title: song.title, author: song.author });
  // };

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
      <div className={styles.settingsContainer}>
        <p className={styles.settingsTitle}>Playlists</p>
        <Tooltip
  className={styles.tooltip}
  style={{ top: "12px", right: "10px", width: "15px", height: "15px" }}
  bubbleBgColor="#f1f1f1"
  iconColor="#000"
  position = "right"
  image="camelotImage"
  title="PLAYLISTS"
  text="<strong>Edit:</strong> - change selected playlist name</br>
  <strong>Add:</strong> - create new playlist</br>
  <strong>Delete:</strong> - delete selected playlist</br>
  <strong>Deck:</strong> - choose deck to inser song to</br>
  <strong>Key:</strong> - key notation of a song in Camelot system</br>"
/>
        <div className={styles.settingsContent}>
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
            <option value="uploads">All songs</option>
            {playlists.map((playlist) => (
              <option key={playlist._id} value={playlist._id}>
                {playlist.name}
              </option>
            ))}
          </select>
        )}

        {/* Przyciski do zarządzania playlistą */}
          <button className={styles.editButton} onClick={() => setEditing(true)} disabled={selectedPlaylist === 'uploads'}>
            <Edit />Edit
          </button>
          <button className={styles.addButton} onClick={handleAddPlaylist}><PlaylistAdd />Add</button>
          <button
            className={styles.deleteButton}
            onClick={handleDeletePlaylist}
            disabled={selectedPlaylist === 'uploads'}
          >
          <PlaylistRemove />Delete
          </button>
        </div>
      </div>
      <div className={styles.playlistContainer}>
      <div className={styles.topBar}>
      <p >Deck</p>
  <p onClick={() => handleSort('title')}>
    Title
    {sortOrder['title'] === 'asc' && <ArrowDropUp />}
    {sortOrder['title'] === 'desc' && <ArrowDropDown />}
  </p>
  <p onClick={() => handleSort('author')}>
    Artist
    {sortOrder['artist'] === 'asc' && <ArrowDropUp />}
    {sortOrder['artist'] === 'desc' && <ArrowDropDown />}
  </p>
  <p>Time</p>
  <p onClick={() => handleSort('bpm')}>
    BPM
    {sortOrder['bpm'] === 'asc' && <ArrowDropUp />}
    {sortOrder['bpm'] === 'desc' && <ArrowDropDown />}
  </p>
  <p onClick={() => handleSort('key')}>
    KEY
    {sortOrder['key'] === 'asc' && <ArrowDropUp />}
    {sortOrder['key'] === 'desc' && <ArrowDropDown />}
  </p>
  <p></p>
</div>

        {/* Zawartość wybranej playlisty */}
        <ul className={styles.playlistContent}>
          {currentPlaylistSongs.length === 0 ? (
            <li className={styles.emptyPlaylist}>Playlist is empty. To add a track, double-click on a selected file in uploaded tracks library.</li>
          ) : (
            currentPlaylistSongs.map((song, index) => (
              <li key={index} className={styles.songItem}>
                <div className={styles.songControls}>
                <button className={`${styles.channelBtn} ${deckAssignments[1] === song._id ? styles.active : ''}`} onClick={() => onAssignToDeck(1, song)}>1</button>
                <button className={`${styles.channelBtn} ${deckAssignments[2] === song._id ? styles.active : ''}`} onClick={() => onAssignToDeck(2, song)}>2</button>
                </div>
          
                  <p className={styles.songTitle}>{song.title}</p>
                  <p className={styles.songAuthor}>{song.author}</p>
                  <p className={styles.songDuration}>{formatDuration(song.duration)}</p>
                  <p className={styles.songBpm}>{song.bpm}</p>
                  <p
  className={styles.songKey}
  style={{ color: camelotColors[song.key] || "#000" }} // Domyślny kolor czarny
>
  {song.key}
</p>
                {/* Renderuj pusty element zamiast przycisku, jeśli wybrano 'uploads' */}
        {selectedPlaylist === 'uploads' ? (
          <div className={styles.deleteSongButton}> </div>
        ) : (
          <button
            className={styles.deleteSongButton}
            onClick={() => handleRemoveSong(song._id)}
          >
            <Delete />
          </button>
        )}
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default PlaylistManager;

import React from 'react';
import axios from 'axios';
import RenameInlineEdit from '../RenameInlineEdit/RenameInlineEdit';
import styles from './ManagePlaylist.module.scss';

const AddPlaylist = ({ playlists, setPlaylists }) => {
  // Funkcja dodająca nową playlistę
  const addPlaylist = async () => {
    const playlistName = `playlist ${playlists.length + 1}`; // Domyślna nazwa playlisty

    try {
      const response = await axios.post('/api/playlist/create', { name: playlistName }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201) {
        setPlaylists([...playlists, response.data.playlist]);
      } else {
        console.error('Błąd tworzenia playlisty');
      }
    } catch (error) {
      console.error('Błąd serwera', error);
    }
  };

  // Funkcja do zmiany nazwy playlisty
  const renamePlaylist = async (playlistId, newName) => {
    try {
      const response = await axios.put(`/api/playlist/${playlistId}/rename`, { name: newName }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        setPlaylists(playlists.map((playlist) => 
          playlist._id === playlistId ? { ...playlist, name: newName } : playlist
        ));
      } else {
        console.error('Błąd podczas zmiany nazwy playlisty');
      }
    } catch (error) {
      console.error('Błąd serwera', error);
    }
  };

  // Funkcja do usuwania playlisty
  const deletePlaylist = async (playlistId) => {
    try {
      const response = await axios.delete(`/api/playlist/delete/${playlistId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.status === 200) {
        setPlaylists(playlists.filter((playlist) => playlist._id !== playlistId));
      } else {
        console.error('Błąd usuwania playlisty');
      }
    } catch (error) {
      console.error('Błąd serwera', error);
    }
  };

  return (
    <div className={styles.playlistContainer}>
      <h3 className={styles.folderHeader}>
        Playlists
        <button onClick={addPlaylist} className={styles.addButton}>+</button>
      </h3>
      <ul className={styles.fileList}>
        {playlists.length > 0 ? (
          playlists.map((playlist) => (
            <li key={playlist._id} className={styles.fileItem}>
              <RenameInlineEdit
                initialValue={playlist.name}
                onRename={(newName) => renamePlaylist(playlist._id, newName)}
              />
              <button onClick={() => deletePlaylist(playlist._id)} className={styles.deleteButton}>X</button>
            </li>
          ))
        ) : (
          <li className={styles.emptyItem}>Brak playlist</li>
        )}
      </ul>
    </div>
  );
};

export default AddPlaylist;

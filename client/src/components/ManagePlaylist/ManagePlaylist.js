import axios from 'axios';

// Funkcja dodająca nową playlistę
export const addPlaylist = async (playlists, setPlaylists) => {
  const playlistName = `playlist ${playlists.length + 1}`; // Domyślna nazwa playlisty

  try {
    const response = await axios.post('/api/playlist/create', { name: playlistName }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201) {
      const newPlaylist = response.data.playlist;
      setPlaylists([...playlists, newPlaylist]); // Aktualizujemy stan z nową playlistą
      return newPlaylist; // Zwracamy nowo dodaną playlistę
    } else {
      console.error('Błąd tworzenia playlisty');
      return null;
    }
  } catch (error) {
    console.error('Błąd serwera', error);
    return null;
  }
};

// Funkcja do zmiany nazwy playlisty
export const renamePlaylist = async (playlistId, newName, playlists, setPlaylists) => {
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
export const deletePlaylist = async (playlistId, playlists, setPlaylists) => {
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

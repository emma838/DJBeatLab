import React from 'react';
import styles from './SongTabs.module.scss';

const SongTabs = ({ openTabs, closeTab }) => {
  if (!openTabs || !Array.isArray(openTabs)) {
    // Jeśli openTabs jest niezdefiniowane lub nie jest tablicą, zwracamy pusty komponent
    return <div className={styles.tabsContainer}>Brak otwartych zakładek.</div>;
  }

  return (
    <div className={styles.tabsContainer}>
      {openTabs.map((tab, index) => (
        <div key={index} className={styles.tab}>
          <div className={styles.tabHeader}>
            <span>{tab.folderName}</span>
            <button onClick={() => closeTab(index)}>X</button>
          </div>
          <div className={styles.songList}>
            {tab.songs && tab.songs.length > 0 ? (
              tab.songs.map((song) => (
                <div key={song._id} className={styles.songRow}>
                  <button>1</button>
                  <button>2</button>
                  <span>{song.title}</span>
                  <span>{song.author}</span>
                  <span>{song.duration}</span>
                  <span>{song.bpm}</span>
                  <span>{song.key}</span>
                </div>
              ))
            ) : (
              <div className={styles.emptyList}>Brak utworów w tym folderze.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SongTabs;

import React from 'react';
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace.js';
import FileManager from '../../components/FileManager/FileManager'; // Import komponentu FileManager
import styles from './Workspace.module.scss'; // Importowanie modułów CSS jako obiekt

const Workspace = () => {

  return (
    <div className={styles.workspace}> {/* Używamy dynamicznych klas */}
      <Header/>

      {/* Sekcja pomiędzy nagłówkiem a narzędziami */}
      <section className={styles.intermediateSection}>
        <h2>Sekcja pomiędzy nagłówkiem a narzędziami</h2>
      </section>

      {/* Pasek na narzędzia */}
      <section className={styles.toolbar}>
        <div className={styles.leftSection}>Lewa sekcja (35%)</div>
        <div className={styles.middleSection}>Środkowa sekcja (30%)</div>
        <div className={styles.rightSection}>Prawa sekcja (35%)</div>
      </section>

      {/* Sekcja na podgląd plików */}
      <section className={styles.filePreview}>
        <div className={styles.fileList}>
          {/* Tutaj dodajemy nasz komponent FileManager */}
          <FileManager /> {/* Komponent zarządzania plikami */}
        </div>
        <div className={styles.fileDetails}>
          Prawa sekcja (80%) {/* Możesz później w tej sekcji wyświetlać szczegóły wybranego pliku */}
        </div>
      </section>
    </div>
  );
};

export default Workspace;
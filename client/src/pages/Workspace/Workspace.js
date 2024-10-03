import React from 'react';
import Header from '../../components/Headers/HeaderWorkspace/HeaderWorkspace.js';
import styles from './Workspace.module.scss'; // Importowanie modułów CSS jako obiekt

const Workspace = () => {
  const username = "DJ_Example";
  const avatar = "/path/to/avatar.png";

  return (
    <div className={styles.workspace}> {/* Używamy dynamicznych klas */}
      <Header username={username} avatar={avatar} />

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
        <div className={styles.fileList}>Lewa sekcja (20%)</div>
        <div className={styles.fileDetails}>Prawa sekcja (80%)</div>
      </section>
    </div>
  );
};

export default Workspace;

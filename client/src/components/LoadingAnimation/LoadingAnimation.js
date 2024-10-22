// src/components/LoadingAnimation/LoadingAnimation.js

import React from 'react';
import styles from './LoadingAnimation.module.scss';

const LoadingAnimation = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <div className={styles.loadingText}>
        Wgrywanie pliku
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};

export default LoadingAnimation;

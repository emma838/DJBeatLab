// src/components/LoadingAnimation/LoadingAnimation.js

import React from 'react';
import styles from './LoadingAnimation.module.scss';

const LoadingAnimation = () => {
  return (
    <div className={styles.loadingContainer}>
<div className={styles.spinner}></div>
      <div className={styles.loadingText}>
      Analyzing track 
      </div>
    </div>
  );
};

export default LoadingAnimation;

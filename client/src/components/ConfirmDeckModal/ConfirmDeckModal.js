// ConfirmLoadModal.js
import React from 'react';
import styles from './ConfirmDeckModal.module.scss';

const ConfirmLoadModal = ({ deckNumber, onConfirm, onCancel }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.alert}>
        <h2>
          Track is currently playing on deck {deckNumber}.
        </h2>
        <h2>
          Are you sure you want to load a new track?
        </h2>
        </div>
        <div className={styles.buttonContainer}>
          <button  className={`${styles.button} ${styles.confirmButton}`} onClick={onConfirm}>
            Load track
          </button>
          <button  className={`${styles.button} ${styles.cancelButton}`} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLoadModal;

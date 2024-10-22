import React, { useState } from 'react';
import styles from './RenameInlineEdit.module.scss';

const RenameInlineEdit = ({ initialValue, onRename, onCancel, autoFocus }) => {
  const [value, setValue] = useState(initialValue);

  const handleRename = () => {
    onRename(value); // Wywołanie funkcji zmieniającej nazwę
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleRename(); // Zatwierdzenie zmiany nazwy po Enter
    } else if (e.key === 'Escape') {
      onCancel(); // Anulowanie edycji po Escape
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleRename} // Zatwierdzenie zmiany po opuszczeniu pola
      onKeyDown={handleKeyDown} // Obsługa Enter i Escape
      className={styles.renameInput}
      autoFocus={autoFocus} // Automatyczne focusowanie pola
    />
  );
};

export default RenameInlineEdit;

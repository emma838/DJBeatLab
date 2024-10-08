import React, { useState } from 'react';
// import styles from './RenameInlineEdit.module.scss';

const RenameInlineEdit = ({ initialValue, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleRename = () => {
    setIsEditing(false);
    onRename(value);
  };

  return isEditing ? (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleRename}
      autoFocus
    />
  ) : (
    <span onDoubleClick={() => setIsEditing(true)}>{value}</span>
  );
};

export default RenameInlineEdit;

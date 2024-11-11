import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Knob.module.scss';

const Knob = ({ value = 0, min = 0, max = 100, step = 1, onChange, label = '' }) => {
  const knobRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const validatedValue = isNaN(value) ? min : value;

  useEffect(() => {
    const angleRange = 270;
    const normalizedValue = (validatedValue - min) / (max - min);
    const newAngle = normalizedValue * angleRange - 135;
    setAngle(newAngle);
  }, [validatedValue, min, max]);

  const startY = useRef(null);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaY = startY.current - e.clientY;
    const sensitivity = 0.1;
    let newValue = validatedValue + deltaY * sensitivity;
    newValue = Math.min(max, Math.max(min, newValue));
    onChange(newValue);

    startY.current = e.clientY;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? step : -step;
    let newValue = validatedValue + delta;
    newValue = Math.min(max, Math.max(min, newValue));
    onChange(newValue);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className={styles.knobContainer}>
      {label && <div className={styles.label}>{label}</div>}
      <svg
        ref={knobRef}
        className={styles.knob}
        width="100"
        height="100"
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        <circle cx="50" cy="50" r="15" stroke="#ccc" strokeWidth="5" fill="#fff" />
        <line
          x1="50"
          y1="50"
          x2={50 + 40 * Math.cos((angle - 90) * (Math.PI / 180))}
          y2={50 + 40 * Math.sin((angle - 90) * (Math.PI / 180))}
          stroke="#333"
          strokeWidth="4"
        />
        <text x="50" y="90" textAnchor="middle" fontSize="12">
          {Math.round(validatedValue)}
        </text>
      </svg>
    </div>
  );
};

Knob.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
};

export default Knob;

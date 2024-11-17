import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './Knob.module.scss';

const Knob = ({
  value,
  defaultValue = 0,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  label = '',
  showScale = true,
  numTicks,
  tickSize = 1,
  tickColor = '#050404',
  tickOffset = 5,
  pointerLength = 15,
  pointerWidth = 4,
  pointerColor = '#FF4C1A',
  pointerLinecap = 'round',
  ...otherProps
}) => {
  const knobRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const startValue = useRef(0);
  const startY = useRef(0);

  const currentValue = value !== undefined ? value : internalValue;
  const validatedValue = isNaN(currentValue) ? min : currentValue;

  useEffect(() => {
    const angleRange = 270; 
    const normalizedValue = (validatedValue - min) / (max - min);
    const newAngle = normalizedValue * angleRange - 135;
    setAngle(newAngle);
  }, [validatedValue, min, max]);

  const updateValue = (newValue) => {
    newValue = Math.min(max, Math.max(min, newValue));
    newValue = Math.round(newValue / step) * step;

    if (onChange) {
      onChange(newValue);
    }
    if (value === undefined) {
      setInternalValue(newValue);
    }
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    startValue.current = validatedValue;
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaY = startY.current - e.clientY;
    const sensitivity = (max - min) / 100;
    const newValue = startValue.current + deltaY * sensitivity;

    updateValue(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -step : step;
    updateValue(validatedValue + delta);
  };

  useEffect(() => {
    const knobElement = knobRef.current;

    if (knobElement) {
      knobElement.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (knobElement) {
        knobElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, [validatedValue, handleWheel]);

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

  const totalTicks = numTicks || Math.floor((max - min) / step) + 1;
  const angleRange = 270;
  const startAngle = -135;

  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    const ratio = i / (totalTicks - 1);
    const tickAngle = startAngle + ratio * angleRange;
    ticks.push(tickAngle);
  }

  const svgSize = 60;
  const knobRadius = 20;
  const center = svgSize / 2;

  return (
    <div className={styles.knobContainer}>
      {label && <div className={styles.label}>{label}</div>}
      <svg
        ref={knobRef}
        className={styles.knob}
        width={svgSize}
        height={svgSize}
        onMouseDown={handleMouseDown}
        {...otherProps}
      >
        <g className={styles.scale}>
          {showScale &&
            ticks.map((tickAngle, index) => {
              const outerRadius = knobRadius + tickSize + tickOffset;
              const x =
                center +
                outerRadius * Math.cos((tickAngle - 90) * (Math.PI / 180));
              const y =
                center +
                outerRadius * Math.sin((tickAngle - 90) * (Math.PI / 180));
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r={tickSize}
                  fill={tickColor}
                />
              );
            })}
        </g>
        <circle
          cx={center}
          cy={center}
          r={knobRadius}
          stroke="#e4dbdb"
          strokeWidth="3"
          fill="#050404"
        />
        <line
          x1={center}
          y1={center}
          x2={
            center +
            (knobRadius - pointerWidth / 2) *
              Math.cos((angle - 90) * (Math.PI / 180))
          }
          y2={
            center +
            (knobRadius - pointerWidth / 2) *
              Math.sin((angle - 90) * (Math.PI / 180))
          }
          stroke={pointerColor}
          strokeWidth={pointerWidth}
          strokeLinecap={pointerLinecap}
        />
      </svg>
      <div className={styles.valueDisplay}>{validatedValue.toFixed(1)}</div>
    </div>
  );
};

Knob.propTypes = {
  value: PropTypes.number,
  defaultValue: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  label: PropTypes.string,
  showScale: PropTypes.bool,
  numTicks: PropTypes.number,
  tickSize: PropTypes.number,
  tickColor: PropTypes.string,
  tickOffset: PropTypes.number,
  pointerLength: PropTypes.number,
  pointerWidth: PropTypes.number,
  pointerColor: PropTypes.string,
  pointerLinecap: PropTypes.string,
};

export default Knob;

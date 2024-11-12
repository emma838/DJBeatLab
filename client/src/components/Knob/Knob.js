// src/components/Knob/Knob.js

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
  tickSize = 1, // Rozmiar kropek
  tickColor = '#050404',
  tickOffset = 5, // Domyślna wartość
  pointerLength = 15,
  pointerWidth = 4,
  pointerColor = '#FF4C1A',
  pointerLinecap = 'round',
  ...otherProps
}) => {
  const knobRef = useRef(null);
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Stan wewnętrzny dla niekontrolowanego komponentu
  const [internalValue, setInternalValue] = useState(defaultValue);

  // Określenie aktualnej wartości
  const currentValue = value !== undefined ? value : internalValue;

  // Walidacja wartości
  const validatedValue = isNaN(currentValue) ? min : currentValue;

  // Aktualizacja kąta na podstawie wartości
  useEffect(() => {
    const angleRange = 270; // Zakres kąta obrotu knoba
    const normalizedValue = (validatedValue - min) / (max - min);
    const newAngle = normalizedValue * angleRange - 135; // Od -135 do +135 stopni
    setAngle(newAngle);
  }, [validatedValue, min, max]);

  const startY = useRef(null);

  // Obsługa rozpoczęcia przeciągania
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
  };

  // Obsługa zakończenia przeciągania
  const handleMouseUp = () => setIsDragging(false);

  // Obsługa przeciągania myszką
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const deltaY = startY.current - e.clientY;
    const sensitivity = (max - min) / 100; // Dostosowanie czułości do zakresu
    let newValue = validatedValue + deltaY * sensitivity;
    newValue = Math.min(max, Math.max(min, newValue));

    // Zaokrąglij do najbliższego kroku
    newValue = Math.round(newValue / step) * step;

    // Aktualizacja wartości
    if (onChange) {
      onChange(newValue);
    }
    if (value === undefined) {
      setInternalValue(newValue);
    }

    startY.current = e.clientY;
  };

  // Obsługa przewijania kółkiem myszy
  const handleWheel = (e) => {
    e.preventDefault(); // Zapobieganie przewijaniu strony
    const delta = e.deltaY < 0 ? step : -step;
    let newValue = validatedValue + delta;
    newValue = Math.min(max, Math.max(min, newValue));

    // Zaokrąglij do najbliższego kroku
    newValue = Math.round(newValue / step) * step;

    // Aktualizacja wartości
    if (onChange) {
      onChange(newValue);
    }
    if (value === undefined) {
      setInternalValue(newValue);
    }
  };

  // Dodawanie i usuwanie nasłuchiwania zdarzeń dla kółka myszy
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
  }, [handleWheel]);

  // Dodawanie i usuwanie nasłuchiwania zdarzeń dla przeciągania
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

  // Obliczanie znaczników skali
  const totalTicks = numTicks || Math.floor((max - min) / step) + 1;
  const angleRange = 270; // Zakres kątów od -135 do +135 stopni
  const startAngle = -135;

  const ticks = [];
  for (let i = 0; i < totalTicks; i++) {
    const ratio = i / (totalTicks - 1);
    const tickAngle = startAngle + ratio * angleRange;
    ticks.push(tickAngle);
  }

  // Dostosowanie rozmiaru knoba (możesz zmienić te wartości według potrzeb)
  const svgSize = 60; // Rozmiar SVG
  const knobRadius = 20; // Promień knoba
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
      >
        {/* Rysowanie kropek skali */}
        <g className={styles.scale}>
          {showScale &&
            ticks.map((tickAngle, index) => {
              const outerRadius = knobRadius + tickSize + tickOffset; // Użycie tickOffset
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
        {/* Rysowanie głównego koła */}
        <circle
          cx={center}
          cy={center}
          r={knobRadius}
          stroke="#e4dbdb"
          strokeWidth="3"
          fill="#050404"
        />
        {/* Wskaźnik knoba */}
        <line
          x1={center}
          y1={center}
          x2={
            center +
            (knobRadius - pointerWidth / 2) * Math.cos((angle - 90) * (Math.PI / 180))
          }
          y2={
            center +
            (knobRadius - pointerWidth / 2) * Math.sin((angle - 90) * (Math.PI / 180))
          }
          stroke={pointerColor}
          strokeWidth={pointerWidth}
          strokeLinecap={pointerLinecap}
        />
      </svg>
      {/* Wyświetlanie aktualnej wartości pod knobem */}
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

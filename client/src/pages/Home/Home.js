// Home.js
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import styles from './Home.module.scss';

// Przykładowe dane karuzeli
const carouselItems = [
  { image: 'https://via.placeholder.com/300x300?text=1', title: 'Tytuł 1', text: 'Opis 1' },
  { image: 'https://via.placeholder.com/300x300?text=2', title: 'Tytuł 2', text: 'Opis 2' },
  { image: 'https://via.placeholder.com/300x300?text=3', title: 'Tytuł 3', text: 'Opis 3' },
  { image: 'https://via.placeholder.com/300x300?text=4', title: 'Tytuł 4', text: 'Opis 4' },
  { image: 'https://via.placeholder.com/300x300?text=5', title: 'Tytuł 5', text: 'Opis 5' },
  // Dodaj więcej elementów w razie potrzeby
];

// Definicja wariantów animacji
const variants = {
  initialLeft: {
    x: '-150%',
    y: 20,
    scale: 0.9,
    opacity: 0.7,
    filter: 'blur(2px)',
  },
  animateLeft: {
    x: '-100%',
    y: 20,
    scale: 0.95,
    opacity: 0.85,
    filter: 'blur(1px)',
    transition: { duration: 0.5 },
  },
  initialCenter: {
    x: '0%',
    y: 0,
    scale: 1,
    opacity: 1,
    filter: 'none',
  },
  animateCenter: {
    x: '0%',
    y: 0,
    scale: 1.05,
    opacity: 1,
    filter: 'none',
    transition: { duration: 0.5 },
  },
  initialRight: {
    x: '150%',
    y: 20,
    scale: 0.9,
    opacity: 0.7,
    filter: 'blur(2px)',
  },
  animateRight: {
    x: '100%',
    y: 20,
    scale: 0.95,
    opacity: 0.85,
    filter: 'blur(1px)',
    transition: { duration: 0.5 },
  },
};

const Carousel = () => {
  const [current, setCurrent] = useState(0);
  const length = carouselItems.length;
  const timeoutRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [tiles, setTiles] = useState({
    left: length - 1,
    center: 0,
    right: 1,
  });

  // Funkcja do resetowania timera
  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  // Ustawienie automatycznego przewijania co 5 sekund
  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      nextSlide();
    }, 5000);

    return () => {
      resetTimeout();
    };
  }, [current]);

  // Funkcja do zmiany slajdu w prawo
  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    setTiles({
      left: current,
      center: (current + 1) % length,
      right: (current + 2) % length,
    });
  };

  // Funkcja do zmiany slajdu w lewo
  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent((prev) => (prev === 0 ? length - 1 : prev - 1));
    setTiles({
      left: (current - 1 + length) % length,
      center: current,
      right: (current + 1) % length,
    });
  };

  // Funkcja wywoływana po zakończeniu animacji
  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  return (
    <div className={styles.carouselContainer}>
      {/* Kafelek lewy */}
      <motion.div
        className={`${styles.carouselItem} ${styles.left}`}
        initial="initialLeft"
        animate="animateLeft"
        variants={variants}
        onAnimationComplete={handleAnimationComplete}
        onClick={prevSlide}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(event, info) => {
          if (info.offset.x > 100) {
            prevSlide();
          }
        }}
      >
        <img
          src={carouselItems[tiles.left].image}
          alt={carouselItems[tiles.left].title}
          className={styles.image}
          loading="lazy"
        />
        <h3 className={styles.title}>{carouselItems[tiles.left].title}</h3>
        <p className={styles.text}>{carouselItems[tiles.left].text}</p>
      </motion.div>

      {/* Kafelek środkowy */}
      <motion.div
        className={`${styles.carouselItem} ${styles.center}`}
        initial="initialCenter"
        animate="animateCenter"
        variants={variants}
        onAnimationComplete={handleAnimationComplete}
        onClick={nextSlide}
      >
        <img
          src={carouselItems[tiles.center].image}
          alt={carouselItems[tiles.center].title}
          className={styles.image}
          loading="lazy"
        />
        <h3 className={styles.title}>{carouselItems[tiles.center].title}</h3>
        <p className={styles.text}>{carouselItems[tiles.center].text}</p>
      </motion.div>

      {/* Kafelek prawy */}
      <motion.div
        className={`${styles.carouselItem} ${styles.right}`}
        initial="initialRight"
        animate="animateRight"
        variants={variants}
        onAnimationComplete={handleAnimationComplete}
        onClick={nextSlide}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={(event, info) => {
          if (info.offset.x < -100) {
            nextSlide();
          }
        }}
      >
        <img
          src={carouselItems[tiles.right].image}
          alt={carouselItems[tiles.right].title}
          className={styles.image}
          loading="lazy"
        />
        <h3 className={styles.title}>{carouselItems[tiles.right].title}</h3>
        <p className={styles.text}>{carouselItems[tiles.right].text}</p>
      </motion.div>
    </div>
  );
};

const Home = () => {
  return (
    <div className={styles.home}>
      <Carousel />
      {/* Inne elementy strony home */}
    </div>
  );
};

export default Home;

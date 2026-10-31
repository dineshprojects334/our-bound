import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  emoji?: string;
}

interface ClickHeart {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

const HEART_EMOJIS = ['💖', '💕', '✨', '🌸', '💗', '⭐', '🤍'];
const COLORS = ['#FF4F9A', '#FFE4EF', '#B8A4FF', '#8067D8', '#E91E63'];

export const BackgroundHearts: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [clickHearts, setClickHearts] = useState<ClickHeart[]>([]);

  useEffect(() => {
    // Generate static floating ambient particles
    const generated: Particle[] = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 18 + 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 5,
      emoji: Math.random() > 0.4 ? HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)] : undefined,
    }));
    setParticles(generated);

    // Global click listener to spawn burst of hearts where user taps/clicks
    const handleClick = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

      if (!clientX && !clientY) return;

      const newHearts: ClickHeart[] = Array.from({ length: 5 }, (_, i) => ({
        id: Date.now() + i + Math.random(),
        x: clientX + (Math.random() * 50 - 25),
        y: clientY + (Math.random() * 40 - 20),
        emoji: HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)],
      }));

      setClickHearts((prev) => [...prev.slice(-15), ...newHearts]);

      setTimeout(() => {
        setClickHearts((prev) => prev.filter((h) => !newHearts.some((nh) => nh.id === h.id)));
      }, 1200);
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Subtle ambient gradient mesh */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-hotpink/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-10 right-1/4 w-[30rem] h-[30rem] bg-purple/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none pointer-events-none"
          initial={{
            x: `${p.x}vw`,
            y: '105vh',
            opacity: 0,
            scale: 0.6,
          }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.7, 0.8, 0],
            scale: [0.6, 1, 1, 0.8],
            x: [`${p.x}vw`, `${p.x + (p.id % 2 === 0 ? 3 : -3)}vw`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
          style={{
            fontSize: `${p.size}px`,
            filter: p.emoji ? 'drop-shadow(0 0 8px rgba(255, 79, 154, 0.4))' : undefined,
          }}
        >
          {p.emoji ? (
            <span>{p.emoji}</span>
          ) : (
            <div
              className="rounded-full blur-[1px]"
              style={{
                width: `${p.size / 2}px`,
                height: `${p.size / 2}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 12px ${p.color}`,
              }}
            />
          )}
        </motion.div>
      ))}

      {/* User Click Particle Bursts */}
      <AnimatePresence>
        {clickHearts.map((h) => (
          <motion.div
            key={h.id}
            initial={{ x: h.x, y: h.y, scale: 0.2, opacity: 1 }}
            animate={{
              y: h.y - 70 - Math.random() * 40,
              x: h.x + (Math.random() * 60 - 30),
              scale: [0.3, 1.3, 0.9],
              opacity: [1, 0.9, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="fixed text-xl pointer-events-none z-50 filter drop-shadow-md"
            style={{ left: 0, top: 0 }}
          >
            {h.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

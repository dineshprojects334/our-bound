import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  RotateCcw,
  Flame,
  Award,
  PartyPopper,
} from 'lucide-react';
import { SiteConfig } from '../../types';
import { sounds } from '../../utils/sound';

interface GrandCelebrationProps {
  config: SiteConfig;
  onReplayMemories: () => void;
  onRestartAll: () => void;
  onOpenGallery: () => void;
  onPlayJumpGame?: () => void;
}

export const GrandCelebration: React.FC<GrandCelebrationProps> = ({
  config,
  onReplayMemories,
  onRestartAll,
  onOpenGallery,
  onPlayJumpGame,
}) => {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [wishRevealed, setWishRevealed] = useState(false);
  const [balloons, setBalloons] = useState<Array<{ id: number; x: number; color: string; delay: number }>>([]);
  const [smokeBursts, setSmokeBursts] = useState<Array<{ id: number; x: number; y: number; scale: number }>>([]);

  const triggerConfettiShow = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#FF4F9A', '#FFE4EF', '#B8A4FF', '#FFD700', '#E91E63'],
    });

    setTimeout(() => {
      confetti({
        particleCount: 70,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#FF4F9A', '#8067D8', '#FFFFFF'],
      });
      confetti({
        particleCount: 70,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#FF4F9A', '#FFE4EF', '#FFD700'],
      });
    }, 250);

    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 100,
        origin: { y: 0.35 },
        shapes: ['circle'],
        scalar: 1.2,
      });
    }, 700);
  };

  const createSmokeBursts = () => {
    const nextBursts = Array.from({ length: 6 }, (_, index) => ({
      id: Date.now() + index,
      x: -18 + index * 8,
      y: 16,
      scale: 0.8 + index * 0.18,
    }));

    setSmokeBursts(nextBursts);

    setTimeout(() => {
      setSmokeBursts([]);
    }, 1200);
  };

  useEffect(() => {
    const balloonColors = ['#FF4F9A', '#B8A4FF', '#FF70A6', '#8067D8', '#FFD166', '#FF9F1C'];
    const generated = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: 5 + (i * 90) / 14 + (Math.random() * 6 - 3),
      color: balloonColors[i % balloonColors.length],
      delay: Math.random() * 4,
    }));
    setBalloons(generated);

    triggerConfettiShow();
    sounds.playCelebrationFanfare();
  }, []);

  const handleMakeAWish = () => {
    if (!candlesBlown) {
      sounds.playCandleBlow();
      createSmokeBursts();
      setCandlesBlown(true);

      setTimeout(() => {
        sounds.playCelebrationFanfare();
        sounds.playHeartChime();
        triggerConfettiShow();
        setWishRevealed(true);
      }, 600);
    } else {
      triggerConfettiShow();
      sounds.playCelebrationFanfare();
    }
  };

  const heroImage = config.celebration.heroPhoto || config.memories[0]?.image || '/birthday-kid.png';

  return (
    <div className="relative min-h-screen py-8 sm:py-12 px-4 sm:px-6 z-10 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: '110vh', opacity: 0.7 }}
            animate={{
              y: '-20vh',
              x: [`${b.x}vw`, `${b.x + (b.id % 2 === 0 ? 3 : -3)}vw`],
            }}
            transition={{
              duration: 14 + (b.id % 6),
              repeat: Infinity,
              delay: b.delay,
              ease: 'easeInOut',
            }}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{ left: 0 }}
          >
            <div
              className="w-10 sm:w-14 h-12 sm:h-16 rounded-full shadow-lg relative"
              style={{
                backgroundColor: b.color,
                boxShadow: `0 8px 20px ${b.color}66`,
              }}
            >
              <div className="w-2.5 h-3.5 rounded-full bg-white/40 absolute top-2 left-2 blur-[1px]" />
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-current opacity-70" style={{ color: b.color }} />
            <div className="w-0.5 h-14 bg-white/30" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] items-center gap-6 lg:gap-10 p-4 sm:p-6 md:p-8 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="relative order-2 lg:order-1">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative float-slow"
            >
              <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-hotpink/30 via-purple/10 to-transparent blur-2xl" />
              <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-midnight/80 shadow-[0_30px_80px_rgba(255,79,154,0.24)] pulse-glow">
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-transparent to-white/5" />
                <img
                  src={heroImage}
                  alt={config.celebration.recipientName}
                  className="h-[420px] sm:h-[500px] w-full object-cover object-center"
                />
                <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/20 bg-midnight/55 px-4 py-3 backdrop-blur-md flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.25em] text-blushpink/80">Birthday star</p>
                    <p className="text-lg font-extrabold text-white">{config.celebration.recipientName}</p>
                  </div>
                  <span className="text-3xl">🎉</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-hotpink/40 bg-hotpink/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-blushpink"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Birthday Celebration
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.6 }}
              className="mt-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] text-glow-pink"
            >
              {config.celebration.mainHeadline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36, duration: 0.6 }}
              className="mt-4 text-base sm:text-lg text-blushpink/90 leading-relaxed max-w-xl lg:max-w-none"
            >
              {config.celebration.supportingMessage}
            </motion.p>

            <div className="mt-8 relative flex flex-col items-center">
              <div className="relative inline-flex items-end justify-center gap-4 sm:gap-6 mb-1">
                {[1, 2, 3].map((candleIndex) => (
                  <div
                    key={candleIndex}
                    onClick={handleMakeAWish}
                    className="relative flex flex-col items-center cursor-pointer"
                    title={candlesBlown ? 'Wish made!' : 'Click to blow candle!'}
                  >
                    {!candlesBlown ? (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 0.96, 1.12],
                          rotate: [0, -3, 3, 0],
                        }}
                        transition={{ repeat: Infinity, duration: 0.75 }}
                        className="relative flex items-center justify-center mb-1"
                      >
                        <Flame className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_#F59E0B]" />
                        <span className="absolute top-1 left-1/2 -translate-x-1/2 block h-2 w-2 rounded-full bg-white/80 blur-[1px]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ opacity: 0, y: -18, scale: 1.3 }}
                        transition={{ duration: 0.8 }}
                        className="mb-1 text-base"
                      >
                        💨
                      </motion.div>
                    )}

                    <div
                      className={`w-3.5 sm:w-4 h-10 sm:h-12 rounded-t-md shadow-md ${
                        candleIndex === 2
                          ? 'bg-gradient-to-b from-pink-300 to-pink-600'
                          : 'bg-gradient-to-b from-violet-200 to-violet-500'
                      }`}
                    />
                  </div>
                ))}

                <AnimatePresence>
                  {smokeBursts.map((burst) => (
                    <motion.div
                      key={burst.id}
                      initial={{ opacity: 0.8, x: 0, y: 0, scale: burst.scale }}
                      animate={{ opacity: 0, x: burst.x * 7, y: -70, scale: burst.scale * 2.2 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.1, ease: 'easeOut' }}
                      className="pointer-events-none absolute left-1/2 top-[-8px] text-2xl text-white/80"
                    >
                      💨
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="relative flex flex-col items-center">
                <div className="w-44 sm:w-52 h-10 sm:h-12 rounded-t-2xl border border-white/60 bg-gradient-to-r from-pink-200 via-white to-pink-200 shadow-lg flex items-center justify-center gap-2 px-4">
                  <span>🎂</span>
                  <span>✨</span>
                  <span>🎂</span>
                </div>

                <div className="-mt-1 w-52 sm:w-64 h-14 sm:h-16 rounded-[1.5rem] border border-white/30 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 shadow-[0_18px_32px_rgba(255,79,154,0.45)] flex items-center justify-around px-4">
                  <span className="text-base">💖</span>
                  <span className="text-xs sm:text-sm font-black uppercase tracking-[0.18em] text-white">Yashi</span>
                  <span className="text-base">💖</span>
                </div>

                <div className="-mt-1 h-3 w-64 sm:w-[22rem] rounded-full border border-white/20 bg-white/15 shadow-2xl" />
              </div>
            </div>

            <motion.button
              onClick={handleMakeAWish}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className={`mt-7 inline-flex items-center gap-3 rounded-2xl px-7 py-3.5 text-sm sm:text-base font-extrabold shadow-[0_18px_40px_rgba(255,79,154,0.4)] transition-all ${
                candlesBlown
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : 'bg-gradient-to-r from-hotpink via-pink-500 to-purple text-white'
              }`}
            >
              <PartyPopper className="h-5 w-5 animate-bounce" />
              <span>{candlesBlown ? 'Wish Made! Celebrate More ✨' : config.celebration.makeAWishButtonText}</span>
              <Sparkles className="h-5 w-5 text-white/80 animate-spin" />
            </motion.button>

            <AnimatePresence>
              {wishRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 18, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 max-w-xl rounded-[28px] border border-hotpink/40 bg-white/7 p-5 text-left shadow-[0_0_35px_rgba(255,79,154,0.18)]"
                >
                  <div className="mb-3 flex items-center gap-2 text-hotpink">
                    <Heart className="h-5 w-5 fill-hotpink" />
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">Birthday Wish</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{config.celebration.revealedWishMessage}</h3>
                  <p className="mt-3 text-base font-medium text-blushpink">“{config.celebration.finalMessage}”</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => {
                  sounds.playWhoosh();
                  onReplayMemories();
                }}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                <RotateCcw className="h-4 w-4 text-hotpink" />
                <span>{config.celebration.replayButtonText}</span>
              </button>

              <button
                onClick={() => {
                  sounds.playWhoosh();
                  onOpenGallery();
                }}
                className="flex items-center gap-2 rounded-xl border border-hotpink/40 bg-hotpink/10 px-4 py-2.5 text-sm font-semibold text-blushpink transition hover:scale-[1.02]"
              >
                <Heart className="h-4 w-4 fill-hotpink text-hotpink" />
                <span>Open Gallery</span>
              </button>

              {onPlayJumpGame && (
                <button
                  onClick={() => {
                    sounds.playWhoosh();
                    onPlayJumpGame();
                  }}
                  className="flex items-center gap-2 rounded-xl border border-purple/40 bg-purple/10 px-4 py-2.5 text-sm font-semibold text-lavender transition hover:scale-[1.02]"
                >
                  <Sparkles className="h-4 w-4 text-purple" />
                  <span>Jump Adventure 🎮</span>
                </button>
              )}

              <button
                onClick={() => {
                  sounds.playWhoosh();
                  onRestartAll();
                }}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:scale-[1.02]"
              >
                <Award className="h-4 w-4 text-lavender" />
                <span>Restart Journey</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

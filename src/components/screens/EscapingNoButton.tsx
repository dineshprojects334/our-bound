import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, AlertCircle } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface EscapingNoButtonProps {
  onYesClick: () => void;
  yesText: string;
  noText: string;
  teaseQuotes?: string[];
}

export const EscapingNoButton: React.FC<EscapingNoButtonProps> = ({
  onYesClick,
  yesText,
  noText,
  teaseQuotes = [
    "Adei! Enna yosichu NO press panra? 😭",
    "Namma bond-ah ivlo easy-ah escape panna mudiyaadhu! 😂❤️",
    "Hehe, try again eruma! 😜💗",
    "NO button-la kai vekkave mudiyadhu loosu! 🏃‍♀️💨",
    "Aha! You have no choice, YES mattum dhaan valid! 🥰✨",
  ],
}) => {
  const [escapeCount, setEscapeCount] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [currentTease, setCurrentTease] = useState<string | null>(null);
  const [isDizzy, setIsDizzy] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);

  // Function to calculate a random safe position within container bounds
  const dodge = () => {
    sounds.playDodgeBoing();
    const newCount = escapeCount + 1;
    setEscapeCount(newCount);

    // Pick tease message
    const msg = teaseQuotes[(newCount - 1) % teaseQuotes.length];
    setCurrentTease(msg);

    if (newCount >= 4) {
      setIsDizzy(true);
    }

    // Determine safe bounding offsets
    const rangeX = 140; // horizontal leap range
    const rangeY = 80;  // vertical leap range

    // Generate random coordinates ensuring it doesn't just stay in place
    let nextX = (Math.random() * 2 - 1) * rangeX;
    let nextY = (Math.random() * 2 - 1) * rangeY;

    // Avoid sitting directly on top of the YES button (which is roughly centered or left)
    if (Math.abs(nextX) < 30) {
      nextX = nextX >= 0 ? 70 : -70;
    }

    setPosition({ x: nextX, y: nextY });
  };

  // Pointer proximity detection for desktop
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!noButtonRef.current) return;
      const rect = noButtonRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      // If mouse comes within 75 pixels, dodge!
      if (dist < 75) {
        dodge();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [escapeCount]);

  // Touch handler for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    dodge();
  };

  // Keyboard navigation fallback
  const handleNoKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dodge();
      setCurrentTease("Keyboard shortcuts work aagaadhu eruma! YES dhaan un destiny! 😜✨");
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[180px] sm:min-h-[200px] flex flex-col items-center justify-center pt-2"
    >
      {/* Floating Tease Quote Bubble */}
      <AnimatePresence mode="wait">
        {currentTease && (
          <motion.div
            key={escapeCount}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-rosepink/90 to-hotpink/90 text-white text-xs sm:text-sm font-semibold shadow-neon-pink border border-white/20 text-center flex items-center gap-2 max-w-sm"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-white animate-bounce" />
            <span>{currentTease}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Button Row */}
      <div className="relative flex flex-wrap items-center justify-center gap-6 sm:gap-8 w-full">
        {/* The Steady, Glowing YES Button */}
        <motion.button
          onClick={() => {
            sounds.playHeartChime();
            sounds.playPop();
            onYesClick();
          }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          animate={{
            scale: escapeCount > 3 ? [1, 1.08, 1] : 1,
            boxShadow: [
              '0 0 15px rgba(255, 79, 154, 0.5)',
              '0 0 35px rgba(255, 79, 154, 0.8)',
              '0 0 15px rgba(255, 79, 154, 0.5)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="relative z-10 px-8 py-4 rounded-2xl bg-gradient-to-r from-hotpink via-rosepink to-purple text-white font-bold text-base sm:text-lg flex items-center gap-2.5 shadow-neon-pink cursor-pointer"
        >
          <Heart className="w-5 h-5 fill-white animate-pulse" />
          <span>{yesText}</span>
          <Sparkles className="w-4 h-4 text-blushpink animate-spin" />
        </motion.button>

        {/* The Tricky Escaping NO Button */}
        <motion.button
          ref={noButtonRef}
          type="button"
          onClick={dodge}
          onTouchStart={handleTouchStart}
          onMouseEnter={dodge}
          onKeyDown={handleNoKeyDown}
          animate={{
            x: position.x,
            y: position.y,
            rotate: isDizzy ? [0, -10, 10, -5, 5, 0] : 0,
            scale: escapeCount > 4 ? 0.88 : 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 450,
            damping: 24,
          }}
          className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white/70 hover:text-white text-sm font-semibold transition-colors shadow-lg select-none cursor-pointer"
          style={{ touchAction: 'none' }}
        >
          <span>{noText}</span>
        </motion.button>
      </div>

      {/* Escape attempt tally badge */}
      {escapeCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-[11px] text-blushpink/70 font-mono tracking-wider"
        >
          Escape attempts foiled: {escapeCount} 😈
        </motion.div>
      )}
    </div>
  );
};

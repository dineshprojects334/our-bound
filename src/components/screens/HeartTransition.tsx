import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, ArrowRight } from 'lucide-react';
import { SiteConfig } from '../../types';
import { sounds } from '../../utils/sound';

interface HeartTransitionProps {
  config: SiteConfig;
  onProceed: () => void;
}

export const HeartTransition: React.FC<HeartTransitionProps> = ({ config, onProceed }) => {
  const [phase, setPhase] = useState<'gathering' | 'expanding' | 'revealed'>('gathering');

  useEffect(() => {
    sounds.playHeartChime();

    // Gathering phase: hearts fly to center
    const t1 = setTimeout(() => {
      setPhase('expanding');
      sounds.playCelebrationFanfare();
    }, 1200);

    // Expanding phase: heart blows up across screen and reveals card
    const t2 = setTimeout(() => {
      setPhase('revealed');
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 z-20 overflow-hidden">
      {/* Expanding Giant Heart Background Aura */}
      <AnimatePresence>
        {phase === 'expanding' && (
          <motion.div
            initial={{ scale: 0.1, opacity: 0.8 }}
            animate={{ scale: [0.1, 4, 15], opacity: [0.8, 1, 0.2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-10"
          >
            <div className="w-96 h-96 rounded-full bg-gradient-to-r from-hotpink via-rosepink to-purple blur-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gathering Small Hearts Phase */}
      {phase === 'gathering' && (
        <div className="relative flex flex-col items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-full bg-hotpink/30 flex items-center justify-center shadow-neon-pink">
              <Heart className="w-14 h-14 text-hotpink fill-hotpink drop-shadow-[0_0_20px_#FF4F9A]" />
            </div>
            <Sparkles className="w-7 h-7 text-blushpink absolute -top-2 -right-2 animate-spin" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 text-blushpink font-semibold text-sm sm:text-base tracking-wide"
          >
            Opening our magical world... ✨
          </motion.p>
        </div>
      )}

      {/* Final Revealed Card Phase */}
      {phase === 'revealed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg relative z-20"
        >
          <div className="relative rounded-3xl p-8 sm:p-12 glass-panel border border-hotpink/40 shadow-neon-pink text-center overflow-hidden">
            {/* Glowing top illustration — real photo */}
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                className="w-28 h-28 rounded-full bg-gradient-to-tr from-hotpink via-rosepink to-purple p-[3px] shadow-neon-pink"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-midnight">
                  <img
                    src="/photo1.jpg"
                    alt="Our Memory"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </motion.div>
            </div>

            {/* Revealed Text from specification */}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight font-serifDisplay">
              {config.transition.title}
            </h2>
            <p className="text-base sm:text-lg text-blushpink/90 font-medium mb-8 leading-relaxed">
              {config.transition.subtitle}
            </p>

            {/* Proceed CTA button */}
            <motion.button
              onClick={() => {
                sounds.playHeartChime();
                sounds.playPop();
                onProceed();
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-hotpink via-rosepink to-purple text-white font-bold text-base sm:text-lg shadow-neon-pink flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Heart className="w-5 h-5 fill-white group-hover:scale-125 transition-transform" />
              <span>{config.transition.buttonText}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

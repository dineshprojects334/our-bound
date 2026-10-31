import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Sparkles, Heart, ArrowRight } from 'lucide-react';
import { SiteConfig } from '../../types';
import { sounds } from '../../utils/sound';

interface SecretLetterProps {
  config: SiteConfig;
  onProceedToCelebration: () => void;
}

export const SecretLetter: React.FC<SecretLetterProps> = ({ config, onProceedToCelebration }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenEnvelope = () => {
    if (!isOpen) {
      sounds.playHeartChime();
      sounds.playPop();
      setIsOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 z-10 flex flex-col items-center justify-center max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotpink/15 border border-hotpink/30 text-blushpink text-xs sm:text-sm font-semibold mb-3 shadow-glass">
          <Mail className="w-4 h-4 text-hotpink" />
          <span>From My Heart to Yours</span>
          <Sparkles className="w-3.5 h-3.5 text-hotpink animate-spin" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
          {config.letter.heading}
        </h1>
        <p className="text-sm sm:text-base text-blushpink/80 font-medium">
          {config.letter.subtitle}
        </p>
      </motion.div>

      {/* Interactive 3D Envelope & Letter Container */}
      <div className="w-full relative flex flex-col items-center">
        {!isOpen ? (
          /* Closed Floating Envelope */
          <motion.div
            onClick={handleOpenEnvelope}
            whileHover={{ scale: 1.05, y: -6 }}
            whileTap={{ scale: 0.96 }}
            className="cursor-pointer relative w-72 sm:w-96 aspect-[7/5] rounded-3xl bg-gradient-to-tr from-midnight via-plum to-midnightDark p-1 shadow-neon-pink border border-hotpink/50 flex flex-col items-center justify-center group"
          >
            {/* Envelope flap aesthetic */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-hotpink/30 to-transparent clip-path-polygon rounded-t-3xl pointer-events-none" />

            {/* Glowing Wax Seal */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-hotpink via-rosepink to-amber-500 p-0.5 shadow-neon-pink flex items-center justify-center"
            >
              <div className="w-full h-full rounded-full bg-rosepink flex items-center justify-center border-2 border-amber-300/60 shadow-inner">
                <Heart className="w-9 h-9 text-white fill-white animate-pulse" />
              </div>
            </motion.div>

            {/* Tap Hint */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-white/10 group-hover:bg-hotpink/30 border border-white/20 text-xs font-bold text-white tracking-wider flex items-center gap-1.5 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-hotpink" />
              <span>{config.letter.envelopeSealText}</span>
            </div>
          </motion.div>
        ) : (
          /* Opened Letter Paper with smooth slide-up */
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative"
          >
            {/* Vintage Parchment-Style Paper Card */}
            <div className="relative rounded-3xl p-6 sm:p-10 md:p-12 bg-[#FFFDF9] text-midnight shadow-2xl border-4 border-[#F5E6D3] overflow-hidden">
              {/* Paper Watermark / Corner Florals */}
              <div className="absolute top-4 right-4 text-hotpink/15 pointer-events-none">
                <Heart className="w-32 h-32 fill-current" />
              </div>

              {/* Decorative top stamp */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-rosepink/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rosepink/10 flex items-center justify-center text-rosepink">
                    <Heart className="w-4 h-4 fill-rosepink" />
                  </div>
                  <span className="text-xs uppercase tracking-widest font-semibold text-rosepink">
                    A Letter For My Eruma
                  </span>
                </div>
                <span className="text-xs font-handwriting text-slate-500 font-bold">
                  Always & Forever ♾️
                </span>
              </div>

              {/* Letter Paragraphs */}
              <div className="space-y-4 sm:space-y-5 text-slate-800 leading-relaxed font-sans text-sm sm:text-base md:text-lg">
                {config.letter.paragraphs.map((para, idx) => (
                  <motion.p
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.15, duration: 0.4 }}
                    className={
                      idx === 0
                        ? "text-xl sm:text-2xl font-bold font-handwriting text-rosepink"
                        : idx === config.letter.paragraphs.length - 2
                        ? "text-lg sm:text-xl font-bold text-rosepink py-1"
                        : ""
                    }
                  >
                    {para}
                  </motion.p>
                ))}
              </div>

              {/* Sign Off */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                className="mt-8 pt-6 border-t border-rosepink/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="font-handwriting text-xl sm:text-2xl font-bold text-rosepink whitespace-pre-line">
                  {config.letter.signOff}
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles className="w-4 h-4 text-rosepink" />
                  <span>Written with genuine love & friendship</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom Button to Grand Finale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="mt-8 text-center"
            >
              <motion.button
                onClick={() => {
                  sounds.playHeartChime();
                  sounds.playPop();
                  onProceedToCelebration();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-hotpink via-rosepink to-purple text-white font-bold text-base sm:text-lg shadow-neon-pink flex items-center gap-3 mx-auto cursor-pointer group"
              >
                <span>{config.letter.buttonText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

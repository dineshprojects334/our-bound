import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowLeft, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SiteConfig, Question } from '../../types';
import { EscapingNoButton } from './EscapingNoButton';
import { sounds } from '../../utils/sound';

interface QuestionJourneyProps {
  config: SiteConfig;
  onComplete: () => void;
}

export const QuestionJourney: React.FC<QuestionJourneyProps> = ({ config, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);

  const currentQ: Question = config.questions[currentIndex] || config.questions[0];
  const totalQuestions = config.questions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectOption = (optId: string, feedback?: string) => {
    setSelectedOptionId(optId);
    setFeedbackMessage(feedback || currentQ.onAnswerMessage || "Semma da! 💖");
    sounds.playPop();
    sounds.playHeartChime();
  };

  const handleNext = () => {
    if (isLastQuestion) {
      sounds.playHeartChime();
      onComplete();
    } else {
      setDirection(1);
      sounds.playWhoosh();
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setFeedbackMessage(null);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      sounds.playWhoosh();
      setCurrentIndex((prev) => prev - 1);
      setSelectedOptionId(null);
      setFeedbackMessage(null);
    }
  };

  // Special handler for Question 6 (Escaping NO question)
  const handleEscapeYesClick = () => {
    setSelectedOptionId('q6-yes');
    setFeedbackMessage(
      currentQ.onAnswerMessage ||
        "Life evlo busy aanaalum, namma bond-ah maintain pannuvom nu namburen. Nee enakku romba special da. ❤️"
    );
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 z-10 max-w-2xl mx-auto">
      {/* Top Header & Heart Progress Tracker */}
      <div className="w-full mb-6 sm:mb-8 flex flex-col items-center">
        {/* Heart Indicators */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3">
          {config.questions.map((q, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            return (
              <motion.div
                key={q.id}
                animate={isCurrent ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={isCurrent ? { repeat: Infinity, duration: 1.6 } : {}}
                className="relative"
              >
                <Heart
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 ${
                    isCompleted
                      ? 'text-hotpink fill-hotpink drop-shadow-[0_0_8px_rgba(255,79,154,0.8)]'
                      : isCurrent
                      ? 'text-hotpink fill-hotpink/40 animate-pulse'
                      : 'text-white/20 fill-white/5'
                  }`}
                />
                {isCompleted && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blushpink animate-ping" />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Progress Text */}
        <div className="flex items-center gap-2 text-xs font-semibold text-blushpink/80 tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5 text-hotpink" />
          <span>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-white/40">•</span>
          <span className="text-lavender">Eruma Check</span>
        </div>
      </div>

      {/* Question Card Container with AnimatePresence */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQ.id}
          custom={direction}
          initial={{ opacity: 0, x: direction * 50, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -direction * 50, scale: 0.95 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative"
        >
          <div className="relative rounded-3xl p-6 sm:p-10 glass-panel border border-hotpink/30 shadow-glass overflow-hidden">
            {/* Ambient Background Gradient for Card */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-hotpink/10 rounded-full blur-2xl pointer-events-none" />

            {/* Question Text */}
            <div className="mb-6 sm:mb-8 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Special Escaping NO Question (Question 6) vs Standard Multiple Choice */}
            {currentQ.allowEscapeNo ? (
              <div className="my-4">
                <EscapingNoButton
                  onYesClick={handleEscapeYesClick}
                  yesText={currentQ.options.find((o) => o.isYes)?.text || "Aama, life long! ♾️"}
                  noText={currentQ.options.find((o) => !o.isYes)?.text || "Illa 🙈"}
                  teaseQuotes={currentQ.customTease}
                />
              </div>
            ) : (
              /* Options Grid */
              <div className="space-y-3 sm:space-y-3.5">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <motion.button
                      key={option.id}
                      onClick={() => handleSelectOption(option.id, option.feedback)}
                      whileHover={{ scale: 1.015, x: 3 }}
                      whileTap={{ scale: 0.985 }}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1, duration: 0.3 }}
                      className={`w-full p-4 sm:p-4.5 rounded-2xl text-left text-sm sm:text-base font-medium flex items-center justify-between border transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-r from-hotpink/30 to-purple/30 border-hotpink text-white shadow-neon-pink scale-[1.01]'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-hotpink/40 text-white/90'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-hotpink text-white shadow-md'
                              : 'bg-white/10 text-white/70'
                          }`}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{option.text}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="w-5 h-5 text-hotpink shrink-0 animate-scale" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Answer Feedback Message Box */}
            <AnimatePresence>
              {feedbackMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 12, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mt-6 p-4 rounded-2xl bg-hotpink/15 border border-hotpink/40 text-blushpink text-sm sm:text-base font-medium text-center shadow-inner flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-hotpink shrink-0 animate-spin" />
                  <span>{feedbackMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              {currentIndex > 0 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              {/* Next / Proceed Button */}
              {selectedOptionId ? (
                <motion.button
                  onClick={handleNext}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="ml-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-hotpink to-rosepink text-white font-bold text-sm sm:text-base shadow-neon-pink cursor-pointer"
                >
                  <span>{isLastQuestion ? 'Reveal Surprise ✨' : 'Next Question'}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              ) : (
                <span className="text-xs text-white/40 italic">
                  Select an answer to continue ✨
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

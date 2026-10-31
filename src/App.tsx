import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { AppStage, SiteConfig, Memory } from './types';
import { initialSiteConfig } from './config/content';
import { BackgroundHearts } from './components/common/BackgroundHearts';
import { MusicPlayer } from './components/common/MusicPlayer';
import { DevCustomizer } from './components/common/DevCustomizer';
import { LoginScreen } from './components/screens/LoginScreen';
import { QuestionJourney } from './components/screens/QuestionJourney';
import { HeartTransition } from './components/screens/HeartTransition';
import { MemoriesGallery } from './components/screens/MemoriesGallery';
import { SecretLetter } from './components/screens/SecretLetter';
import { GrandCelebration } from './components/screens/GrandCelebration';
import { PhotoGallery } from './components/screens/PhotoGallery';
import { MemoryAdmin } from './components/screens/MemoryAdmin';
import { JumpAdventureGame } from './components/screens/JumpAdventureGame';
import { sounds } from './utils/sound';

// ── Session & Storage Keys ────────────────────────────────────────────────────
const STORAGE_KEY = 'ourbound_config_v2';
const SESSION_AUTH_KEY = 'ourbound_authenticated';
const SESSION_STAGE_KEY = 'ourbound_current_stage';
const SESSION_USER_KEY = 'ourbound_user';

// Admin passcode for quick client gate (enforced with server-side Supabase RLS)
const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? 'admin2410';

export const App: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...initialSiteConfig, ...JSON.parse(saved) };
    } catch {}
    return initialSiteConfig;
  });

  const [stage, setStage] = useState<AppStage>(() => {
    try {
      const isAuthenticated = sessionStorage.getItem(SESSION_AUTH_KEY);
      const savedStage = sessionStorage.getItem(SESSION_STAGE_KEY) as AppStage;
      if (isAuthenticated === 'true' && savedStage) return savedStage;
    } catch {}
    return 'login';
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return sessionStorage.getItem('ourbound_admin_unlocked') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STAGE_KEY, stage);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [stage]);

  const updateConfig = (newVals: Partial<SiteConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newVals };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  };

  const handleUpdateMemories = (newMemories: Memory[]) => updateConfig({ memories: newMemories });

  const resetDefaultConfig = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.clear();
    } catch {}
    setConfig(initialSiteConfig);
    setStage('login');
    setIsAdmin(false);
  };

  const handleAdminRequest = () => {
    sounds.playPop();
    if (isAdmin) {
      setStage('admin');
      return;
    }

    const entered = window.prompt('🔐 Enter Our Bound admin passcode:');
    if (entered === ADMIN_PASSCODE) {
      setIsAdmin(true);
      try {
        sessionStorage.setItem('ourbound_admin_unlocked', 'true');
      } catch {}
      sounds.playHeartChime();
      setStage('admin');
    } else if (entered !== null) {
      sounds.playDodgeBoing();
      alert('Access denied. Incorrect passcode.');
    }
  };

  const userGreeting = (() => {
    try {
      return sessionStorage.getItem(SESSION_USER_KEY) || config.recipientName;
    } catch {
      return config.recipientName;
    }
  })();

  return (
    <div className="relative min-h-screen bg-midnight text-white selection:bg-hotpink selection:text-white font-sans overflow-x-hidden flex flex-col justify-between">
      <BackgroundHearts />
      <MusicPlayer />

      {/* Polished "Our Bound ♡" Header with Wordmark */}
      {stage !== 'login' && (
        <header className="sticky top-0 z-40 w-full bg-midnight/85 backdrop-blur-md border-b border-hotpink/20 px-4 py-3 transition-all shadow-glass">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            {/* Wordmark Logo */}
            <div
              onClick={() => { sounds.playHeartChime(); }}
              onDoubleClick={handleAdminRequest}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
              title="Our Bound ♡"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-hotpink to-purple p-0.5 flex items-center justify-center shadow-neon-pink group-hover:scale-110 transition-transform">
                <div className="w-full h-full rounded-full bg-midnight/90 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-hotpink fill-hotpink animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-serifDisplay font-extrabold text-base sm:text-lg tracking-wide bg-gradient-to-r from-hotpink via-rosepink to-lavender bg-clip-text text-transparent">
                  Our Bound ♡
                </span>
                <span className="text-[10px] text-blushpink/70 hidden md:block -mt-1 font-sans">
                  Namma memories, namma bond, forever. ❤️
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Developer Stage Navigator - Only visible after login */}
      <DevCustomizer
        currentStage={stage}
        setStage={(newStage) => setStage(newStage)}
        config={config}
        updateConfig={updateConfig}
        resetDefault={resetDefaultConfig}
        onOpenAdmin={handleAdminRequest}
        isAuthenticated={stage !== 'login'}
      />

      {/* Main Flow Screens */}
      <main className="relative z-10 w-full flex-1">
        <AnimatePresence mode="wait">
          {stage === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <LoginScreen config={config} onSuccess={() => setStage('questions')} />
            </motion.div>
          )}

          {stage === 'questions' && (
            <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <QuestionJourney config={config} onComplete={() => setStage('transition')} />
            </motion.div>
          )}

          {stage === 'transition' && (
            <motion.div key="transition" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              <HeartTransition config={config} onProceed={() => setStage('memories')} />
            </motion.div>
          )}

          {stage === 'memories' && (
            <motion.div key="memories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <MemoriesGallery config={config} onProceedToLetter={() => setStage('letter')} onUpdateMemories={handleUpdateMemories} />
            </motion.div>
          )}

          {stage === 'letter' && (
            <motion.div key="letter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <SecretLetter config={config} onProceedToCelebration={() => setStage('celebration')} />
            </motion.div>
          )}

          {stage === 'celebration' && (
            <motion.div key="celebration" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <GrandCelebration
                config={config}
                onReplayMemories={() => setStage('memories')}
                onRestartAll={() => setStage('questions')}
                onOpenGallery={() => setStage('gallery')}
                onPlayJumpGame={() => setStage('jumpGame')}
              />
            </motion.div>
          )}

          {stage === 'jumpGame' && (
            <motion.div key="jumpGame" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <JumpAdventureGame
                recipientName={config.recipientName}
                onBack={() => setStage('celebration')}
              />
            </motion.div>
          )}

          {stage === 'gallery' && (
            <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <PhotoGallery
                config={config}
                onBack={() => setStage('celebration')}
                onUpdatePhotos={(newPhotos) => updateConfig({ galleryPhotos: newPhotos })}
              />
            </motion.div>
          )}

          {stage === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.4 }}>
              <MemoryAdmin
                config={config}
                onBack={() => setStage('memories')}
                onUpdateMemories={handleUpdateMemories}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Global Romantic Footer */}
      <footer className="relative z-10 w-full py-6 text-center border-t border-white/10 bg-midnight/60 backdrop-blur-sm mt-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-1.5 text-xs text-white/60">
            <span className="font-serifDisplay font-bold text-blushpink">Our Bound ♡</span>
            <span>•</span>
            <span className="italic font-medium">Namma memories, namma bond, forever. ❤️</span>
          </div>
          <p className="text-[11px] text-white/35">
            Dedicated with infinite love to {userGreeting} 🫂✨
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

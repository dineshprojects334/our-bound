import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Lock, User, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { SiteConfig } from '../../types';
import { sounds } from '../../utils/sound';

interface LoginScreenProps {
  config: SiteConfig;
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ config, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccessUnlocked, setIsSuccessUnlocked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playPop();

    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser) {
      setErrorMessage("Eruma, un peru kooda theriyaama epdi unlock panradhu? 😂 Please enter your name!");
      sounds.playDodgeBoing();
      return;
    }

    if (!cleanPass) {
      setErrorMessage("Secret passcode kekkudhu paaru! Password illama open aagathu 🙈");
      sounds.playDodgeBoing();
      return;
    }

    setIsAuthenticating(true);
    setErrorMessage('');

    const localApiBase = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_BASE_URL || '').trim();
    const expectedUser = (import.meta.env.GALLERY_USERNAME || 'yashi_eruma').trim();
    const expectedPass = (import.meta.env.GALLERY_PASSWORD || 'yashica@2005').trim();

    try {
      if (!localApiBase) {
        if (cleanUser !== expectedUser || cleanPass !== expectedPass) {
          throw new Error('Invalid local credentials');
        }

        setIsSuccessUnlocked(true);
        sounds.playHeartChime();
        sounds.playCelebrationFanfare();

        try {
          sessionStorage.setItem('ourbound_authenticated', 'true');
          sessionStorage.setItem('ourbound_user', cleanUser);
          sessionStorage.setItem('ourbound_session_token', 'local-dev-token');
        } catch {}

        setTimeout(() => {
          onSuccess();
        }, 1200);
        return;
      }

      const response = await fetch('/.netlify/functions/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Authentication failed');
      }

      setIsSuccessUnlocked(true);
      sounds.playHeartChime();
      sounds.playCelebrationFanfare();

      try {
        sessionStorage.setItem('ourbound_authenticated', 'true');
        sessionStorage.setItem('ourbound_user', cleanUser);
        sessionStorage.setItem('ourbound_session_token', data.token || '');
      } catch {}

      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (error) {
      setIsAuthenticating(false);
      setErrorMessage(
        `Wait a sec... Are you really ${config.recipientName}? 🤔 Secret password thappa irukku! Click the hint below!`
      );
      sounds.playDodgeBoing();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(76,29,79,0.95),_rgba(28,11,32,0.98)_38%,_rgba(9,9,16,1)_100%)] px-4 py-8 text-white sm:px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8%] top-20 h-28 w-28 rounded-full bg-pink-400/20 blur-3xl" />
        <div className="absolute right-[-5%] top-20 h-32 w-32 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute bottom-[-8%] left-[12%] h-24 w-24 rounded-full bg-pink-300/15 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[10%] h-28 w-28 rounded-full bg-violet-300/15 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08),transparent_65%)]" />

        {[{ left: '10%', top: '16%', size: 'h-3 w-3' }, { left: '18%', top: '62%', size: 'h-2.5 w-2.5' }, { left: '84%', top: '24%', size: 'h-3 w-3' }, { left: '87%', top: '68%', size: 'h-2.5 w-2.5' }, { left: '6%', top: '78%', size: 'h-4 w-4' }, { left: '92%', top: '82%', size: 'h-4 w-4' }].map((sparkle, index) => (
          <span
            key={index}
            className={`absolute rounded-full bg-pink-200/70 shadow-[0_0_18px_rgba(255,167,203,0.8)] ${sparkle.size}`}
            style={{ left: sparkle.left, top: sparkle.top }}
          />
        ))}

        <div className="absolute left-[8%] top-[24%] text-2xl text-pink-300/80">♥</div>
        <div className="absolute right-[10%] top-[28%] text-2xl text-pink-300/80">♥</div>
        <div className="absolute left-[12%] bottom-[12%] text-2xl text-pink-300/70">♥</div>
        <div className="absolute right-[14%] bottom-[18%] text-xl text-violet-200/70">♥</div>
      </div>

      <div className="relative z-10 mx-auto max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_20px_45px_rgba(0,0,0,0.35)] backdrop-blur-sm"
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-pink-500/20 via-rose-500/10 to-violet-500/20 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-500/30">
                  <Heart className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-tight">Our Bound</div>
                  <div className="text-[11px] text-pink-100/70">Namma memories, namma bond</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => sounds.playHeartChime()}
                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-pink-100/80"
              >
                Music
              </button>
            </div>
          </div>

          <div className="px-5 pb-6 pt-6 text-center">
            <div className="mb-5 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-pink-300/50 bg-gradient-to-br from-pink-200/10 to-violet-200/10 shadow-[0_0_24px_rgba(255,112,166,0.3)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-violet-500 text-white">
                  <User className="h-8 w-8" />
                </div>
              </div>
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.26em] text-pink-200/80">
              Birthday access
            </p>
            <h1 className="text-3xl font-bold leading-tight text-white">
              Happy Birthday, <span className="text-pink-200">Yashi</span>
            </h1>
            <p className="mt-3 text-sm text-pink-100/75">
              Your little memories, love, and surprises are waiting inside.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3 text-left">
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-pink-200/80" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={config.login.usernamePlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-[#1d1326] py-3 pl-10 pr-3 text-sm text-white placeholder:text-pink-100/40 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-300/20"
                  disabled={isAuthenticating || isSuccessUnlocked}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-pink-200/80" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder={config.login.passwordPlaceholder}
                  className="w-full rounded-xl border border-white/10 bg-[#1d1326] py-3 pl-10 pr-11 text-sm text-white placeholder:text-pink-100/40 outline-none transition focus:border-pink-300 focus:ring-2 focus:ring-pink-300/20"
                  disabled={isAuthenticating || isSuccessUnlocked}
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                    sounds.playPop();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-100/70 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-left text-xs text-red-100"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
                      <span>{errorMessage}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowHint(!showHint);
                    sounds.playPop();
                  }}
                  className="text-xs text-pink-200 underline decoration-dotted underline-offset-4 hover:text-white"
                >
                  Need a hint?
                </button>

                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-pink-100/90"
                  >
                    {config.login.hintText}
                  </motion.div>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={isAuthenticating || isSuccessUnlocked}
                className={`mt-2 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold text-white shadow-lg transition ${
                  isSuccessUnlocked
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gradient-to-r from-pink-500 via-rose-500 to-violet-500 hover:brightness-110'
                }`}
              >
                {isAuthenticating ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <span>Checking...</span>
                  </>
                ) : isSuccessUnlocked ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Welcome 💖</span>
                  </>
                ) : (
                  <>
                    <span>{config.login.unlockButtonText}</span>
                    <Heart className="h-4 w-4 fill-white" />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

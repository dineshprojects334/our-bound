import React, { useState } from 'react';
import { Volume2, VolumeX, Music, Sparkles, SkipForward, Play, Pause } from 'lucide-react';
import { sounds } from '../../utils/sound';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [trackTitle, setTrackTitle] = useState(sounds.getCurrentTrackTitle());
  // Tracks whether music has been started at least once (for "Resume" label)
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlay = () => {
    const newState = sounds.toggleMusic(true); // force play
    setIsPlaying(newState);
    setHasStarted(true);
    setShowTooltip(false);
    setTrackTitle(sounds.getCurrentTrackTitle());
    sounds.playPop();
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.toggleMusic(false); // force pause — preserves position
    setIsPlaying(false);
    sounds.playPop();
  };

  const handleResume = () => {
    const newState = sounds.toggleMusic(true); // resumes from same position
    setIsPlaying(newState);
    setTrackTitle(sounds.getCurrentTrackTitle());
    sounds.playPop();
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    sounds.playPop();
  };

  const skipTrack = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.nextTrack();
    setTrackTitle(sounds.getCurrentTrackTitle());
    sounds.playPop();
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {/* Tooltip hint — only shown before first play */}
      {showTooltip && !isPlaying && (
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-hotpink/20 border border-hotpink/40 text-xs text-blushpink backdrop-blur-md animate-bounce shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-hotpink animate-spin" />
          <span>Tap for magic music 🎵</span>
        </div>
      )}

      {/* ── PLAYING STATE pill ─────────────────────────────────────── */}
      {isPlaying && (
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border bg-hotpink/20 border-hotpink text-white shadow-neon-pink scale-105 backdrop-blur-md transition-all duration-300">
          {/* Pulsing music note icon */}
          <Music className="w-4 h-4 text-hotpink animate-pulse flex-shrink-0" />

          {/* Animated equalizer bars */}
          {!isMuted && (
            <div className="flex items-end gap-0.5 h-3.5 w-4 flex-shrink-0">
              <span className="w-1 bg-hotpink rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-2" />
              <span className="w-1 bg-lavender rounded-full animate-[bounce_0.8s_ease-in-out_infinite_0.2s] h-3.5" />
              <span className="w-1 bg-hotpink rounded-full animate-[bounce_0.5s_ease-in-out_infinite_0.4s] h-2.5" />
            </div>
          )}

          {/* Track title */}
          <span className="text-xs font-medium max-w-[80px] truncate hidden sm:block opacity-80">
            {trackTitle}
          </span>

          {/* ⏸ Pause button */}
          <button
            onClick={handlePause}
            title="Pause"
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <Pause className="w-3.5 h-3.5 text-white" />
            <span className="text-xs hidden sm:inline">Pause</span>
          </button>

          {/* ⏭ Skip to next song */}
          <button
            onClick={skipTrack}
            title="Next song"
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5 text-white/80" />
          </button>

          {/* 🔇 Mute / Unmute */}
          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-white/80" />
            )}
          </button>
        </div>
      )}

      {/* ── PAUSED / NOT STARTED pill ─────────────────────────────── */}
      {!isPlaying && (
        <button
          onClick={hasStarted ? handleResume : handlePlay}
          title={hasStarted ? 'Resume music' : 'Play birthday music'}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full border bg-midnight/80 border-white/20 text-white/70 hover:text-white hover:border-hotpink/50 transition-all duration-300 shadow-glass backdrop-blur-md"
        >
          <Play className="w-4 h-4" />
          <span className="text-xs font-medium">
            {hasStarted ? 'Resume' : 'Play Tune'}
          </span>
        </button>
      )}
    </div>
  );
};

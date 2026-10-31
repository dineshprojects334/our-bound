// Comprehensive Web Audio API sound generator for Our Bound
// Zero external asset dependency - works 100% offline and cross-browser!

// Playlist of real MP3 songs served from /public
const PLAYLIST = [
  { src: '/song1.mp3', title: '🎵 Song 1' },
  { src: '/song2.mp3', title: '🎵 Song 2' },
];

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMusicPlaying = false;
  private isMuted = false;
  private audioUnlocked = false;
  private hasBoundResumeListener = false;

  // Real MP3 playlist state
  private audio: HTMLAudioElement | null = null;
  private currentTrackIndex = 0;

  private initCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }

    if (!this.hasBoundResumeListener) {
      const resumeOnInteraction = () => {
        if (this.ctx?.state === 'suspended') {
          this.ctx.resume().catch(() => undefined);
        }
        this.audioUnlocked = true;
      };

      ['pointerdown', 'keydown', 'touchstart', 'click'].forEach((eventName) => {
        window.addEventListener(eventName, resumeOnInteraction, { passive: true, once: true });
      });
      this.hasBoundResumeListener = true;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => undefined);
    }

    return this.ctx;
  }

  unlock(): boolean {
    const ctx = this.initCtx();
    if (!ctx) return false;
    this.audioUnlocked = true;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => undefined);
    }
    return this.audioUnlocked;
  }

  // Force unmute - override toggleMute to never actually mute
  private forceUnmute() {
    this.isMuted = false;
  }

  // Soft cute pop for button clicks and answers
  playPop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Sparkling celestial chime for hearts and reveals
  playHeartChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);

        gain.gain.setValueAtTime(0.12, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.45);
      });
    } catch {}
  }

  // Playful boing/dodge sound when the NO button escapes!
  playDodgeBoing() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.09);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Soft air whoosh for screen transitions
  playWhoosh() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Blowing candle sound (soft filtered breath noise simulation)
  playCandleBlow() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // White noise buffer
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      filter.Q.value = 1.2;

      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.6);
    } catch {}
  }

  // Grand celebration fanfare
  playCelebrationFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const chords = [
        [523.25, 659.25, 783.99],       // C
        [587.33, 739.99, 880.00],       // D
        [659.25, 830.61, 987.77],       // E
        [1046.50, 1318.51, 1567.98]     // High C octave chord
      ];

      const now = this.ctx.currentTime;

      chords.forEach((chord, stepIdx) => {
        const stepTime = now + stepIdx * 0.16;
        const dur = stepIdx === chords.length - 1 ? 0.9 : 0.22;

        chord.forEach(freq => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, stepTime);

          gain.gain.setValueAtTime(0.14, stepTime);
          gain.gain.exponentialRampToValueAtTime(0.001, stepTime + dur);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(stepTime);
          osc.stop(stepTime + dur);
        });
      });
    } catch {}
  }

  // ── MP3 Playlist Music ──────────────────────────────────────────────────────
  toggleMusic(forceState?: boolean): boolean {
    const shouldPlay = forceState !== undefined ? forceState : !this.isMusicPlaying;
    if (shouldPlay) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.isMusicPlaying;
  }

  private startMusic() {
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // If audio already exists (was paused), just resume it
    if (this.audio && this.audio.src) {
      this.audio.play().catch(() => { this.isMusicPlaying = false; });
    } else {
      // First time — load and play from the beginning
      this.loadAndPlayTrack(this.currentTrackIndex);
    }
  }

  private loadAndPlayTrack(index: number) {
    // Stop current audio if any
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }

    this.currentTrackIndex = index % PLAYLIST.length;
    const track = PLAYLIST[this.currentTrackIndex];

    this.audio = new Audio(track.src);
    this.audio.volume = this.isMuted ? 0 : 0.8;
    this.audio.preload = 'auto';

    // Auto-advance to next track when one finishes
    this.audio.addEventListener('ended', () => {
      if (this.isMusicPlaying) {
        this.loadAndPlayTrack((this.currentTrackIndex + 1) % PLAYLIST.length);
      }
    });

    this.audio.play().catch(() => {
      // Autoplay blocked — will play on next user interaction
      this.isMusicPlaying = false;
    });
  }

  private stopMusic() {
    this.isMusicPlaying = false;
    if (this.audio) {
      this.audio.pause(); // preserves playback position for resume
    }
  }

  /** Skip to the next track in the playlist */
  nextTrack() {
    const next = (this.currentTrackIndex + 1) % PLAYLIST.length;
    if (this.isMusicPlaying) {
      this.loadAndPlayTrack(next);
    } else {
      this.currentTrackIndex = next;
    }
  }

  /** Returns the display name of the currently active track */
  getCurrentTrackTitle(): string {
    return PLAYLIST[this.currentTrackIndex]?.title ?? '🎵 Music';
  }

  /** Returns total number of tracks */
  getTrackCount(): number {
    return PLAYLIST.length;
  }

  toggleMute(): boolean {
    this.forceUnmute();
    this.isMuted = false;
    if (this.audio) {
      this.audio.volume = 0.8;
    }
    return this.isMuted;
  }

  getMusicState(): { isPlaying: boolean; isMuted: boolean } {
    return {
      isPlaying: this.isMusicPlaying,
      isMuted: this.isMuted,
    };
  }
}

export const sounds = new SoundSystem();

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Play, Pause, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import { sounds } from '../../utils/sound';

interface JumpAdventureGameProps {
  onBack: () => void;
  recipientName: string;
}

// Game constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const GAME_SPEED_INITIAL = 5;
const GAME_SPEED_MAX = 12;
const SPEED_INCREMENT = 0.001;
const OBSTACLE_SPAWN_INTERVAL = 1500;
const HEART_SPAWN_CHANCE = 0.3;

// Thanglish messages for heart collection
const HEART_MESSAGES = [
  "Superrr erumaa ❤️",
  "Semma speed! 😂",
  "Unakku idhu easy dhaan!",
  "Keep jumping erumaa!",
  "Awesomaaa! 🥹",
  "En nallaa friend! 💖",
  "Romba nallaa run pannura! 🫶",
];

// Game over messages
const GAME_OVER_MESSAGES = [
  "Aiyooo erumaa! 😂\nKonjam miss aayiduchu!\nInnum oru try pannalama?",
  "Semma close erumaa! 😭\nOru chinna miss thaan!\nThirumba pannalaa?",
  "Vayiru valikkura sirippu varudhu! 🤣\nInnum try pannu!",
  "Adei! Idhu easy-ah kidaikaadhu! 😜\nOru vishayam, try pannu!",
];

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'cake' | 'gift' | 'balloon';
  passed: boolean;
}

interface Heart {
  x: number;
  y: number;
  size: number;
  collected: boolean;
  message: string;
}

export const JumpAdventureGame: React.FC<JumpAdventureGameProps> = ({ onBack, recipientName }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'gameover'>('start');
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('jumpGameBestScore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [soundEnabled, setSoundEnabled] = useState(true); // Sound enabled by default
  const [floatingMessage, setFloatingMessage] = useState<{ text: string; x: number; y: number } | null>(null);
  const [gameOverMessage, setGameOverMessage] = useState('');

  // Game state refs
  const playerRef = useRef({ x: 80, y: 0, vy: 0, isJumping: false, width: 50, height: 60 });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const heartsRef = useRef<Heart[]>([]);
  const gameSpeedRef = useRef(GAME_SPEED_INITIAL);
  const scoreRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);

  // Draw player character (cute birthday girl)
  const drawPlayer = (ctx: CanvasRenderingContext2D, player: typeof playerRef.current) => {
    const { x, y, width, height } = player;

    // Body (dress)
    ctx.fillStyle = '#FF4F9A';
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y + height * 0.4);
    ctx.lineTo(x + width * 0.7, y + height);
    ctx.lineTo(x + width * 0.3, y + height);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = '#FFE4EF';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.25, width * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#5D4E37';
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.22, width * 0.4, Math.PI, 0);
    ctx.fill();

    // Pigtails
    ctx.beginPath();
    ctx.arc(x + width * 0.15, y + height * 0.35, width * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + width * 0.85, y + height * 0.35, width * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(x + width * 0.4, y + height * 0.25, 3, 0, Math.PI * 2);
    ctx.arc(x + width * 0.6, y + height * 0.25, 3, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#E91E63';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + width / 2, y + height * 0.3, 8, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Birthday hat
    ctx.fillStyle = '#8067D8';
    ctx.beginPath();
    ctx.moveTo(x + width * 0.35, y + height * 0.05);
    ctx.lineTo(x + width * 0.65, y + height * 0.05);
    ctx.lineTo(x + width / 2, y - height * 0.1);
    ctx.closePath();
    ctx.fill();

    // Pom-pom
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(x + width / 2, y - height * 0.12, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  // Draw obstacles (birthday-themed)
  const drawObstacle = (ctx: CanvasRenderingContext2D, obstacle: Obstacle) => {
    const { x, y, width, height, type } = obstacle;

    if (type === 'cake') {
      // Cake
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(x, y + height * 0.3, width, height * 0.7);
      ctx.fillStyle = '#FFF';
      ctx.fillRect(x + width * 0.1, y + height * 0.1, width * 0.8, height * 0.2);
      // Candles
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x + width * 0.2, y, 4, height * 0.3);
      ctx.fillRect(x + width * 0.5, y, 4, height * 0.3);
      ctx.fillRect(x + width * 0.8, y, 4, height * 0.3);
    } else if (type === 'gift') {
      // Gift box
      ctx.fillStyle = '#FF6B6B';
      ctx.fillRect(x, y + height * 0.2, width, height * 0.8);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + width * 0.45, y + height * 0.2, width * 0.1, height * 0.8);
      ctx.fillRect(x, y + height * 0.45, width, height * 0.1);
      // Bow
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + width * 0.5, y + height * 0.15, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'balloon') {
      // Balloon
      ctx.fillStyle = '#9D4EDD';
      ctx.beginPath();
      ctx.ellipse(x + width / 2, y + height * 0.4, width * 0.4, height * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // String
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + width / 2, y + height * 0.9);
      ctx.lineTo(x + width / 2, y + height);
      ctx.stroke();
    }
  };

  // Draw collectible heart
  const drawHeart = (ctx: CanvasRenderingContext2D, heart: Heart) => {
    const { x, y, size } = heart;
    ctx.fillStyle = '#FF4F9A';
    ctx.font = `${size}px Arial`;
    ctx.fillText('❤️', x, y);
  };

  // Collision detection
  const checkCollision = (player: typeof playerRef.current, obstacle: Obstacle): boolean => {
    const playerBox = {
      x: player.x + 10,
      y: player.y + 10,
      width: player.width - 20,
      height: player.height - 10,
    };

    return (
      playerBox.x < obstacle.x + obstacle.width &&
      playerBox.x + playerBox.width > obstacle.x &&
      playerBox.y < obstacle.y + obstacle.height &&
      playerBox.y + playerBox.height > obstacle.y
    );
  };

  // Check heart collection
  const checkHeartCollection = (player: typeof playerRef.current, heart: Heart): boolean => {
    const playerCenter = { x: player.x + player.width / 2, y: player.y + player.height / 2 };
    const heartCenter = { x: heart.x, y: heart.y };
    const distance = Math.sqrt(
      Math.pow(playerCenter.x - heartCenter.x, 2) + Math.pow(playerCenter.y - heartCenter.y, 2)
    );
    return distance < 40;
  };

  // Game loop
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, '#FFE4EF');
    gradient.addColorStop(1, '#B8A4FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvasHeight);

    // Draw ground
    ctx.fillStyle = '#24142F';
    ctx.fillRect(0, canvasHeight - 40, canvas.width, 40);

    // Apply gravity
    player.vy += GRAVITY;
    player.y += player.vy;

    // Ground collision
    if (player.y + player.height > canvasHeight - 40) {
      player.y = canvasHeight - 40 - player.height;
      player.vy = 0;
      player.isJumping = false;
    }

    // Update game speed
    if (gameSpeedRef.current < GAME_SPEED_MAX) {
      gameSpeedRef.current += SPEED_INCREMENT;
    }

    // Spawn obstacles
    const now = Date.now();
    if (now - lastObstacleTimeRef.current > OBSTACLE_SPAWN_INTERVAL) {
      const types: Array<'cake' | 'gift' | 'balloon'> = ['cake', 'gift', 'balloon'];
      const type = types[Math.floor(Math.random() * types.length)];
      const obstacle: Obstacle = {
        x: canvas.width,
        y: canvasHeight - 40 - (type === 'balloon' ? 80 : 50),
        width: type === 'balloon' ? 40 : 50,
        height: type === 'balloon' ? 60 : 50,
        type,
        passed: false,
      };
      obstaclesRef.current.push(obstacle);
      lastObstacleTimeRef.current = now;

      // Maybe spawn a heart
      if (Math.random() < HEART_SPAWN_CHANCE) {
        const heart: Heart = {
          x: canvas.width + Math.random() * 100,
          y: canvasHeight - 150 - Math.random() * 100,
          size: 30,
          collected: false,
          message: HEART_MESSAGES[Math.floor(Math.random() * HEART_MESSAGES.length)],
        };
        heartsRef.current.push(heart);
      }
    }

    // Update and draw obstacles
    obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
      obstacle.x -= gameSpeedRef.current;

      // Check collision
      if (checkCollision(player, obstacle)) {
        // if (soundEnabled) sounds.playDodgeBoing();
        handleGameOver();
        return false;
      }

      // Score when passed
      if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
        obstacle.passed = true;
        scoreRef.current += 10;
        setScore(scoreRef.current);
        // if (soundEnabled) sounds.playPop();
      }

      // Draw obstacle
      drawObstacle(ctx, obstacle);

      // Remove off-screen obstacles
      return obstacle.x + obstacle.width > 0;
    });

    // Update and draw hearts
    heartsRef.current = heartsRef.current.filter((heart) => {
      heart.x -= gameSpeedRef.current;

      // Check collection
      if (!heart.collected && checkHeartCollection(player, heart)) {
        heart.collected = true;
        scoreRef.current += 20;
        setScore(scoreRef.current);
        if (soundEnabled) sounds.playHeartChime();
        setFloatingMessage({ text: heart.message, x: heart.x, y: heart.y });
        setTimeout(() => setFloatingMessage(null), 1500);
        return false;
      }

      // Draw heart
      if (!heart.collected) {
        drawHeart(ctx, heart);
      }

      // Remove off-screen hearts
      return heart.x > -50;
    });

    // Draw player
    drawPlayer(ctx, player);

    // Draw floating message
    if (floatingMessage) {
      ctx.fillStyle = '#FF4F9A';
      ctx.font = 'bold 16px Arial';
      ctx.fillText(floatingMessage.text, floatingMessage.x, floatingMessage.y);
    }

    // Draw score
    ctx.fillStyle = '#24142F';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${scoreRef.current}`, 20, 40);
    ctx.font = '16px Arial';
    ctx.fillText(`Best: ${bestScore}`, 20, 65);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, soundEnabled, bestScore, floatingMessage]);

  // Jump function
  const jump = useCallback(() => {
    if (gameState !== 'playing') return;
    const player = playerRef.current;
    if (!player.isJumping) {
      player.vy = JUMP_FORCE;
      player.isJumping = true;
      if (soundEnabled) sounds.playPop();
    }
  }, [gameState, soundEnabled]);

  // Handle game over
  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    const message = GAME_OVER_MESSAGES[Math.floor(Math.random() * GAME_OVER_MESSAGES.length)];
    setGameOverMessage(message);

    if (scoreRef.current > bestScore) {
      setBestScore(scoreRef.current);
      try {
        localStorage.setItem('jumpGameBestScore', scoreRef.current.toString());
      } catch {}
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, [bestScore]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    scoreRef.current = 0;
    gameSpeedRef.current = GAME_SPEED_INITIAL;
    obstaclesRef.current = [];
    heartsRef.current = [];
    lastObstacleTimeRef.current = Date.now();
    playerRef.current = {
      x: 80,
      y: 0,
      vy: 0,
      isJumping: false,
      width: 50,
      height: 60,
    };
    playerRef.current.y = canvasRef.current!.height - 40 - playerRef.current.height;
  }, []);

  // Restart game
  const restartGame = useCallback(() => {
    startGame();
  }, [startGame]);

  // Toggle pause
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else if (gameState === 'paused') {
      setGameState('playing');
      gameLoop();
    }
  }, [gameState, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameState === 'start') {
          startGame();
        } else if (gameState === 'playing') {
          jump();
        } else if (gameState === 'gameover') {
          restartGame();
        } else if (gameState === 'paused') {
          togglePause();
        }
      }
      if (e.code === 'Escape' && gameState === 'playing') {
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, startGame, jump, restartGame, togglePause]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = Math.min(container.clientWidth, 800);
        canvas.height = 400;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Start game loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      gameLoop();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameLoop]);

  return (
    <div className="relative min-h-screen py-8 px-4 bg-midnight overflow-hidden">
      {/* Background hearts */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">
            Jump Adventure ❤️
          </h1>
          <p className="text-blushpink/80 text-sm">
            Help {recipientName} jump over birthday obstacles!
          </p>
        </motion.div>

        {/* Game Container */}
        <div className="relative rounded-2xl overflow-hidden border-4 border-hotpink/50 shadow-neon-pink bg-gradient-to-br from-pink-100 to-purple-100">
          <canvas
            ref={canvasRef}
            className="w-full cursor-pointer"
            onClick={() => {
              if (gameState === 'start') startGame();
              else if (gameState === 'playing') jump();
              else if (gameState === 'gameover') restartGame();
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              if (gameState === 'start') startGame();
              else if (gameState === 'playing') jump();
              else if (gameState === 'gameover') restartGame();
            }}
          />

          {/* Start Screen Overlay */}
          <AnimatePresence>
            {gameState === 'start' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-midnight/90 backdrop-blur-sm flex flex-col items-center justify-center p-6"
              >
                <div className="text-6xl mb-4">🎂🎁🎈</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Ready to Jump, {recipientName}?
                </h2>
                <p className="text-blushpink/80 text-sm mb-6 text-center max-w-md">
                  Tap, click, or press Space/Arrow Up to jump over obstacles! Collect hearts for bonus points!
                </p>
                <motion.button
                  onClick={startGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-hotpink to-purple text-white font-bold text-lg shadow-neon-pink"
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pause Overlay */}
          <AnimatePresence>
            {gameState === 'paused' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-midnight/80 backdrop-blur-sm flex flex-col items-center justify-center"
              >
                <div className="text-4xl mb-4">⏸️</div>
                <h2 className="text-2xl font-bold text-white mb-4">Paused</h2>
                <motion.button
                  onClick={togglePause}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-full bg-hotpink text-white font-bold"
                >
                  Resume
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Over Overlay */}
          <AnimatePresence>
            {gameState === 'gameover' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-midnight/90 backdrop-blur-sm flex flex-col items-center justify-center p-6"
              >
                <div className="text-5xl mb-4">😂</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 whitespace-pre-line text-center">
                  {gameOverMessage}
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-blushpink/60 text-xs">Score</p>
                    <p className="text-3xl font-bold text-hotpink">{score}</p>
                  </div>
                  <div className="w-px h-12 bg-white/20" />
                  <div className="text-center">
                    <p className="text-blushpink/60 text-xs">Best</p>
                    <p className="text-3xl font-bold text-purple">{bestScore}</p>
                  </div>
                </div>
                <motion.button
                  onClick={restartGame}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-hotpink to-purple text-white font-bold text-lg shadow-neon-pink"
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Game Controls */}
          {gameState === 'playing' && (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={togglePause}
                className="p-2 rounded-full bg-midnight/80 text-white hover:bg-hotpink transition-colors"
                title="Pause (ESC)"
              >
                <Pause className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full bg-midnight/80 text-white hover:bg-hotpink transition-colors"
                title="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Score display during gameplay */}
          {gameState === 'playing' && (
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-midnight/80 text-white text-sm font-bold">
              <Trophy className="w-4 h-4 text-hotpink" />
              <span>{score}</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-white/60 text-xs">
            <span className="text-hotpink font-bold">Controls:</span> Space / Arrow Up / Click / Tap to jump
          </p>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-colors text-sm"
          >
            ← Back to Celebration
          </button>
        </motion.div>
      </div>
    </div>
  );
};

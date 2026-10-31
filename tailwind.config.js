/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        hotpink: "#FF4F9A",
        blushpink: "#FFE4EF",
        rosepink: "#E91E63",
        lavender: "#B8A4FF",
        plum: "#8067D8",
        midnight: "#24142F",
        midnightDark: "#150B1C",
        cardGlass: "rgba(36, 20, 47, 0.7)",
        cardGlassLight: "rgba(255, 255, 255, 0.12)",
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive'],
        script: ['"Dancing Script"', 'cursive'],
        serifDisplay: ['"Playfair Display"', 'serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
        'sparkle': 'sparkle 1.8s ease-in-out infinite',
        'heartbeat': 'heartbeat 1.4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-12px) rotate(3deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.18)' },
          '70%': { transform: 'scale(1)' },
        }
      },
      boxShadow: {
        'neon-pink': '0 0 25px rgba(255, 79, 154, 0.55), 0 0 50px rgba(255, 79, 154, 0.25)',
        'neon-purple': '0 0 25px rgba(184, 164, 255, 0.5), 0 0 45px rgba(128, 103, 216, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}

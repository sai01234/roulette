/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber': {
          'bg': '#0a0a1a',
          'card': '#12122a',
          'accent': '#ff3366',
          'accent2': '#00ffcc',
          'gold': '#ffd700',
          'purple': '#9333ea',
          'blue': '#3b82f6',
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 51, 102, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 51, 102, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        }
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(255, 51, 102, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 51, 102, 0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}


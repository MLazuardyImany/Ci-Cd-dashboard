/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vercel-inspired dark theme
        dark: {
          bg: '#0a0a0a',
          card: '#111111',
          border: '#2a2a2a',
          hover: '#1a1a1a',
        },
        accent: {
          blue: '#0070f3',
          green: '#00c853',
          red: '#ff4444',
          yellow: '#ffa000',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
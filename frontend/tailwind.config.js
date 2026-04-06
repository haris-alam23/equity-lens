/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#020818',
        card: '#07103A',
        border: '#0D1B6E',
        accent: '#0000FF',
        'accent-light': '#00FFFF',
        bullish: '#22c55e',
        bearish: '#ef4444',
        neutral: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(0, 255, 255, 0.15)',
        'glow-md': '0 0 24px rgba(0, 255, 255, 0.2)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#080a0f',
        card: '#0e1117',
        border: '#1a1d2e',
        accent: '#6366f1',
        'accent-light': '#818cf8',
        bullish: '#22c55e',
        bearish: '#ef4444',
        neutral: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 12px rgba(99, 102, 241, 0.15)',
        'glow-md': '0 0 24px rgba(99, 102, 241, 0.2)',
      },
    },
  },
  plugins: [],
}

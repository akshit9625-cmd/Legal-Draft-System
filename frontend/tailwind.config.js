/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#3b82f6', // Bright Blue
          DEFAULT: '#1e40af', // Deep Blue
          dark: '#1e3a8a',
        },
        secondary: {
          light: '#fef08a', // Light Yellow
          DEFAULT: '#facc15', // Yellow
          dark: '#eab308',
        },
        navy: {
          DEFAULT: '#0a0f1e',
          light: '#111827',
          accent: '#1a2235',
        },
        gold: {
          DEFAULT: '#c9a84c',
          light: '#e8c97a',
        },
        cream: {
          DEFAULT: '#f5f0e8',
          dim: '#d4cfc5',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

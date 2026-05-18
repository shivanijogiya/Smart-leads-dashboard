import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        field: '#f5f7fb',
        coral: '#e95f4f',
        teal: '#0f8b8d',
        gold: '#d39b2a',
      },
      boxShadow: {
        soft: '0 12px 34px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
} satisfies Config;

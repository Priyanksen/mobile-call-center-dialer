/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#E0EAFF',
          200: '#C7D7FE',
          300: '#A4BCFD',
          400: '#8098F9',
          500: '#6172F3',
          600: '#444CE7',
          700: '#3538CD',
          800: '#2D31A6',
          900: '#2D3282',
        },
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0B1220',
        },
        accent: {
          mint: '#10B981',
          sky: '#0EA5E9',
          rose: '#F43F5E',
          amber: '#F59E0B',
          violet: '#8B5CF6',
        },
        success: '#10B981',
        danger: '#EF4444',
        warn: '#F59E0B',
        bg: '#F4F6FB',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};

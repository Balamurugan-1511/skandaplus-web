module.exports = {
  /** @type {import('tailwindcss').Config} */
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4da6ff',
          DEFAULT: '#1363DF',
          dark: '#082A5E',
        },
        secondary: {
          light: '#f8f9fa',
          DEFAULT: '#e9ecef',
          dark: '#dee2e6',
        },
        navy: '#0A0C10',
        violet: '#472DD9',
        bodyText: '#4B5565',
        accentBlue: '#0F766E',
        darkText: '#171718',
        gold: {
          light: '#FFD98A',
          DEFAULT: '#FFB238',
          dark: '#B9891F',
        },
      },
      fontFamily: {
        heading: ['Lexend Deca', 'sans-serif'],
        body: ['Hind', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '20px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(8, 42, 94, 0.12)',
        cardHover: '0 8px 32px rgba(8, 42, 94, 0.2)',
      },
      keyframes: {
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.6)' },
          '60%': { opacity: '1', transform: 'scale(1.08)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'ring-pulse': {
          '0%': { transform: 'scale(0.9)', opacity: '0.6' },
          '80%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'draw-check': {
          '0%': { strokeDashoffset: '24' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.5s ease-out both',
        'pop-in': 'pop-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
        'ring-pulse': 'ring-pulse 1.4s ease-out infinite',
        'draw-check': 'draw-check 0.4s 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};

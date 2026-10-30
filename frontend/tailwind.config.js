/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Inter Tight"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        mango: {
          50: '#fff8ed',
          100: '#ffefd0',
          200: '#ffdc9e',
          300: '#ffc05c',
          400: '#ffa32e',
          500: '#f98207',
          600: '#e06303',
          700: '#b84706',
          800: '#93370c',
          900: '#782f0d',
        },
        lychee: {
          50: '#fef2f4',
          100: '#fde6e9',
          200: '#fbd0d8',
          300: '#f7a8ba',
          400: '#f07392',
          500: '#e34a6f',
          600: '#cc2b54',
          700: '#ac1e45',
          800: '#901c3e',
          900: '#7b1c39',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf5ea',
          200: '#f5ead0',
          300: '#eedab0',
          400: '#e3c484',
        },
        leaf: {
          500: '#4a8b2a',
          600: '#3a7320',
          700: '#2d5a19',
        },
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-mid': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'rise-bubble': 'riseBubble 8s linear infinite',
        'pour': 'pour 2.5s ease-out forwards',
        'wave': 'wave 8s ease-in-out infinite',
        'wave-slow': 'wave 12s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'drop-in': 'dropIn 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'ripple': 'ripple 2s ease-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        riseBubble: {
          '0%': { transform: 'translateY(0) scale(0.3)', opacity: '0' },
          '15%': { opacity: '0.7' },
          '80%': { opacity: '0.4' },
          '100%': { transform: 'translateY(-300px) scale(1)', opacity: '0' },
        },
        pour: {
          '0%': { height: '0%', opacity: '0' },
          '20%': { opacity: '1' },
          '100%': { height: '100%', opacity: '1' },
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        dropIn: {
          '0%': { transform: 'translateY(-60px) scale(0.8)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.6' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

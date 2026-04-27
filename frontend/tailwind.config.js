/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          green: '#00ff87',
          teal: '#00d4aa',
          blue: '#00b4d8',
        },
        dark: {
          50: '#1a1a2e',
          100: '#16213e',
          200: '#0f3460',
          300: '#0a0a1a',
          400: '#050510',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0a1a 0%, #0f3460 50%, #00ff87 100%)',
        'card-gradient': 'linear-gradient(135deg, rgba(0,255,135,0.1) 0%, rgba(0,180,216,0.05) 100%)',
        'neon-gradient': 'linear-gradient(90deg, #00ff87, #00d4aa, #00b4d8)',
      },
      boxShadow: {
        neon: '0 0 20px rgba(0,255,135,0.3)',
        'neon-lg': '0 0 40px rgba(0,255,135,0.4)',
        glass: '0 8px 32px rgba(0,0,0,0.4)',
      },
      animation: {
        pulse2: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 3s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // RIDE-DISPATCHER Brand Palette
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a5b9ff',
          400: '#7b94ff',
          500: '#5469ff',  // Primary
          600: '#3a46f5',
          700: '#2d36e0',
          800: '#252cb5',
          900: '#232b8f',
          950: '#151a57',
        },
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Orange accent
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: { 500: '#10b981', 600: '#059669' },
        warning: { 500: '#f59e0b', 600: '#d97706' },
        danger:  { 500: '#ef4444', 600: '#dc2626' },
        // Dark mode backgrounds
        dark: {
          bg:      '#0a0b14',
          surface: '#111222',
          card:    '#161829',
          border:  '#1e2038',
          muted:   '#2a2d4a',
        },
        // Light mode
        light: {
          bg:      '#f8f9ff',
          surface: '#ffffff',
          card:    '#f1f4ff',
          border:  '#e0e7ff',
          muted:   '#9ca3af',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #0a0b14 0%, #111222 40%, #1a1236 100%)',
        'brand-gradient':   'linear-gradient(135deg, #5469ff 0%, #7b5ea7 100%)',
        'orange-gradient':  'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        'card-gradient':    'linear-gradient(145deg, rgba(84,105,255,0.08) 0%, rgba(123,94,167,0.05) 100%)',
        'glass':            'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      boxShadow: {
        'brand':  '0 0 30px rgba(84,105,255,0.25)',
        'card':   '0 4px 24px rgba(0,0,0,0.12)',
        'glow':   '0 0 60px rgba(84,105,255,0.15)',
        'orange': '0 0 30px rgba(249,115,22,0.3)',
        'inner-brand': 'inset 0 0 20px rgba(84,105,255,0.1)',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
        'float':      'float 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'spin-slow':  'spin 3s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp:   { '0%': { opacity: 0, transform: 'translateY(20px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: 0, transform: 'translateY(-10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn:   { '0%': { opacity: 0, transform: 'scale(0.95)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        pulseBrand:{ '0%, 100%': { boxShadow: '0 0 20px rgba(84,105,255,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(84,105,255,0.6)' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shimmer:   { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        bounceGentle: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-4px)' } },
        glowPulse: { '0%, 100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
      },
      backdropBlur: { xs: '2px' },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem' },
      spacing: { '18': '4.5rem', '88': '22rem', '128': '32rem' },
      zIndex: { '60': 60, '70': 70, '80': 80 },
    },
  },
  plugins: [
    // @tailwindcss/forms is included for form styling
  ],
};

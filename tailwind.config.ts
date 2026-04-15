import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/**
 * Design tokens migrados do prot\u00f3tipo HTML original (reference/index.html.html).
 * Paleta "amethyst / gold / emerald" preservada 1:1.
 */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        sf: {
          DEFAULT: '#131315',
          low: '#1c1b1d',
          c: '#201f21',
          hi: '#2a2a2c',
          top: '#353437',
          void: '#0e0e10',
        },
        // Amethyst (primary)
        am: {
          DEFAULT: '#edb1ff',
          dim: '#c9a0ff',
          deep: '#6e218d',
          darker: '#520070',
        },
        // On-surface texts
        on: {
          DEFAULT: '#e5e1e4',
          2: '#cfc2d5',
          3: '#988d9e',
        },
        ov: '#4d4353',
        // Accents
        gd: { DEFAULT: '#ffd700', dim: '#b8860b' },
        em: { DEFAULT: '#50c878', dim: '#2e8b57' },
        rb: '#e0115f',
        sp: '#4169e1',
        or: '#ff6b35',
        cy: '#00bcd4',
        vi: '#9c27b0',
        dia: '#b9f2ff',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['Manrope', 'sans-serif'],
      },
      backgroundImage: {
        gp: 'linear-gradient(135deg,#edb1ff 0%,#6e218d 100%)',
        'gp-h': 'linear-gradient(160deg,#c9a0ff 0%,#6e218d 60%,#520070 100%)',
        gg: 'linear-gradient(135deg,#ffd700,#b8860b)',
        ge: 'linear-gradient(135deg,#50c878,#2e8b57)',
        gr: 'linear-gradient(135deg,#e0115f,#9c1340)',
      },
      boxShadow: {
        'glow-am': '0 0 40px rgba(237,177,255,.1),0 0 80px rgba(110,33,141,.06)',
        'glow-gd': '0 0 30px rgba(255,215,0,.12)',
        amb: '0 20px 50px rgba(0,0,0,.5)',
        soft: '0 8px 24px rgba(0,0,0,.25)',
      },
      borderRadius: {
        card: '16px',
        'card-sm': '12px',
        chip: '99px',
      },
      maxWidth: {
        page: '500px',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideR: {
          from: { opacity: '0', transform: 'translateX(-14px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 12px rgba(237,177,255,.08)' },
          '50%': { boxShadow: '0 0 28px rgba(237,177,255,.22)' },
        },
        shake: {
          '0%,100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-4px)' },
          '40%': { transform: 'translateX(4px)' },
          '60%': { transform: 'translateX(-2px)' },
          '80%': { transform: 'translateX(2px)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
          '100%': { transform: 'translateY(-40px) rotate(360deg)', opacity: '0' },
        },
        pulseSoft: {
          '0%,100%': { opacity: '.6' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fadeUp .5s cubic-bezier(.22,1,.36,1) forwards',
        'fade-in': 'fadeIn .4s ease forwards',
        'slide-r': 'slideR .4s ease forwards',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
        shake: 'shake .4s ease',
        float: 'float 3s ease-in-out infinite',
        confetti: 'confetti 1s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [forms, containerQueries],
} satisfies Config;

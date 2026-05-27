import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Colores de mazos generados dinámicamente
    { pattern: /^(bg|text|border|from|to|ring)-(indigo|teal|violet|rose|amber|emerald|sky|fuchsia|orange|cyan)-(50|100|200|300|400|500|600|700|800|900)$/ },
  ],
  theme: {
    extend: {
      colors: {
        // ── Indigo — identidad visual principal ──────────────────────────────
        indigo: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81',
        },
        // ── Teal — acciones e interacciones ──────────────────────────────────
        teal: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6',
          600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a',
        },
        // ── Violet — IA y características especiales ──────────────────────────
        violet: {
          50:  '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe',
          300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6',
          600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95',
        },
        // ── Emerald — éxito ───────────────────────────────────────────────────
        emerald: {
          50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
          300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
          600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b',
        },
        // ── Amber — advertencia ───────────────────────────────────────────────
        amber: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b',
          600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f',
        },
        // ── Rose — peligro ────────────────────────────────────────────────────
        rose: {
          50:  '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3',
          300: '#fda4af', 400: '#fb7185', 500: '#f43f5e',
          600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337',
        },
        // ── Sky — información ─────────────────────────────────────────────────
        sky: {
          50:  '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd',
          300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
          600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e',
        },
        // ── Fuchsia — variante IA ─────────────────────────────────────────────
        fuchsia: {
          50:  '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe',
          300: '#f0abfc', 400: '#e879f9', 500: '#d946ef',
          600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75',
        },
        // ── Compatibilidad hacia atrás (mantiene clases existentes) ──────────
        primary: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8',
          500: '#4f46e5', // indigo profundo
          600: '#4338ca', 700: '#3730a3',
        },
        accent: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf',
          500: '#0d9488', // teal vibrante
          600: '#0f766e', 700: '#115e59',
        },
        success: {
          50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
          300: '#6ee7b7', 400: '#34d399',
          500: '#10b981',
          600: '#059669', 700: '#047857',
        },
        warning: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          300: '#fcd34d', 400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', 700: '#b45309',
        },
        danger: {
          50:  '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3',
          300: '#fda4af', 400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48', 700: '#be123c',
        },
        neutral: {
          50:  '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb',
          300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280',
          600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827',
        },
      },
      animation: {
        'flip':         'flip 0.6s ease-in-out',
        'fade-in':      'fadeIn 0.25s ease-in',
        'slide-up':     'slideUp 0.35s ease-out',
        'bounce-in':    'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-up':     'floatUp 0.9s ease-out forwards',
        'shake':        'shake 0.4s ease-out',
        'pulse-once':   'pulseOnce 0.35s ease-out',
        'confetti':     'confettiFall 2.5s ease-in forwards',
        'count-up':     'countUp 0.6s ease-out',
        'ring-spin':    'ringDraw 1.2s ease-out forwards',
        'timer-drain':  'timerDrain linear forwards',
      },
      keyframes: {
        flip:       { '0%': { transform: 'rotateY(0deg)' }, '50%': { transform: 'rotateY(90deg)' }, '100%': { transform: 'rotateY(0deg)' } },
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:    { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceIn:   { '0%': { transform: 'scale(0.75)', opacity: '0' }, '70%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        floatUp:    { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(-80px)', opacity: '0' } },
        shake:      { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
        pulseOnce:  { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.18)' }, '100%': { transform: 'scale(1)' } },
        confettiFall: { '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' }, '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' } },
        countUp:    { '0%': { transform: 'translateY(6px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        ringDraw:   { '0%': { strokeDashoffset: '283' }, '100%': { strokeDashoffset: 'var(--ring-offset)' } },
        timerDrain: { '0%': { width: '100%' }, '100%': { width: '0%' } },
      },
      boxShadow: {
        'colored-indigo': '0 4px 20px -4px rgba(99, 102, 241, 0.4)',
        'colored-teal':   '0 4px 20px -4px rgba(20, 184, 166, 0.4)',
        'colored-violet': '0 4px 20px -4px rgba(139, 92, 246, 0.4)',
        'colored-rose':   '0 4px 20px -4px rgba(244, 63, 94, 0.4)',
        'colored-amber':  '0 4px 20px -4px rgba(245, 158, 11, 0.4)',
        'card':           '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':     '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config

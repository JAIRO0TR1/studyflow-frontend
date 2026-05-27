import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    { pattern: /^(bg|text|border|from|to|ring)-(indigo|teal|violet|rose|amber|emerald|sky|fuchsia|orange|cyan|slate|stone)-(50|100|200|300|400|500|600|700|800|900|950)$/ },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // ── Slate (base institucional) ───────────────────────────────────────
        slate: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
        // ── Indigo — identidad principal (más profundo y elegante) ───────────
        indigo: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
          600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
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
        // ── Fuchsia — para fuego de racha ─────────────────────────────────────
        fuchsia: {
          50:  '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe',
          300: '#f0abfc', 400: '#e879f9', 500: '#d946ef',
          600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75',
        },
        orange: {
          50:  '#fff7ed', 100: '#ffedd5', 200: '#fed7aa',
          300: '#fdba74', 400: '#fb923c', 500: '#f97316',
          600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12',
        },
        // ── Compatibilidad hacia atrás ───────────────────────────────────────
        primary: {
          50:  '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe',
          300: '#a5b4fc', 400: '#818cf8',
          500: '#4f46e5', 600: '#4338ca', 700: '#312e81',
        },
        accent: {
          50:  '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4',
          300: '#5eead4', 400: '#2dd4bf',
          500: '#0d9488', 600: '#0f766e', 700: '#115e59',
        },
        success: {
          50:  '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0',
          300: '#6ee7b7', 400: '#34d399',
          500: '#10b981', 600: '#059669', 700: '#047857',
        },
        warning: {
          50:  '#fffbeb', 100: '#fef3c7', 200: '#fde68a',
          300: '#fcd34d', 400: '#fbbf24',
          500: '#f59e0b', 600: '#d97706', 700: '#b45309',
        },
        danger: {
          50:  '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3',
          300: '#fda4af', 400: '#fb7185',
          500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
        },
        // Neutral ahora mapea a slate (más institucional)
        neutral: {
          50:  '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0',
          300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b',
          600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a',
        },
      },
      animation: {
        'flip':          'flip 0.6s ease-in-out',
        'fade-in':       'fadeIn 0.3s ease-in',
        'fade-in-up':    'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'bounce-in':     'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float-up':      'floatUp 0.9s ease-out forwards',
        'shake':         'shake 0.4s ease-out',
        'pulse-once':    'pulseOnce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'confetti':      'confettiFall 2.5s ease-in forwards',
        'count-up':      'countUp 0.6s ease-out',
        'ring-spin':     'ringDraw 1.2s ease-out forwards',
        'card-enter':    'cardEnter 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        'flame-flicker': 'flameFlicker 1.2s ease-in-out infinite alternate',
        'flame-rise':    'flameRise 2s ease-in-out infinite',
        'shimmer':       'shimmer 2.4s linear infinite',
        'glow-pulse':    'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        flip:       { '0%': { transform: 'rotateY(0deg)' }, '50%': { transform: 'rotateY(90deg)' }, '100%': { transform: 'rotateY(0deg)' } },
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeInUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideUp:    { '0%': { transform: 'translateY(16px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        bounceIn:   { '0%': { transform: 'scale(0.85)', opacity: '0' }, '70%': { transform: 'scale(1.03)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        floatUp:    { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(-80px)', opacity: '0' } },
        shake:      { '0%,100%': { transform: 'translateX(0)' }, '20%,60%': { transform: 'translateX(-6px)' }, '40%,80%': { transform: 'translateX(6px)' } },
        pulseOnce:  { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' }, '100%': { transform: 'scale(1)' } },
        confettiFall: { '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' }, '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' } },
        countUp:    { '0%': { transform: 'translateY(6px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        ringDraw:   { '0%': { strokeDashoffset: '283' }, '100%': { strokeDashoffset: 'var(--ring-offset)' } },
        cardEnter:  { '0%': { transform: 'translateY(24px) scale(0.96)', opacity: '0' }, '100%': { transform: 'translateY(0) scale(1)', opacity: '1' } },
        flameFlicker: {
          '0%':   { transform: 'scaleY(1) scaleX(1) rotate(-2deg)' },
          '50%':  { transform: 'scaleY(1.08) scaleX(0.95) rotate(1deg)' },
          '100%': { transform: 'scaleY(0.95) scaleX(1.05) rotate(-1deg)' },
        },
        flameRise: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%':     { transform: 'translateY(-4px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%,100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%':     { opacity: '0.9',  transform: 'scale(1.06)' },
        },
      },
      boxShadow: {
        'card':           '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)',
        'card-hover':     '0 4px 12px rgba(15, 23, 42, 0.08), 0 2px 4px rgba(15, 23, 42, 0.04)',
        'card-elevated':  '0 10px 30px -8px rgba(15, 23, 42, 0.18), 0 4px 12px -4px rgba(15, 23, 42, 0.10)',
        'colored-indigo': '0 8px 24px -8px rgba(99, 102, 241, 0.5)',
        'colored-teal':   '0 8px 24px -8px rgba(20, 184, 166, 0.5)',
        'colored-violet': '0 8px 24px -8px rgba(139, 92, 246, 0.5)',
        'colored-rose':   '0 8px 24px -8px rgba(244, 63, 94, 0.5)',
        'colored-amber':  '0 8px 24px -8px rgba(245, 158, 11, 0.5)',
        'flame-orange':   '0 -8px 24px rgba(249, 115, 22, 0.6), 0 0 16px rgba(245, 158, 11, 0.4)',
        'flame-pink':     '0 -8px 24px rgba(217, 70, 239, 0.6), 0 0 16px rgba(244, 63, 94, 0.4)',
        'flame-violet':   '0 -8px 24px rgba(124, 58, 237, 0.7), 0 0 18px rgba(139, 92, 246, 0.5)',
        'flame-dark':     '0 -8px 28px rgba(30, 27, 75, 0.8), 0 0 22px rgba(76, 29, 149, 0.6)',
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
        'hero-radial':      'radial-gradient(ellipse at top, rgba(99, 102, 241, 0.08), transparent 60%)',
      },
    },
  },
  plugins: [],
} satisfies Config

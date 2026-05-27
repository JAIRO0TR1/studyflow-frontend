/**
 * RachaView — Llama animada estilo TikTok que escala de color con los días
 *
 * Tiers:
 *   0:     apagada (gris)
 *   1-2:   chispa (amarillo)
 *   3-6:   fuego básico (naranja/amarillo)
 *   7-13:  rosa/fucsia vibrante
 *   14-29: violeta brillante
 *   30-59: violeta oscuro
 *   60+:   negro/leyenda
 */

interface FlameTier {
  nombre:    string
  cssClass:  string
  gradient:  { core: string; mid: string; tip: string }
  glowColor: string
  particles: string[]
  label:     string
}

const TIERS: FlameTier[] = [
  // 0 — apagada
  {
    nombre: 'apagada', cssClass: '', label: 'Sin racha',
    gradient: { core: '#94a3b8', mid: '#cbd5e1', tip: '#e2e8f0' },
    glowColor: 'transparent',
    particles: ['#cbd5e1'],
  },
  // 1-2 — chispa
  {
    nombre: 'chispa', cssClass: '', label: 'Encendiendo',
    gradient: { core: '#facc15', mid: '#fcd34d', tip: '#fef3c7' },
    glowColor: 'rgba(250, 204, 21, 0.5)',
    particles: ['#facc15', '#fde047'],
  },
  // 3-6 — fuego básico
  {
    nombre: 'fuego', cssClass: '', label: 'En llamas',
    gradient: { core: '#ea580c', mid: '#f97316', tip: '#fbbf24' },
    glowColor: 'rgba(249, 115, 22, 0.6)',
    particles: ['#f59e0b', '#f97316', '#fbbf24'],
  },
  // 7-13 — rosa/fucsia
  {
    nombre: 'rosa', cssClass: 'flame-tier-pink', label: 'Imparable',
    gradient: { core: '#be185d', mid: '#ec4899', tip: '#f0abfc' },
    glowColor: 'rgba(217, 70, 239, 0.65)',
    particles: ['#ec4899', '#f472b6', '#e879f9'],
  },
  // 14-29 — violeta
  {
    nombre: 'violeta', cssClass: 'flame-tier-violet', label: 'Élite',
    gradient: { core: '#5b21b6', mid: '#7c3aed', tip: '#a78bfa' },
    glowColor: 'rgba(124, 58, 237, 0.75)',
    particles: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
  },
  // 30-59 — oscuro
  {
    nombre: 'oscuro', cssClass: 'flame-tier-dark', label: 'Maestría',
    gradient: { core: '#1e1b4b', mid: '#4c1d95', tip: '#7c3aed' },
    glowColor: 'rgba(30, 27, 75, 0.85)',
    particles: ['#312e81', '#4c1d95', '#6d28d9'],
  },
  // 60+ — leyenda
  {
    nombre: 'leyenda', cssClass: 'flame-tier-legend', label: 'Leyenda',
    gradient: { core: '#020617', mid: '#1e1b4b', tip: '#7e22ce' },
    glowColor: 'rgba(76, 29, 149, 0.9)',
    particles: ['#0f172a', '#1e1b4b', '#581c87'],
  },
]

function pickTier(dias: number): FlameTier {
  if (dias <= 0)  return TIERS[0]
  if (dias <= 2)  return TIERS[1]
  if (dias <= 6)  return TIERS[2]
  if (dias <= 13) return TIERS[3]
  if (dias <= 29) return TIERS[4]
  if (dias <= 59) return TIERS[5]
  return TIERS[6]
}

/**
 * Renderiza la llama. Tamaños: sm=32px, md=64px, lg=96px, xl=128px
 */
export function renderizarRacha(dias: number, size: 'sm' | 'md' | 'lg' | 'xl' = 'md'): string {
  const tier = pickTier(dias)
  const px   = { sm: 32, md: 64, lg: 96, xl: 128 }[size]
  const gradId = `flame-grad-${tier.nombre}-${Math.random().toString(36).slice(2, 8)}`

  // Partículas — más cuando más alto el tier
  const numParticulas = dias <= 0 ? 0 : Math.min(2 + Math.floor(dias / 5), 8)
  const particulas    = Array.from({ length: numParticulas }).map((_, i) => {
    const color = tier.particles[i % tier.particles.length]
    const drift = (Math.random() - 0.5) * 30
    const delay = (Math.random() * 2).toFixed(2)
    const dur   = (1.5 + Math.random() * 1.5).toFixed(2)
    const size  = (3 + Math.random() * 3).toFixed(1)
    const left  = (35 + Math.random() * 30).toFixed(0)
    return `
      <span class="absolute rounded-full pointer-events-none"
        style="
          width:${size}px;height:${size}px;
          background:${color};
          left:${left}%;bottom:18%;
          opacity:0.8;
          --drift:${drift}px;--rot:${Math.random() > 0.5 ? 180 : -180}deg;
          animation: flameParticleRise ${dur}s ease-out ${delay}s infinite;
        "></span>
    `
  }).join('')

  if (dias <= 0) {
    return `
      <div class="flame-wrap" style="width:${px}px;height:${px}px;">
        <svg class="flame-svg ${tier.cssClass}" width="${px}" height="${px}" viewBox="0 0 64 80" fill="none">
          <defs>
            <linearGradient id="${gradId}" x1="50%" y1="100%" x2="50%" y2="0%">
              <stop offset="0%"   stop-color="${tier.gradient.core}"/>
              <stop offset="60%"  stop-color="${tier.gradient.mid}"/>
              <stop offset="100%" stop-color="${tier.gradient.tip}"/>
            </linearGradient>
          </defs>
          <path d="M32 78 C12 78 8 62 14 48 C18 56 22 54 22 48 C22 38 28 30 32 18
            C36 30 42 38 42 48 C42 54 46 56 50 48 C56 62 52 78 32 78 Z"
            fill="url(#${gradId})" opacity="0.4"/>
        </svg>
      </div>
    `
  }

  return `
    <div class="flame-wrap" style="width:${px}px;height:${px + Math.floor(px * 0.1)}px;">
      <!-- Halo -->
      <span class="flame-glow" style="background:${tier.glowColor};"></span>

      <!-- Partículas de chispa -->
      ${particulas}

      <!-- Llama principal con animación -->
      <svg class="flame-svg ${tier.cssClass} animate-flame" width="${px}" height="${px}"
        viewBox="0 0 64 80" fill="none"
        style="transform-origin: 50% 100%;">
        <defs>
          <linearGradient id="${gradId}" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%"   stop-color="${tier.gradient.core}"/>
            <stop offset="50%"  stop-color="${tier.gradient.mid}"/>
            <stop offset="100%" stop-color="${tier.gradient.tip}"/>
          </linearGradient>
          <linearGradient id="${gradId}-inner" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%"   stop-color="${tier.gradient.mid}" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0.7"/>
          </linearGradient>
        </defs>

        <!-- Llama exterior -->
        <path d="M32 78 C12 78 8 62 14 48 C18 56 22 54 22 48 C22 38 28 30 32 18
          C36 30 42 38 42 48 C42 54 46 56 50 48 C56 62 52 78 32 78 Z"
          fill="url(#${gradId})"/>

        <!-- Llama interna (más brillante) -->
        <path d="M32 70 C22 70 20 60 24 50 C26 56 28 54 28 48
          C28 42 32 36 32 30 C32 36 36 42 36 48 C36 54 38 56 40 50
          C44 60 42 70 32 70 Z"
          fill="url(#${gradId}-inner)" opacity="0.75"/>
      </svg>
    </div>
  `
}

/**
 * Tarjeta completa de racha con llama + número + tier
 */
export function renderizarTarjetaRacha(dias: number, opciones?: {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  compacto?: boolean
}): string {
  const tier  = pickTier(dias)
  const size  = opciones?.size ?? 'lg'
  const cmp   = opciones?.compacto ?? false

  if (cmp) {
    // Versión compacta horizontal
    return `
      <div class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200/80 shadow-card">
        ${renderizarRacha(dias, 'md')}
        <div>
          <p class="text-2xl font-black tabular-nums leading-none"
            style="color:${tier.gradient.mid}">
            ${dias}
          </p>
          <p class="text-xs text-slate-500 leading-tight mt-1">
            día${dias !== 1 ? 's' : ''} de racha
          </p>
        </div>
        ${dias >= 3 ? `
          <span class="ml-auto badge badge-amber text-xs">${tier.label}</span>
        ` : ''}
      </div>
    `
  }

  // Versión grande centrada
  return `
    <div class="flex flex-col items-center gap-3 py-2">
      ${renderizarRacha(dias, size)}
      <div class="text-center">
        <div class="flex items-baseline gap-1.5 justify-center">
          <span class="text-4xl font-black tabular-nums leading-none"
            style="color:${tier.gradient.mid}">
            ${dias}
          </span>
          <span class="text-sm text-slate-500">
            día${dias !== 1 ? 's' : ''}
          </span>
        </div>
        <p class="text-xs font-semibold mt-1 uppercase tracking-widest"
          style="color:${dias > 0 ? tier.gradient.mid : '#94a3b8'}">
          ${tier.label}
        </p>
      </div>
    </div>
  `
}

/**
 * Mini llama inline para usar dentro de texto (e.g. junto al badge de racha)
 */
export function renderizarLlamaInline(dias: number): string {
  if (dias <= 0) return ''
  const tier = pickTier(dias)
  return `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
      style="background:${tier.gradient.tip}33;color:${tier.gradient.core}">
      <svg width="12" height="14" viewBox="0 0 64 80" fill="${tier.gradient.mid}">
        <path d="M32 78 C12 78 8 62 14 48 C18 56 22 54 22 48 C22 38 28 30 32 18
          C36 30 42 38 42 48 C42 54 46 56 50 48 C56 62 52 78 32 78 Z"/>
      </svg>
      ${dias}
    </span>
  `
}

/**
 * Obtener info del tier (para componentes que quieran personalizar)
 */
export function obtenerTierRacha(dias: number): { label: string; color: string } {
  const t = pickTier(dias)
  return { label: t.label, color: t.gradient.mid }
}

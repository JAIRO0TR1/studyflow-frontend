/**
 * Vista principal de mazos — incluye resumen de progreso integrado
 *
 * Estructura:
 *   - Hero con racha (fuego) + stats principales del día
 *   - Logros recientes
 *   - Grid de mazos
 */

import type { Mazo } from '@/models/Mazo'
import type { EstadisticasGlobales } from '@/models/Progreso'
import { mazoController } from '@/controllers/MazoController'
import { progresoController } from '@/controllers/ProgresoController'
import { renderizarRacha, obtenerTierRacha } from './RachaView'
import { SesionView } from './SesionView'

// 6 paletas de color para mazos
const PALETAS = [
  { grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', accent: '#6366f1', text: '#4338ca' },
  { grad: 'linear-gradient(135deg,#14b8a6,#10b981)', light: '#f0fdfa', accent: '#14b8a6', text: '#0f766e' },
  { grad: 'linear-gradient(135deg,#f43f5e,#ec4899)', light: '#fff1f2', accent: '#f43f5e', text: '#be123c' },
  { grad: 'linear-gradient(135deg,#f59e0b,#f97316)', light: '#fffbeb', accent: '#f59e0b', text: '#b45309' },
  { grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', light: '#f5f3ff', accent: '#8b5cf6', text: '#6d28d9' },
  { grad: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', light: '#f0f9ff', accent: '#0ea5e9', text: '#0369a1' },
]

const ALG_LABEL: Record<string, string> = { SM2: 'SM-2', LEITNER: 'Leitner', ALEATORIO: 'Aleatorio' }
const ALG_BADGE: Record<string, string> = { SM2: 'badge-indigo', LEITNER: 'badge-amber', ALEATORIO: 'badge-teal' }
const ALG_DESC:  Record<string, string> = {
  SM2: 'Repetición espaciada adaptativa',
  LEITNER: 'Sistema de cajas de Leitner',
  ALEATORIO: 'Orden aleatorio'
}

export class MazoListView {
  private container: HTMLElement
  private mazos: Mazo[] = []
  private stats: EstadisticasGlobales | null = null

  private onMazoClick?:   (mazo: Mazo) => void
  private onEditClick?:   (mazo: Mazo) => void
  private onDeleteClick?: (mazo: Mazo) => void
  private onNewClick?:    () => void
  private onVerProgresoClick?: () => void

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Container #${containerId} not found`)
    this.container = el
  }

  setEventHandlers(h: {
    onMazoClick?:   (mazo: Mazo) => void
    onEditClick?:   (mazo: Mazo) => void
    onDeleteClick?: (mazo: Mazo) => void
    onNewClick?:    () => void
    onVerProgresoClick?: () => void
  }): void {
    this.onMazoClick   = h.onMazoClick
    this.onEditClick   = h.onEditClick
    this.onDeleteClick = h.onDeleteClick
    this.onNewClick    = h.onNewClick
    this.onVerProgresoClick = h.onVerProgresoClick
  }

  async cargarMazos(): Promise<void> {
    this.mostrarSkeleton()
    try {
      // Cargar mazos y stats en paralelo
      const [mazos, stats] = await Promise.all([
        mazoController.cargarMazos(),
        progresoController.obtenerEstadisticasGlobales().catch(() => null),
      ])
      this.mazos = mazos
      this.stats = stats
      this.renderizar()
    } catch {
      this.mostrarError('Error al cargar mazos. Verifica la conexión con el servidor.')
    }
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────────

  private renderizar(): void {
    this.container.innerHTML = `
      <div class="animate-fade-in">

        <!-- HERO con racha + stats -->
        ${this.renderHero()}

        <!-- LOGROS RECIENTES -->
        ${this.renderLogrosRecientes()}

        <!-- MAZOS -->
        ${this.renderSeccionMazos()}

      </div>
    `
    this.bindEventos()
  }

  // ─── HERO ─────────────────────────────────────────────────────────────────────

  private renderHero(): string {
    const e            = this.stats
    const totalMazos   = e?.totalMazos ?? this.mazos.length
    const totalCards   = e?.totalTarjetas ?? this.mazos.reduce((acc, m) => acc + (m.totalTarjetas ?? 0), 0)
    const racha        = e?.rachaActual ?? 0
    // Datos de actividad de hoy desde localStorage (fuente confiable)
    const intentosHoy  = SesionView.obtenerIntentosHoy() || (e?.intentosHoy ?? 0)
    const aciertosHoy  = SesionView.obtenerAciertosHoy() || (e?.aciertosHoy ?? 0)
    const tiempoLocalSeg = SesionView.obtenerTiempoHoySegundos()
    const tiempoHoy    = tiempoLocalSeg > 0
      ? tiempoLocalSeg / 60
      : (e?.tiempoEstudiadoHoy ?? 0)
    const precHoy      = intentosHoy > 0 ? Math.round((aciertosHoy / intentosHoy) * 100) : 0
    const tierRacha    = obtenerTierRacha(racha)
    const saludo       = this.obtenerSaludo()

    return `
      <section class="home-section">
        <div class="rounded-2xl overflow-hidden border border-slate-200/80 shadow-card bg-white">
          <div class="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

            <!-- Columna 1: Racha con fuego -->
            <div class="p-6 lg:p-7 relative overflow-hidden"
              style="background:${racha > 0
                ? `linear-gradient(135deg, ${tierRacha.color}08, ${tierRacha.color}15)`
                : 'linear-gradient(135deg,#f8fafc,#f1f5f9)'};">
              <!-- Halo de fondo -->
              ${racha >= 7 ? `
                <div class="absolute -right-12 -bottom-12 w-44 h-44 rounded-full opacity-25 blur-3xl pointer-events-none"
                  style="background:${tierRacha.color};"></div>
              ` : ''}

              <div class="flex items-center justify-between gap-5 relative">
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                    ${saludo}
                  </p>
                  <div class="flex items-baseline gap-2 mb-1">
                    <span class="text-5xl font-black tabular-nums leading-none"
                      style="color:${racha > 0 ? tierRacha.color : '#94a3b8'}">
                      ${racha}
                    </span>
                    <span class="text-sm text-slate-500 font-medium">
                      día${racha !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p class="text-xs font-bold uppercase tracking-wider"
                    style="color:${racha > 0 ? tierRacha.color : '#94a3b8'}">
                    ${tierRacha.label}
                  </p>
                  ${racha === 0 ? `
                    <p class="text-xs text-slate-400 mt-2">Estudia hoy para iniciar tu racha</p>
                  ` : racha < 7 ? `
                    <p class="text-xs text-slate-500 mt-2">¡Sigue así! ${7 - racha} día${7 - racha !== 1 ? 's' : ''} para subir de nivel</p>
                  ` : `
                    <p class="text-xs text-slate-500 mt-2">¡Estás en racha! No la pierdas</p>
                  `}
                </div>

                <!-- Llama -->
                <div class="shrink-0">
                  ${renderizarRacha(racha, 'lg')}
                </div>
              </div>
            </div>

            <!-- Columna 2: Actividad de hoy -->
            <div class="p-6 lg:p-7">
              <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Actividad de hoy
                </p>
                ${intentosHoy > 0 ? `
                  <span class="badge badge-indigo">${precHoy}% precisión</span>
                ` : ''}
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <p class="text-2xl font-black text-slate-900 tabular-nums">${intentosHoy}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Tarjetas</p>
                </div>
                <div>
                  <p class="text-2xl font-black text-emerald-600 tabular-nums">${aciertosHoy}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Aciertos</p>
                </div>
                <div>
                  <p class="text-2xl font-black text-indigo-600 tabular-nums">${this.fmtTiempo(tiempoHoy)}</p>
                  <p class="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Tiempo</p>
                </div>
              </div>

              ${intentosHoy > 0 ? `
                <div class="mt-4 pt-4 border-t border-slate-100">
                  <div class="progress h-2">
                    <div class="h-full rounded-full transition-all duration-1000"
                      style="width:${precHoy}%;background:${this.colorBarra(precHoy)}"></div>
                  </div>
                </div>
              ` : `
                <div class="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                  Sin actividad hoy. ¡Empieza una sesión!
                </div>
              `}
            </div>

            <!-- Columna 3: Resumen total -->
            <div class="p-6 lg:p-7">
              <div class="flex items-center justify-between mb-4">
                <p class="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Tu biblioteca
                </p>
                <button id="btn-ver-mas-stats" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Ver detalle &rarr;
                </button>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3
                        .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966
                        8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18
                        18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-black text-slate-900 tabular-nums leading-none">${totalMazos}</p>
                    <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Mazos</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                    <svg class="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor" stroke-width="1.8">
                      <path stroke-linecap="round" stroke-linejoin="round"
                        d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12
                        0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0
                        0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0
                        0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25
                        2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"/>
                    </svg>
                  </div>
                  <div>
                    <p class="text-2xl font-black text-slate-900 tabular-nums leading-none">${totalCards}</p>
                    <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Tarjetas</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    `
  }

  // ─── LOGROS RECIENTES ─────────────────────────────────────────────────────────

  private renderLogrosRecientes(): string {
    const raw = JSON.parse(localStorage.getItem('sf_logros') ?? '{}')
    const ids = Object.keys(raw)
    if (ids.length === 0) return ''

    const logrosMap: Record<string, { nombre: string; icono: string; color: string }> = {
      first_session: { nombre: 'Primera sesión',   icono: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z', color: '#6366f1' },
      accuracy_90:   { nombre: 'Precisión élite',  icono: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',           color: '#10b981' },
      ai_challenger: { nombre: 'Desafiante IA',    icono: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z', color: '#8b5cf6' },
      perfect_game:  { nombre: 'Juego perfecto',   icono: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z', color: '#f59e0b' },
      high_scorer:   { nombre: 'Puntuador alto',   icono: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z', color: '#f43f5e' },
    }

    const items = ids.map(id => logrosMap[id] ? { id, ...logrosMap[id], fecha: raw[id] } : null).filter(Boolean) as Array<{ id: string; nombre: string; icono: string; color: string; fecha: string }>

    if (items.length === 0) return ''

    return `
      <section class="home-section">
        <div class="home-section-title">
          Logros desbloqueados
          <span class="ml-auto text-xs font-normal text-slate-400">${items.length} de 5</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          ${items.map((l, i) => `
            <div class="flex flex-col items-center gap-2 p-4 rounded-xl bg-white border border-amber-200/60
              hover:border-amber-300 hover:shadow-card-hover transition-all duration-200
              animate-fade-in-up stagger-${(i % 6) + 1}"
              style="background:linear-gradient(180deg,#fffbeb40,#ffffff);">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style="background:${l.color}15;">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="1.5" style="color:${l.color}">
                  <path stroke-linecap="round" stroke-linejoin="round" d="${l.icono}"/>
                </svg>
              </div>
              <p class="text-xs font-bold text-slate-700 text-center line-clamp-1">${l.nombre}</p>
              <p class="text-[10px] text-slate-400">${l.fecha}</p>
            </div>
          `).join('')}
        </div>
      </section>
    `
  }

  // ─── SECCIÓN MAZOS ────────────────────────────────────────────────────────────

  private renderSeccionMazos(): string {
    return `
      <section class="home-section">
        <!-- Header de sección -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <div class="home-section-title">
              Mis Mazos
              <span class="ml-2 text-xs font-normal text-slate-400">
                ${this.mazos.length} mazo${this.mazos.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p class="text-sm text-slate-500 ml-3.5">
              ${this.mazos.length === 0
                ? 'Crea tu primer mazo para comenzar a estudiar'
                : 'Selecciona un mazo para estudiar o gestionarlo'
              }
            </p>
          </div>
          <div class="flex gap-2">
            <button id="btn-nuevo-mazo" class="btn-primary text-sm gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Nuevo Mazo
            </button>
          </div>
        </div>

        ${this.mazos.length === 0 ? this.renderVacio() : this.renderGrid()}
      </section>
    `
  }

  private renderVacio(): string {
    return `
      <div class="text-center py-16 rounded-2xl bg-white border border-slate-200/80 animate-fade-in-up">
        <div class="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style="background:linear-gradient(135deg,#eef2ff,#e0e7ff);">
          <svg class="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6
              18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3
              .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-slate-800 mb-2">Sin mazos todavía</h3>
        <p class="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
          Crea tu primer mazo de estudio para comenzar a aprender.
        </p>
        <div class="flex gap-3 justify-center">
          <button id="btn-crear-primero" class="btn-primary">Crear primer mazo</button>
        </div>
      </div>
    `
  }

  private renderGrid(): string {
    return `
      <div class="grid-responsive">
        ${this.mazos.map((m, i) => this.renderCard(m, i)).join('')}
      </div>
    `
  }

  private renderCard(mazo: Mazo, idx: number): string {
    const paleta    = PALETAS[idx % PALETAS.length]
    const total     = mazo.totalTarjetas ?? (mazo as any).total_tarjetas ?? 0
    const algoritmo = mazo.algoritmo || 'SM2'
    const algLabel  = ALG_LABEL[algoritmo] || algoritmo
    const algBadge  = ALG_BADGE[algoritmo] || 'badge-slate'
    const algDesc   = ALG_DESC[algoritmo] || ''
    const record    = parseInt(localStorage.getItem(`sf_record_${mazo.id}`) ?? '0')
    const stagger   = (idx % 6) + 1

    return `
      <div class="card-mazo group animate-fade-in-up stagger-${stagger}" data-mazo-id="${mazo.id}">

        <!-- Franja superior con gradiente -->
        <div class="h-1.5 w-full" style="background:${paleta.grad}"></div>

        <div class="p-5">
          <!-- Nombre + acciones -->
          <div class="flex justify-between items-start gap-2 mb-3">
            <h3 class="font-bold text-slate-900 text-base leading-snug line-clamp-2
              transition-colors duration-200 group-hover:text-indigo-600">
              ${this.esc(mazo.nombre)}
            </h3>
            <div class="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button class="btn-edit-card w-8 h-8 flex items-center justify-center rounded-lg
                text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                data-mazo-id="${mazo.id}" title="Editar mazo">
                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5
                    4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
                </svg>
              </button>
              <button class="btn-delete-card w-8 h-8 flex items-center justify-center rounded-lg
                text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                data-mazo-id="${mazo.id}" title="Eliminar mazo">
                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107
                    1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456
                    0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1
                    3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916"/>
                </svg>
              </button>
            </div>
          </div>

          ${mazo.descripcion ? `
            <p class="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
              ${this.esc(mazo.descripcion)}
            </p>
          ` : ''}

          <div class="flex flex-wrap items-center gap-2 mb-4">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style="background:${paleta.light};color:${paleta.text}">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"/>
              </svg>
              ${total} tarjeta${total !== 1 ? 's' : ''}
            </div>
            <span class="badge ${algBadge}" title="${algDesc}">${algLabel}</span>
            ${record > 0 ? `
              <span class="badge badge-amber" title="Tu récord en Modo Desafío">
                <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25
                    L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${record.toLocaleString()}
              </span>
            ` : ''}
          </div>

          <button class="btn-estudiar-card w-full btn-accent text-sm justify-center">
            Abrir mazo
          </button>
        </div>
      </div>
    `
  }

  // ─── EVENTOS ──────────────────────────────────────────────────────────────────

  private bindEventos(): void {
    document.getElementById('btn-nuevo-mazo')?.addEventListener('click', () => this.onNewClick?.())
    document.getElementById('btn-crear-primero')?.addEventListener('click', () => this.onNewClick?.())
    document.getElementById('btn-ver-mas-stats')?.addEventListener('click', () => this.onVerProgresoClick?.())

    document.querySelectorAll<HTMLElement>('[data-mazo-id]').forEach(el => {
      el.addEventListener('click', e => {
        const t = e.target as HTMLElement
        if (t.closest('.btn-edit-card') || t.closest('.btn-delete-card') || t.closest('.btn-estudiar-card')) return
        const mazo = this.mazos.find(m => m.id === el.getAttribute('data-mazo-id'))
        if (mazo) this.onMazoClick?.(mazo)
      })
    })
    document.querySelectorAll('.btn-estudiar-card').forEach(btn => {
      btn.addEventListener('click', e => {
        const card = (e.target as HTMLElement).closest('[data-mazo-id]')
        const mazo = this.mazos.find(m => m.id === card?.getAttribute('data-mazo-id'))
        if (mazo) this.onMazoClick?.(mazo)
      })
    })
    document.querySelectorAll('.btn-edit-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const mazo = this.mazos.find(m => m.id === (e.currentTarget as HTMLElement).getAttribute('data-mazo-id'))
        if (mazo) this.onEditClick?.(mazo)
      })
    })
    document.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const mazo = this.mazos.find(m => m.id === (e.currentTarget as HTMLElement).getAttribute('data-mazo-id'))
        if (mazo && confirm(`¿Eliminar "${mazo.nombre}" y todas sus tarjetas? Esta acción no se puede deshacer.`)) {
          this.onDeleteClick?.(mazo)
        }
      })
    })
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────────────

  private obtenerSaludo(): string {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos días'
    if (h < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  private fmtTiempo(min: number): string {
    const totalSeg = Math.round(min * 60)
    if (totalSeg < 60) return totalSeg > 0 ? `${totalSeg}s` : '0s'
    if (min < 60) {
      const m = Math.floor(min)
      const s = Math.round((min - m) * 60)
      return s > 0 ? `${m}m ${s}s` : `${m}m`
    }
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  private colorBarra(pct: number): string {
    if (pct >= 80) return 'linear-gradient(90deg,#10b981,#059669)'
    if (pct >= 60) return 'linear-gradient(90deg,#38bdf8,#0ea5e9)'
    return 'linear-gradient(90deg,#fbbf24,#f59e0b)'
  }

  private mostrarSkeleton(): void {
    this.container.innerHTML = `
      <div class="animate-pulse space-y-6">
        <div class="rounded-2xl border border-slate-200/80 bg-white p-6 h-32"></div>
        <div class="grid-responsive">
          ${Array.from({ length: 6 }).map(() => `
            <div class="card-mazo overflow-hidden">
              <div class="h-1.5 bg-slate-200"></div>
              <div class="p-5">
                <div class="h-5 bg-slate-200 rounded mb-3 w-3/4"></div>
                <div class="h-3 bg-slate-100 rounded mb-4 w-full"></div>
                <div class="flex gap-2 mb-4">
                  <div class="h-6 w-20 bg-slate-100 rounded-full"></div>
                  <div class="h-6 w-16 bg-slate-100 rounded-full"></div>
                </div>
                <div class="h-9 bg-slate-100 rounded-lg"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private mostrarError(msg: string): void {
    this.container.innerHTML = `<div class="alert alert-danger max-w-lg mx-auto mt-8">${msg}</div>`
  }

  private esc(t: string): string {
    const d = document.createElement('div')
    d.textContent = t
    return d.innerHTML
  }
}

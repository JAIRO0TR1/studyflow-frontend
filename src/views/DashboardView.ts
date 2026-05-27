/**
 * Dashboard — estadísticas con anillo SVG de progreso y sistema de logros
 */

import type { Progreso, EstadisticasGlobales } from '@/models/Progreso'
import { progresoController } from '@/controllers/ProgresoController'
import { renderizarTarjetaRacha } from './RachaView'

interface Logro {
  id:          string
  nombre:      string
  descripcion: string
  icono:       string
  color:       string
}

const LOGROS: Logro[] = [
  { id: 'first_session', nombre: 'Primera sesión',     descripcion: 'Completaste tu primera sesión de estudio',  icono: 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.606 50.606 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5', color: '#6366f1' },
  { id: 'accuracy_90',   nombre: 'Precisión élite',    descripcion: 'Obtuviste 90%+ de precisión en una sesión',  icono: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',                        color: '#10b981' },
  { id: 'ai_challenger', nombre: 'Desafiante IA',       descripcion: 'Completaste el Modo Desafío con Gemini AI',  icono: 'M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z', color: '#8b5cf6' },
  { id: 'perfect_game',  nombre: 'Juego perfecto',      descripcion: 'Lograste 100% de precisión en el desafío IA', icono: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z', color: '#f59e0b' },
  { id: 'high_scorer',   nombre: 'Puntuador alto',      descripcion: 'Superaste los 2000 puntos en el desafío IA',  icono: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z', color: '#f43f5e' },
]

export class DashboardView {
  private container: HTMLElement
  private progreso: Progreso | null = null
  private estadisticasGlobales: EstadisticasGlobales | null = null
  private onIrAMazos?: () => void

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Container #${containerId} not found`)
    this.container = el
  }

  setEventHandlers(h: { onIrAMazos?: () => void }): void {
    this.onIrAMazos = h.onIrAMazos
  }

  async cargarProgreso(mazoId: string): Promise<void> {
    this.mostrarSkeleton()
    try {
      this.progreso = await progresoController.obtenerProgresoMazo(mazoId)
      this.renderMazo()
    } catch { this.mostrarError('Error al cargar estadísticas del mazo') }
  }

  async cargarEstadisticasGlobales(): Promise<void> {
    this.mostrarSkeleton()
    try {
      this.estadisticasGlobales = await progresoController.obtenerEstadisticasGlobales()
      this.renderGlobal()
    } catch { this.mostrarError('Error al cargar estadísticas globales') }
  }

  // ─── RENDER GLOBAL ───────────────────────────────────────────────────────────

  private renderGlobal(): void {
    if (!this.estadisticasGlobales) return
    const e             = this.estadisticasGlobales
    const totalMazos    = e.totalMazos    ?? 0
    const totalTarjetas = e.totalTarjetas ?? 0
    const rachaActual   = e.rachaActual   ?? 0
    const aciertosHoy   = e.aciertosHoy  ?? 0
    const intentosHoy   = e.intentosHoy  ?? 0
    const tiempoMin     = e.tiempoEstudiadoHoy ?? 0
    const precHoy       = intentosHoy > 0 ? Math.round((aciertosHoy / intentosHoy) * 100) : 0
    const logros        = this.obtenerLogros()

    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in">

        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Progreso Global</h1>
          <p class="page-subtitle">Estadísticas combinadas de todos tus mazos</p>
        </div>

        <!-- Stats principales con racha llamativa -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          ${this.statCard('Mazos creados',    totalMazos,                             'stat-card-indigo',  '#6366f1', 'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25')}
          ${this.statCard('Tarjetas totales', totalTarjetas,                          'stat-card-teal',    '#14b8a6', 'M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122')}
          <div class="card stat-card stat-card-amber">
            ${renderizarTarjetaRacha(rachaActual, { size: 'md' })}
          </div>
        </div>

        <!-- Actividad de hoy -->
        <div class="card">
          <h3 class="font-bold text-lg mb-5 text-neutral-900 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-teal-500 block"></span>
            Actividad de Hoy
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
            <div class="text-center p-4 rounded-xl bg-neutral-50">
              <p class="text-3xl font-black text-neutral-900">${intentosHoy}</p>
              <p class="text-xs text-neutral-500 mt-1">Tarjetas estudiadas</p>
            </div>
            <div class="text-center p-4 rounded-xl bg-emerald-50">
              <p class="text-3xl font-black text-emerald-600">${aciertosHoy}</p>
              <p class="text-xs text-neutral-500 mt-1">Aciertos</p>
            </div>
            <div class="text-center p-4 rounded-xl bg-indigo-50">
              <p class="text-3xl font-black text-indigo-600">${this.fmtTiempo(tiempoMin)}</p>
              <p class="text-xs text-neutral-500 mt-1">Tiempo de estudio</p>
            </div>
          </div>
          ${intentosHoy > 0 ? `
            <div class="pt-4 border-t border-neutral-100">
              <div class="flex justify-between text-sm mb-2">
                <span class="text-neutral-600">Precisión de hoy</span>
                <span class="font-bold text-indigo-600">${precHoy}%</span>
              </div>
              <div class="progress h-3">
                <div class="h-full rounded-full transition-all duration-700"
                  style="width:${precHoy}%;background:${this.colorBarra(precHoy)}"></div>
              </div>
            </div>
          ` : `
            <div class="pt-4 border-t border-neutral-100 text-center text-sm text-neutral-400 py-2">
              Aún no has estudiado hoy. ¡Empieza una sesión!
            </div>
          `}
        </div>

        <!-- Logros -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-neutral-900 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-amber-500 block"></span>
            Logros
            <span class="ml-auto text-sm font-normal text-neutral-400">
              ${logros.filter(l => l.obtenido).length} / ${LOGROS.length}
            </span>
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${LOGROS.map(logro => {
              const l = logros.find(x => x.id === logro.id)
              const obtenido = l?.obtenido ?? false
              return `
                <div class="achievement-card ${obtenido ? 'achievement-card-earned' : ''} opacity-${obtenido ? '100' : '50'}">
                  <div class="achievement-icon" style="background:${obtenido ? logro.color + '20' : '#f3f4f6'}">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      stroke-width="1.8" style="color:${obtenido ? logro.color : '#9ca3af'}">
                      <path stroke-linecap="round" stroke-linejoin="round" d="${logro.icono}"/>
                    </svg>
                  </div>
                  <div class="min-w-0">
                    <p class="font-semibold text-sm text-neutral-800">${logro.nombre}</p>
                    <p class="text-xs text-neutral-500 mt-0.5 line-clamp-1">${logro.descripcion}</p>
                    ${obtenido && l?.fecha ? `
                      <p class="text-xs text-amber-600 mt-0.5 font-medium">${l.fecha}</p>
                    ` : ''}
                  </div>
                </div>
              `
            }).join('')}
          </div>
        </div>

        ${totalMazos === 0 ? `
          <div class="card text-center py-12">
            <p class="text-neutral-600 mb-4">Crea tu primer mazo para comenzar a acumular estadísticas.</p>
            <button id="btn-ir-mazos" class="btn-accent">Ir a Mis Mazos</button>
          </div>
        ` : ''}
      </div>
    `

    document.getElementById('btn-ir-mazos')?.addEventListener('click', () => this.onIrAMazos?.())
  }

  // ─── RENDER MAZO ─────────────────────────────────────────────────────────────

  private renderMazo(): void {
    if (!this.progreso) return

    const p             = this.progreso
    const dominadas     = p.tarjetasDominadas   ?? 0
    const pendientes    = p.tarjetasPendientes  ?? 0
    const racha         = p.racha               ?? 0
    const precAciertos  = p.porcentajeAciertos  ?? 0
    const precCompletado = p.porcentajeCompletado ?? 0
    const diasRest      = progresoController.calcularDiasRestantes(pendientes)

    // Anillo SVG
    const radio     = 45
    const circun    = 2 * Math.PI * radio   // ≈ 283
    const offset    = circun - (circun * precCompletado / 100)

    this.container.innerHTML = `
      <div class="space-y-6 animate-fade-in">

        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Progreso del Mazo</h1>
          <p class="page-subtitle">Análisis detallado de tu desempeño</p>
        </div>

        <!-- Anillo + Stats principales -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

          <!-- Anillo de progreso -->
          <div class="card flex flex-col items-center justify-center py-8">
            <h3 class="font-semibold text-neutral-600 text-sm mb-4">Progreso General</h3>
            <div class="relative w-40 h-40 mb-4">
              <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                <circle class="progress-ring-track" cx="50" cy="50" r="${radio}" stroke-width="10"/>
                <circle class="progress-ring-fill" cx="50" cy="50" r="${radio}" stroke-width="10"
                  stroke="#6366f1" stroke-dasharray="${circun.toFixed(1)}"
                  stroke-dashoffset="${circun.toFixed(1)}"
                  style="--ring-offset:${offset.toFixed(1)};animation:ringDraw 1.2s ease-out 0.2s forwards"/>
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-indigo-600">${precCompletado}%</span>
                <span class="text-xs text-neutral-400">completado</span>
              </div>
            </div>
            <div class="flex gap-6 text-center">
              <div>
                <p class="text-xl font-bold text-emerald-600">${dominadas}</p>
                <p class="text-xs text-neutral-500">Dominadas</p>
              </div>
              <div>
                <p class="text-xl font-bold text-amber-500">${pendientes}</p>
                <p class="text-xs text-neutral-500">Pendientes</p>
              </div>
            </div>
          </div>

          <!-- Stats cuadrícula -->
          <div class="grid grid-cols-2 gap-3">
            <div class="card stat-card stat-card-amber">
              ${renderizarTarjetaRacha(racha, { size: 'md' })}
            </div>
            ${this.statCard('Precisión',  precAciertos,  'stat-card-indigo',  '#6366f1', 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z', progresoController.formatearPorcentaje(precAciertos))}
            ${this.statCard('Estimado',   diasRest,      'stat-card-teal',    '#14b8a6', 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5', diasRest === 0 ? 'Completado' : `${diasRest} días`)}
            ${this.statCard('Dominadas',  dominadas,     'stat-card-emerald', '#10b981', 'M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.606 50.606 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5', `${dominadas}/${dominadas + pendientes}`)}
          </div>
        </div>

        <!-- Fechas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="card">
            <p class="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Última sesión</p>
            <p class="text-lg font-bold text-neutral-900">
              ${p.ultimaSesion ? this.fmtFecha(p.ultimaSesion) : 'Sin sesiones aún'}
            </p>
          </div>
          <div class="card stat-card-indigo" style="border-top:3px solid #6366f1">
            <p class="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Próxima sesión</p>
            <p class="text-lg font-bold text-indigo-600">
              ${p.proximaSesion ? this.fmtFecha(p.proximaSesion) : 'Estudia hoy'}
            </p>
          </div>
        </div>

        <!-- Actividad 7 días -->
        <div class="card">
          <h3 class="font-bold text-lg mb-5 text-neutral-900 flex items-center gap-2">
            <span class="w-2 h-5 rounded-full bg-indigo-500 block"></span>
            Actividad — Últimos 7 Días
          </h3>
          <div class="flex gap-2 items-end h-24 justify-center">
            ${this.renderGrafico()}
          </div>
        </div>
      </div>
    `
  }

  // ─── HELPERS UI ──────────────────────────────────────────────────────────────

  private statCard(titulo: string, valor: number, clase: string, color: string, iconPath: string, etiqueta?: string): string {
    return `
      <div class="card stat-card ${clase}">
        <div class="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
          style="background:${color}20">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="1.8" style="color:${color}">
            <path stroke-linecap="round" stroke-linejoin="round" d="${iconPath}"/>
          </svg>
        </div>
        <p class="text-2xl font-black mb-0.5" style="color:${color}">${etiqueta ?? valor}</p>
        <p class="text-xs text-neutral-500">${titulo}</p>
      </div>
    `
  }

  private renderGrafico(): string {
    if (!this.progreso?.actividadUltimosMeses?.length) {
      return '<p class="text-neutral-400 text-sm mx-auto">Sin actividad registrada</p>'
    }
    const datos = this.progreso.actividadUltimosMeses.slice(-7)
    const max   = Math.max(...datos.map(a => a.tarjetasEstudiadas), 1)
    return datos.map(a => {
      const pct = (a.tarjetasEstudiadas / max) * 100
      const h   = Math.max(pct * 0.88, 4)  // px dentro de h-24 (96px)
      return `
        <div class="flex-1 flex flex-col items-center group gap-1">
          <div class="w-full rounded-t-md transition-all duration-300
            hover:opacity-80 relative"
            style="height:${h}px;background:linear-gradient(180deg,#6366f1,#8b5cf6);"
            title="${a.tarjetasEstudiadas} tarjetas">
          </div>
          <p class="text-xs text-neutral-400">${this.fmtDia(a.fecha)}</p>
        </div>
      `
    }).join('')
  }

  private obtenerLogros(): Array<Logro & { obtenido: boolean; fecha?: string }> {
    const raw = JSON.parse(localStorage.getItem('sf_logros') ?? '{}')
    return LOGROS.map(l => ({
      ...l,
      obtenido: !!raw[l.id],
      fecha: raw[l.id] ?? undefined,
    }))
  }

  private colorBarra(pct: number): string {
    if (pct >= 80) return 'linear-gradient(90deg,#10b981,#059669)'
    if (pct >= 60) return 'linear-gradient(90deg,#38bdf8,#0ea5e9)'
    return 'linear-gradient(90deg,#fbbf24,#f59e0b)'
  }

  private fmtTiempo(min: number): string {
    if (min < 1)  return '0 min'
    if (min < 60) return `${Math.round(min)} min`
    const h = Math.floor(min / 60)
    const m = Math.round(min % 60)
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  private fmtFecha(fecha: Date): string {
    const d    = new Date(fecha)
    const hoy  = new Date()
    const dias = Math.floor((hoy.getTime() - d.getTime()) / 86400000)
    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Ayer'
    if (dias < 7)  return `Hace ${dias} días`
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  }

  private fmtDia(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 2)
  }

  private mostrarSkeleton(): void {
    this.container.innerHTML = `
      <div class="animate-pulse space-y-5">
        <div class="page-header">
          <div class="h-7 w-48 bg-neutral-200 rounded mb-2"></div>
          <div class="h-4 w-64 bg-neutral-100 rounded"></div>
        </div>
        <div class="grid grid-cols-3 gap-4">
          ${Array.from({length:3}).map(() => `
            <div class="card h-32 bg-neutral-100 rounded-xl"></div>
          `).join('')}
        </div>
        <div class="card h-48 bg-neutral-50 rounded-xl"></div>
      </div>
    `
  }

  private mostrarError(msg: string): void {
    this.container.innerHTML = `
      <div class="alert alert-danger max-w-lg mx-auto mt-8">${msg}</div>
    `
  }
}

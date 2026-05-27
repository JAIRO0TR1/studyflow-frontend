/**
 * Sesión de estudio — con timer, atajos de teclado y confetti al completar
 */

import type { SesionActiva, RespuestaRegistro } from '@/models/Sesion'
import { TarjetaView } from './TarjetaView'
import { sesionController } from '@/controllers/SesionController'

type Calificacion = 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE'

export class SesionView {
  private container: HTMLElement
  private sesion: SesionActiva | null = null
  private tarjetaView: TarjetaView | null = null

  // Timer de sesión (tiempo total transcurrido)
  private timerSesion: ReturnType<typeof setInterval> | null = null
  private segundosTranscurridos = 0

  // Handlers de teclado
  private keyHandler: ((e: KeyboardEvent) => void) | null = null

  private onSesionFinalizada?: (resultado: RespuestaRegistro) => void
  private onSesionCancelada?: () => void

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Container #${containerId} not found`)
    this.container = el
  }

  setEventHandlers(h: {
    onSesionFinalizada?: (resultado: RespuestaRegistro) => void
    onSesionCancelada?: () => void
  }): void {
    this.onSesionFinalizada = h.onSesionFinalizada
    this.onSesionCancelada  = h.onSesionCancelada
  }

  mostrarSesion(sesion: SesionActiva): void {
    this.sesion = sesion
    this.renderizar()
    this.iniciarTimer()
    this.registrarTeclado()
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  private renderizar(): void {
    if (!this.sesion) return

    const progreso = sesionController.obtenerProgresoSesion()
    const pct      = progreso?.porcentaje ?? 0
    const actual   = progreso?.actual   ?? 0
    const total    = progreso?.total    ?? 0

    this.container.innerHTML = `
      <div class="max-w-2xl mx-auto animate-fade-in">

        <!-- Cabecera -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 class="text-xl font-bold text-neutral-900">Sesión de Estudio</h2>
            <div class="flex items-center gap-3 mt-1">
              <p class="text-sm text-neutral-500">Tarjeta ${actual} de ${total}</p>
              <span class="text-neutral-300">&bull;</span>
              <p id="session-timer" class="text-sm font-mono font-semibold text-indigo-600 tabular-nums">
                0:00
              </p>
            </div>
          </div>
          <button id="btn-cancelar" class="btn-secondary text-sm gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/>
            </svg>
            Salir
          </button>
        </div>

        <!-- Barra de progreso -->
        <div class="mb-8">
          <div class="flex justify-between text-xs text-neutral-400 mb-1.5">
            <span>${actual > 0 ? actual - 1 : 0} completadas</span>
            <span class="font-semibold text-indigo-600">${pct}%</span>
            <span>${total - actual} restantes</span>
          </div>
          <div class="progress h-3">
            <div class="progress-bar h-full" style="width:${pct}%"></div>
          </div>
        </div>

        <!-- Contenedor de tarjeta -->
        <div id="tarjeta-container" class="mb-6"></div>

        <!-- Hint teclado -->
        <p class="text-center text-xs text-neutral-400 mb-5" id="hint-texto">
          <span class="kbd">Espacio</span> para voltear &nbsp;&bull;&nbsp;
          <span class="kbd">1</span><span class="kbd">2</span><span class="kbd">3</span><span class="kbd">4</span>
          para calificar
        </p>

        <!-- Botones de calificación -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3" id="botones-calificacion">
          <button id="btn-no-supe" class="btn-rate btn-rate-no">
            <span class="block text-lg mb-0.5">&#x2715;</span>
            <span class="block text-xs font-normal opacity-80">No la supe</span>
            <span class="kbd mt-1 opacity-60 text-xs">1</span>
          </button>
          <button id="btn-dificil" class="btn-rate btn-rate-dif">
            <span class="block text-lg mb-0.5">&#x223C;</span>
            <span class="block text-xs font-normal opacity-80">Difícil</span>
            <span class="kbd mt-1 opacity-60 text-xs">2</span>
          </button>
          <button id="btn-bien" class="btn-rate btn-rate-bien">
            <span class="block text-lg mb-0.5">&#x2713;</span>
            <span class="block text-xs font-normal opacity-80">Bien</span>
            <span class="kbd mt-1 opacity-60 text-xs">3</span>
          </button>
          <button id="btn-facil" class="btn-rate btn-rate-facil">
            <span class="block text-lg mb-0.5">&#x2713;&#x2713;</span>
            <span class="block text-xs font-normal opacity-80">Fácil</span>
            <span class="kbd mt-1 opacity-60 text-xs">4</span>
          </button>
        </div>
      </div>
    `

    this.tarjetaView = new TarjetaView('tarjeta-container')
    this.tarjetaView.mostrarTarjeta(this.sesion.tarjetaActual)
    this.bindEventos()
  }

  // ─── EVENTOS ─────────────────────────────────────────────────────────────────

  private bindEventos(): void {
    document.getElementById('btn-cancelar')?.addEventListener('click', () => {
      if (confirm('¿Salir de la sesión? El progreso no se guardará.')) {
        this.limpiarTimer()
        this.limpiarTeclado()
        sesionController.cancelarSesion()
        this.onSesionCancelada?.()
      }
    })

    document.getElementById('btn-no-supe')?.addEventListener('click', () => this.calificar('NO_LA_SUPE'))
    document.getElementById('btn-dificil')?.addEventListener('click', () => this.calificar('DIFICIL'))
    document.getElementById('btn-bien')?.addEventListener('click',    () => this.calificar('BIEN'))
    document.getElementById('btn-facil')?.addEventListener('click',   () => this.calificar('FACIL'))
  }

  // ─── TECLADO ─────────────────────────────────────────────────────────────────

  private registrarTeclado(): void {
    this.limpiarTeclado()
    this.keyHandler = (e: KeyboardEvent) => {
      // No activar si hay foco en input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return

      switch (e.key) {
        case ' ':
        case 'Enter':
          e.preventDefault()
          this.tarjetaView?.voltearDesdeExterno()
          break
        case '1': this.calificar('NO_LA_SUPE'); break
        case '2': this.calificar('DIFICIL');    break
        case '3': this.calificar('BIEN');       break
        case '4': this.calificar('FACIL');      break
      }
    }
    document.addEventListener('keydown', this.keyHandler)
  }

  private limpiarTeclado(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler)
      this.keyHandler = null
    }
  }

  // ─── TIMER ───────────────────────────────────────────────────────────────────

  private iniciarTimer(): void {
    this.segundosTranscurridos = 0
    this.timerSesion = setInterval(() => {
      this.segundosTranscurridos++
      const el = document.getElementById('session-timer')
      if (el) el.textContent = this.formatearTiempo(this.segundosTranscurridos)
    }, 1000)
  }

  private limpiarTimer(): void {
    if (this.timerSesion) { clearInterval(this.timerSesion); this.timerSesion = null }
  }

  private formatearTiempo(seg: number): string {
    const m = Math.floor(seg / 60)
    const s = seg % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ─── CALIFICACIÓN ────────────────────────────────────────────────────────────

  private async calificar(cal: Calificacion): Promise<void> {
    if (!this.sesion) return
    this.deshabilitarBotones()

    try {
      const resultado = await sesionController.registrarRespuesta(
        this.sesion.tarjetaActual.id, cal
      )

      if (resultado.sesionCompletada) {
        this.limpiarTimer()
        this.limpiarTeclado()
        this.onSesionFinalizada?.(resultado)
        this.mostrarCompletado(resultado)
      } else {
        this.sesion = sesionController.obtenerSesionActiva()!
        this.renderizar()
        this.registrarTeclado()
      }
    } catch {
      alert('Error al registrar respuesta. Intenta de nuevo.')
      this.habilitarBotones()
    }
  }

  // ─── PANTALLA COMPLETADO ─────────────────────────────────────────────────────

  private mostrarCompletado(resultado: RespuestaRegistro): void {
    const stats  = resultado.estadisticas
    const pct    = stats?.porcentaje ?? 0
    const seg    = this.segundosTranscurridos
    const tiempo = this.formatearTiempo(seg)
    const esSesionCorta = seg < 60

    // Acumular tiempo real en localStorage (en segundos, por día)
    SesionView.acumularTiempoLocal(seg)

    if (pct >= 60 && !esSesionCorta) this.confetti()

    const gradoColor = pct >= 80 ? '#059669' : pct >= 60 ? '#0ea5e9' : '#f59e0b'
    const grado      = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'D'

    this.container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-6 animate-bounce-in">

        ${esSesionCorta ? `
          <!-- Alerta sesión corta -->
          <div class="mb-5 rounded-2xl p-4 text-left flex gap-3 items-start"
            style="background:#fef3c7;border:1.5px solid #fcd34d">
            <svg class="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24"
              stroke="#d97706" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0
                  2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898
                  0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"/>
            </svg>
            <div>
              <p class="font-semibold text-amber-800 text-sm">Sesión muy corta</p>
              <p class="text-amber-700 text-xs mt-0.5">
                Solo estudiaste ${tiempo}. Las sesiones de al menos 5 minutos
                son más efectivas para la retención a largo plazo.
              </p>
            </div>
          </div>
        ` : ''}

        <!-- Icono y grado -->
        <div class="mb-5">
          <div class="w-20 h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg"
            style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7">
            <svg class="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75
                M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-neutral-900 mb-1">¡Sesión completada!</h2>
          <p class="text-neutral-500 text-sm">Tiempo total: <strong>${tiempo}</strong></p>
        </div>

        ${stats ? `
          <!-- Grado + stats -->
          <div class="card-featured mb-5">
            <div class="text-5xl font-black mb-2" style="color:${gradoColor}">${grado}</div>

            <div class="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p class="text-2xl font-bold text-emerald-600">${stats.aciertos}</p>
                <p class="text-xs text-neutral-500 mt-0.5">Aciertos</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-rose-500">${stats.total - stats.aciertos}</p>
                <p class="text-xs text-neutral-500 mt-0.5">Fallos</p>
              </div>
              <div>
                <p class="text-2xl font-bold text-indigo-600">${pct}%</p>
                <p class="text-xs text-neutral-500 mt-0.5">Precisión</p>
              </div>
            </div>

            <!-- Barra -->
            <div class="progress h-3">
              <div class="h-full rounded-full transition-all duration-1000"
                style="width:${pct}%;background:${
                  pct >= 80
                    ? 'linear-gradient(90deg,#10b981,#059669)'
                    : pct >= 60
                    ? 'linear-gradient(90deg,#38bdf8,#0ea5e9)'
                    : 'linear-gradient(90deg,#fbbf24,#f59e0b)'
                }">
              </div>
            </div>
          </div>
        ` : ''}

        <button id="btn-volver" class="btn-accent w-full py-3">
          Volver al inicio
        </button>
      </div>
    `
    document.getElementById('btn-volver')?.addEventListener('click', () => this.onSesionCancelada?.())
  }

  // Acumula los segundos de esta sesión en localStorage bajo la clave del día actual
  static acumularTiempoLocal(segundos: number): void {
    const hoy = new Date().toISOString().slice(0, 10) // 'YYYY-MM-DD'
    const key = `sf_tiempo_${hoy}`
    const prev = parseInt(localStorage.getItem(key) ?? '0', 10)
    localStorage.setItem(key, String(prev + segundos))
  }

  // Devuelve los segundos acumulados hoy (lectura estática)
  static obtenerTiempoHoySegundos(): number {
    const hoy = new Date().toISOString().slice(0, 10)
    return parseInt(localStorage.getItem(`sf_tiempo_${hoy}`) ?? '0', 10)
  }

  // ─── UTILIDADES ──────────────────────────────────────────────────────────────

  private deshabilitarBotones(): void {
    document.querySelectorAll<HTMLButtonElement>('#botones-calificacion button').forEach(b => {
      b.disabled = true
      b.style.opacity = '0.5'
    })
  }

  private habilitarBotones(): void {
    document.querySelectorAll<HTMLButtonElement>('#botones-calificacion button').forEach(b => {
      b.disabled = false
      b.style.opacity = ''
    })
  }

  private confetti(): void {
    const colores = ['#6366f1', '#14b8a6', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6']
    for (let i = 0; i < 55; i++) {
      const el   = document.createElement('div')
      const size = Math.random() * 8 + 4
      el.style.cssText = `
        position:fixed;width:${size}px;height:${size}px;
        background:${colores[Math.floor(Math.random() * colores.length)]};
        left:${Math.random() * 100}vw;top:-10px;
        border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
        z-index:9999;pointer-events:none;
        animation:confettiFall ${1.8 + Math.random() * 2}s ease-in ${Math.random() * 0.6}s forwards;
      `
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 4500)
    }
  }
}

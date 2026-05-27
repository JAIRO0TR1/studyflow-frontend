/**
 * Componente para la sesión de estudio
 */

import type { SesionActiva, RespuestaRegistro } from '@/models/Sesion'
import { TarjetaView } from './TarjetaView'
import { sesionController } from '@/controllers/SesionController'

export class SesionView {
  private container: HTMLElement
  private sesion: SesionActiva | null = null
  private tarjetaView: TarjetaView | null = null
  private onSesionFinalizada?: (resultado: RespuestaRegistro) => void
  private onSesionCancelada?: () => void

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container with id ${containerId} not found`)
    }
    this.container = element
  }

  setEventHandlers(handlers: {
    onSesionFinalizada?: (resultado: RespuestaRegistro) => void
    onSesionCancelada?: () => void
  }) {
    this.onSesionFinalizada = handlers.onSesionFinalizada
    this.onSesionCancelada = handlers.onSesionCancelada
  }

  mostrarSesion(sesion: SesionActiva): void {
    this.sesion = sesion
    this.renderizar()
  }

  private renderizar(): void {
    if (!this.sesion) return

    const progreso = sesionController.obtenerProgresoSesion()
    const pct = progreso?.porcentaje || 0
    const actual = progreso?.actual || 0
    const total = progreso?.total || 0

    this.container.innerHTML = `
      <div class="max-w-2xl mx-auto animate-fade-in">
        <!-- Cabecera de sesión -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-xl font-bold text-neutral-900">Sesión de Estudio</h2>
            <p class="text-sm text-neutral-500 mt-0.5">Tarjeta ${actual} de ${total}</p>
          </div>
          <button id="btn-cancelar" class="btn-secondary text-sm">
            Salir
          </button>
        </div>

        <!-- Barra de progreso -->
        <div class="mb-8">
          <div class="progress mb-1.5">
            <div class="progress-bar" style="width: ${pct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-neutral-400">
            <span>${actual > 0 ? actual - 1 : 0} completadas</span>
            <span>${total - actual} restantes</span>
          </div>
        </div>

        <!-- Tarjeta -->
        <div id="tarjeta-container" class="mb-8"></div>

        <!-- Instrucción -->
        <p class="text-center text-xs text-neutral-400 mb-6">
          Haz clic en la tarjeta para ver la respuesta, luego califica tu desempeño
        </p>

        <!-- Botones de calificación -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button id="btn-no-supe" class="btn-danger flex-col gap-1 py-3">
            <span class="text-lg">✗</span>
            <span class="text-xs">No la supe</span>
          </button>
          <button id="btn-dificil" class="btn-warning flex-col gap-1 py-3">
            <span class="text-lg">~</span>
            <span class="text-xs">Difícil</span>
          </button>
          <button id="btn-bien" class="btn-accent flex-col gap-1 py-3">
            <span class="text-lg">✓</span>
            <span class="text-xs">Bien</span>
          </button>
          <button id="btn-facil" class="btn-success flex-col gap-1 py-3">
            <span class="text-lg">✓✓</span>
            <span class="text-xs">Fácil</span>
          </button>
        </div>
      </div>
    `

    this.tarjetaView = new TarjetaView('tarjeta-container')
    this.tarjetaView.mostrarTarjeta(this.sesion.tarjetaActual)
    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    document.getElementById('btn-cancelar')?.addEventListener('click', () => {
      if (confirm('¿Salir de la sesión? El progreso actual no se guardará.')) {
        sesionController.cancelarSesion()
        this.onSesionCancelada?.()
      }
    })

    document.getElementById('btn-no-supe')?.addEventListener('click', () =>
      this.registrarRespuesta('NO_LA_SUPE')
    )
    document.getElementById('btn-dificil')?.addEventListener('click', () =>
      this.registrarRespuesta('DIFICIL')
    )
    document.getElementById('btn-bien')?.addEventListener('click', () =>
      this.registrarRespuesta('BIEN')
    )
    document.getElementById('btn-facil')?.addEventListener('click', () =>
      this.registrarRespuesta('FACIL')
    )
  }

  private async registrarRespuesta(
    calificacion: 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE'
  ): Promise<void> {
    if (!this.sesion) return

    try {
      this.deshabilitarBotones()
      const resultado = await sesionController.registrarRespuesta(
        this.sesion.tarjetaActual.id,
        calificacion
      )

      if (resultado.sesionCompletada) {
        // Solo notificar y mostrar resultados cuando la sesión realmente termina
        this.onSesionFinalizada?.(resultado)
        this.mostrarFinalizado(resultado)
      } else {
        // Continuar con la siguiente tarjeta sin salir
        this.mostrarSesion(sesionController.obtenerSesionActiva()!)
      }
    } catch (error) {
      console.error('Error al registrar respuesta:', error)
      alert('Error al registrar respuesta. Intenta de nuevo.')
      this.habilitarBotones()
    }
  }

  private mostrarFinalizado(resultado: RespuestaRegistro): void {
    const stats = resultado.estadisticas

    this.container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-8 animate-fade-in">
        <div class="w-20 h-20 bg-success-100 rounded-full mx-auto mb-6 flex items-center justify-center border-2 border-success-300">
          <span class="text-3xl text-success-600">✓</span>
        </div>
        <h2 class="text-2xl font-bold text-neutral-900 mb-2">Sesión completada</h2>
        <p class="text-neutral-500 mb-8">Excelente trabajo. Tu progreso ha sido guardado.</p>

        ${stats ? `
          <div class="card-featured mb-8 text-left">
            <h3 class="font-semibold text-neutral-700 mb-4 text-center text-sm uppercase tracking-wide">
              Resultados de la sesión
            </h3>
            <div class="grid grid-cols-3 gap-4 mb-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-success-600">${stats.aciertos}</p>
                <p class="text-xs text-neutral-500 mt-1">Aciertos</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-danger-600">${stats.total - stats.aciertos}</p>
                <p class="text-xs text-neutral-500 mt-1">Fallos</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-accent-600">${stats.porcentaje}%</p>
                <p class="text-xs text-neutral-500 mt-1">Precisión</p>
              </div>
            </div>
            <div class="progress">
              <div class="progress-bar" style="width: ${stats.porcentaje}%"></div>
            </div>
          </div>
        ` : ''}

        <button id="btn-volver" class="btn-accent w-full">
          Volver al inicio
        </button>
      </div>
    `

    document.getElementById('btn-volver')?.addEventListener('click', () => {
      this.onSesionCancelada?.()
    })
  }

  private deshabilitarBotones(): void {
    document.querySelectorAll('button[id^="btn-"]').forEach(btn => {
      (btn as HTMLButtonElement).disabled = true
      btn.classList.add('opacity-50', 'cursor-not-allowed')
    })
  }

  private habilitarBotones(): void {
    document.querySelectorAll('button[id^="btn-"]').forEach(btn => {
      (btn as HTMLButtonElement).disabled = false
      btn.classList.remove('opacity-50', 'cursor-not-allowed')
    })
  }
}

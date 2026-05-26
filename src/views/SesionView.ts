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

    this.container.innerHTML = `
      <div>
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-neutral-900">Sesión de Estudio</h2>
            <button id="btn-cancelar" class="btn-secondary">
              Cancelar
            </button>
          </div>

          <!-- Barra de progreso -->
          <div class="space-y-2">
            <div class="progress">
              <div class="progress-bar" style="width: ${progreso?.porcentaje || 0}%"></div>
            </div>
            <p class="text-sm text-neutral-600">
              Tarjeta ${progreso?.actual || 0} de ${progreso?.total || 0}
            </p>
          </div>
        </div>

        <!-- Contenedor para la tarjeta -->
        <div id="tarjeta-container" class="mb-8"></div>

        <!-- Botones de respuesta -->
        <div class="flex gap-3 justify-center flex-wrap">
          <button id="btn-no-supe" class="btn-danger">
            No la supe
          </button>
          <button id="btn-dificil" class="btn-warning">
            Difícil
          </button>
          <button id="btn-bien" class="btn-accent">
            Bien
          </button>
          <button id="btn-facil" class="btn-success">
            Fácil
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
      if (confirm('¿Descartar sesión? Los cambios no se guardarán.')) {
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
        this.mostrarFinalizado(resultado)
      } else {
        this.mostrarSesion(sesionController.obtenerSesionActiva()!)
      }

      this.onSesionFinalizada?.(resultado)
    } catch (error) {
      console.error('Error al registrar respuesta:', error)
      alert('Error al registrar respuesta')
      this.habilitarBotones()
    }
  }

  private mostrarFinalizado(resultado: RespuestaRegistro): void {
    const stats = resultado.estadisticas

    this.container.innerHTML = `
      <div>
        <div class="text-center py-12">
          <div class="w-20 h-20 bg-success-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-3xl">✓</span>
          </div>
          <h2 class="text-3xl font-bold text-neutral-900 mb-2">Sesión completada</h2>
          <p class="text-neutral-600 mb-8">Excelente trabajo. Continúa estudiando mañana.</p>

          ${
            stats
              ? `
            <div class="bg-neutral-100 rounded-lg p-8 mb-8 max-w-md mx-auto">
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p class="text-2xl font-bold text-success-600">${stats.aciertos}</p>
                  <p class="text-neutral-600 text-sm">Aciertos</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-danger-600">${stats.total - stats.aciertos}</p>
                  <p class="text-neutral-600 text-sm">Fallos</p>
                </div>
                <div>
                  <p class="text-2xl font-bold text-accent-600">${stats.porcentaje}%</p>
                  <p class="text-neutral-600 text-sm">Precisión</p>
                </div>
              </div>
            </div>
          `
              : ''
          }

          <button id="btn-volver" class="btn-accent">
            Volver al inicio
          </button>
        </div>
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

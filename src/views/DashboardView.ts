/**
 * Componente para el panel de estadísticas y progreso
 */

import type { Progreso, EstadisticasGlobales } from '@/models/Progreso'
import { progresoController } from '@/controllers/ProgresoController'

export class DashboardView {
  private container: HTMLElement
  private progreso: Progreso | null = null
  private estadisticasGlobales: EstadisticasGlobales | null = null
  private onIrAMazos?: () => void

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container with id ${containerId} not found`)
    }
    this.container = element
  }

  setEventHandlers(handlers: { onIrAMazos?: () => void }): void {
    this.onIrAMazos = handlers.onIrAMazos
  }

  async cargarProgreso(mazoId: string): Promise<void> {
    try {
      this.progreso = await progresoController.obtenerProgresoMazo(mazoId)
      this.renderizar()
    } catch (error) {
      console.error('Error al cargar progreso:', error)
      this.mostrarError('Error al cargar estadísticas')
    }
  }

  async cargarEstadisticasGlobales(): Promise<void> {
    try {
      this.estadisticasGlobales = await progresoController.obtenerEstadisticasGlobales()
      this.renderizarGlobales()
    } catch (error) {
      console.error('Error al cargar estadísticas globales:', error)
      this.mostrarError('Error al cargar estadísticas globales')
    }
  }

  private renderizarGlobales(): void {
    if (!this.estadisticasGlobales) return
    const e = this.estadisticasGlobales

    const totalMazos = e.totalMazos ?? 0
    const totalTarjetas = e.totalTarjetas ?? 0
    const rachaActual = e.rachaActual ?? 0
    const aciertosHoy = e.aciertosHoy ?? 0
    const intentosHoy = e.intentosHoy ?? 0
    const tiempoMin = e.tiempoEstudiadoHoy ?? 0
    const precisionHoy = intentosHoy > 0 ? (aciertosHoy / intentosHoy) * 100 : 0

    this.container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900">Progreso Global</h2>
          <p class="text-neutral-500 mt-2">Estadísticas combinadas de todos tus mazos</p>
        </div>

        <!-- Estadísticas globales -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="card text-center">
            <p class="text-3xl font-bold text-accent-600 mb-2">${totalMazos}</p>
            <p class="text-sm text-neutral-600">Mazos creados</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-accent-600 mb-2">${totalTarjetas}</p>
            <p class="text-sm text-neutral-600">Tarjetas totales</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-accent-600 mb-2">${this.formatearRacha(rachaActual)}</p>
            <p class="text-sm text-neutral-600">Racha actual</p>
          </div>
        </div>

        <!-- Actividad de hoy -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-neutral-900">Actividad de Hoy</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-sm text-neutral-600 mb-1">Tarjetas estudiadas</p>
              <p class="text-2xl font-bold text-neutral-900">${intentosHoy}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-600 mb-1">Aciertos</p>
              <p class="text-2xl font-bold text-neutral-900">${aciertosHoy}</p>
            </div>
            <div>
              <p class="text-sm text-neutral-600 mb-1">Tiempo de estudio</p>
              <p class="text-2xl font-bold text-neutral-900">${this.formatearTiempo(tiempoMin)}</p>
            </div>
          </div>
          ${intentosHoy > 0 ? `
            <div class="mt-4 pt-4 border-t border-neutral-100">
              <div class="flex justify-between text-sm text-neutral-600 mb-2">
                <span>Precisión de hoy</span>
                <span>${precisionHoy.toFixed(1)}%</span>
              </div>
              <div class="progress">
                <div class="progress-bar" style="width: ${precisionHoy}%"></div>
              </div>
            </div>
          ` : `
            <div class="mt-4 pt-4 border-t border-neutral-100 text-center text-sm text-neutral-400">
              Aún no has estudiado hoy. ¡Empieza una sesión!
            </div>
          `}
        </div>

        ${totalMazos === 0 ? `
          <div class="card text-center py-12">
            <div class="w-16 h-16 bg-neutral-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span class="text-2xl">📚</span>
            </div>
            <p class="text-neutral-600 mb-4">Aún no tienes mazos. Crea el primero para comenzar.</p>
            <button id="btn-ir-mazos-global" class="btn-accent">Ir a Mis Mazos</button>
          </div>
        ` : `
          <div class="card text-center text-sm text-neutral-500">
            Para ver estadísticas detalladas de un mazo específico, abre el mazo y elige <strong>"Ver Progreso"</strong>.
          </div>
        `}
      </div>
    `

    document.getElementById('btn-ir-mazos-global')?.addEventListener('click', () => {
      this.onIrAMazos?.()
    })
  }

  private formatearTiempo(minutos: number): string {
    if (minutos < 1) return '0 min'
    if (minutos < 60) return `${Math.round(minutos)} min`
    const horas = Math.floor(minutos / 60)
    const mins = Math.round(minutos % 60)
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
  }

  private renderizar(): void {
    if (!this.progreso) return

    // Normalizar campos opcionales que el backend puede omitir
    const p = this.progreso
    const dominadas = p.tarjetasDominadas ?? 0
    const pendientes = p.tarjetasPendientes ?? 0
    const racha = p.racha ?? 0
    const porcentajeAciertos = p.porcentajeAciertos ?? 0
    const porcentajeCompletado = p.porcentajeCompletado ?? 0
    const diasRestantes = progresoController.calcularDiasRestantes(pendientes)

    this.container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900">Progreso y Estadísticas</h2>
          <p class="text-neutral-500 mt-2">Análisis detallado de tu desempeño</p>
        </div>

        <!-- Tarjetas de estadísticas principales -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          ${this.renderizarEstatica('Racha', racha, this.formatearRacha(racha))}
          ${this.renderizarEstatica('Dominadas', dominadas, `${dominadas}/${dominadas + pendientes}`)}
          ${this.renderizarEstatica('Precisión', porcentajeAciertos, progresoController.formatearPorcentaje(porcentajeAciertos))}
          ${this.renderizarEstatica('Estimado', diasRestantes, diasRestantes === 0 ? 'Completado' : diasRestantes + ' días')}
        </div>

        <!-- Barra de progreso -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-neutral-900">Progreso General</h3>
          <div class="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Completado</span>
            <span>${progresoController.formatearPorcentaje(porcentajeCompletado)}</span>
          </div>
          <div class="progress">
            <div
              class="progress-bar"
              style="width: ${porcentajeCompletado}%"
            ></div>
          </div>
        </div>

        <!-- Última sesión y próxima -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card">
            <p class="text-sm text-neutral-600 mb-2">Última sesión</p>
            <p class="text-lg font-bold text-neutral-900">
              ${p.ultimaSesion ? this.formatearFecha(p.ultimaSesion) : 'Sin sesiones aún'}
            </p>
          </div>
          <div class="card">
            <p class="text-sm text-neutral-600 mb-2">Próxima sesión</p>
            <p class="text-lg font-bold text-accent-600">
              ${p.proximaSesion ? this.formatearFecha(p.proximaSesion) : 'Estudia hoy'}
            </p>
          </div>
        </div>

        <!-- Actividad reciente -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-neutral-900">Actividad Últimos 7 Días</h3>
          <div class="flex gap-1 items-end h-20 justify-center">
            ${this.renderizarGraficoActividad()}
          </div>
        </div>
      </div>
    `
  }

  private renderizarEstatica(
    titulo: string,
    _valor: number,
    etiqueta: string
  ): string {
    return `
      <div class="card text-center">
        <p class="text-2xl font-bold text-accent-600 mb-2">${etiqueta}</p>
        <p class="text-sm text-neutral-600">${titulo}</p>
      </div>
    `
  }

  private renderizarGraficoActividad(): string {
    if (!this.progreso || !this.progreso.actividadUltimosMeses || this.progreso.actividadUltimosMeses.length === 0) {
      return '<p class="text-neutral-400 text-sm">Sin actividad registrada aún</p>'
    }

    const ultimos7 = this.progreso.actividadUltimosMeses.slice(-7)
    const max = Math.max(...ultimos7.map(a => a.tarjetasEstudiadas), 1)

    return ultimos7
      .map(actividad => {
        const altura = (actividad.tarjetasEstudiadas / max) * 100
        return `
        <div class="flex-1 flex flex-col items-center group">
          <div
            class="w-full bg-accent-500 rounded-t hover:bg-accent-600 transition-colors"
            style="height: ${Math.max(altura, 5)}px;"
            title="${actividad.tarjetasEstudiadas} tarjetas"
          ></div>
          <p class="text-xs text-neutral-500 mt-2">${this.formatearDia(actividad.fecha)}</p>
        </div>
      `
      })
      .join('')
  }

  private formatearRacha(racha: number): string {
    if (racha === 0) return 'Sin racha'
    if (racha === 1) return '1 día'
    return `${racha} días`
  }

  private formatearFecha(fecha: Date): string {
    const date = new Date(fecha)
    const hoy = new Date()
    const diferencia = hoy.getTime() - date.getTime()
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))

    if (dias === 0) return 'Hoy'
    if (dias === 1) return 'Ayer'
    if (dias < 7) return `Hace ${dias} días`
    return date.toLocaleDateString('es-ES')
  }

  private formatearDia(fecha: Date): string {
    const date = new Date(fecha)
    return date.toLocaleDateString('es-ES', { weekday: 'short' }).substring(0, 1)
  }

  private mostrarError(mensaje: string): void {
    this.container.innerHTML = `
      <div class="alert alert-danger">
        ${mensaje}
      </div>
    `
  }
}

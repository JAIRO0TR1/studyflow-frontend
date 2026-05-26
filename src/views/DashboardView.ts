/**
 * Componente para el panel de estadísticas y progreso
 */

import type { Progreso } from '@/models/Progreso'
import { progresoController } from '@/controllers/ProgresoController'

export class DashboardView {
  private container: HTMLElement
  private progreso: Progreso | null = null

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container with id ${containerId} not found`)
    }
    this.container = element
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

  private renderizar(): void {
    if (!this.progreso) return

    const diasRestantes = progresoController.calcularDiasRestantes(
      this.progreso.tarjetasPendientes
    )

    this.container.innerHTML = `
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-neutral-900">Progreso y Estadísticas</h2>
          <p class="text-neutral-500 mt-2">Análisis detallado de tu desempeño</p>
        </div>

        <!-- Tarjetas de estadísticas principales -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          ${this.renderizarEstatica('Racha', this.progreso.racha, this.formatearRacha(this.progreso.racha))}
          ${this.renderizarEstatica('Dominadas', this.progreso.tarjetasDominadas, `${this.progreso.tarjetasDominadas}/${this.progreso.tarjetasDominadas + this.progreso.tarjetasPendientes}`)}
          ${this.renderizarEstatica('Precisión', this.progreso.porcentajeAciertos, progresoController.formatearPorcentaje(this.progreso.porcentajeAciertos))}
          ${this.renderizarEstatica('Estimado', diasRestantes, diasRestantes === 0 ? 'Completado' : diasRestantes + ' días')}
        </div>

        <!-- Barra de progreso -->
        <div class="card">
          <h3 class="font-bold text-lg mb-4 text-neutral-900">Progreso General</h3>
          <div class="flex justify-between text-sm text-neutral-600 mb-2">
            <span>Completado</span>
            <span>${progresoController.formatearPorcentaje(this.progreso.porcentajeCompletado)}</span>
          </div>
          <div class="progress">
            <div
              class="progress-bar"
              style="width: ${this.progreso.porcentajeCompletado}%"
            ></div>
          </div>
        </div>

        <!-- Última sesión y próxima -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card">
            <p class="text-sm text-neutral-600 mb-2">Última sesión</p>
            <p class="text-lg font-bold text-neutral-900">
              ${this.formatearFecha(this.progreso.ultimaSesion)}
            </p>
          </div>
          <div class="card">
            <p class="text-sm text-neutral-600 mb-2">Próxima sesión</p>
            <p class="text-lg font-bold text-accent-600">
              ${this.formatearFecha(this.progreso.proximaSesion)}
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
    valor: number,
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
    if (!this.progreso || this.progreso.actividadUltimosMeses.length === 0) {
      return '<p class="text-neutral-400">Sin actividad</p>'
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

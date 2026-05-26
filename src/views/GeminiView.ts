/**
 * Componente para la revisión y aprobación de tarjetas generadas por Gemini
 */

import type { AnalisiaGeminiResponse, TarjetaSugerida } from '@/models/Gemini'
import { geminiController } from '@/controllers/GeminiController'

export class GeminiView {
  private container: HTMLElement
  private analisis: AnalisiaGeminiResponse | null = null
  private tarjetasSeleccionadas: Set<number> = new Set()
  private onAceptarClick?: (tarjetas: TarjetaSugerida[]) => void
  private onCancelarClick?: () => void

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container with id ${containerId} not found`)
    }
    this.container = element
  }

  setEventHandlers(handlers: {
    onAceptarClick?: (tarjetas: TarjetaSugerida[]) => void
    onCancelarClick?: () => void
  }) {
    this.onAceptarClick = handlers.onAceptarClick
    this.onCancelarClick = handlers.onCancelarClick
  }

  mostrarAnalisis(analisis: AnalisiaGeminiResponse): void {
    this.analisis = analisis
    this.tarjetasSeleccionadas.clear()
    this.renderizar()
  }

  private renderizar(): void {
    if (!this.analisis) return

    this.container.innerHTML = `
      <div class="max-w-4xl">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-neutral-900 mb-2">Análisis de Mazo con IA</h2>
          <p class="text-neutral-600">
            La IA ha analizado tu mazo y sugerido nuevas tarjetas para completar los temas faltantes.
          </p>
        </div>

        <!-- Resumen del análisis -->
        <div class="card mb-8">
          <h3 class="font-bold text-lg mb-4 text-neutral-900">Resumen del Análisis</h3>
          <p class="text-neutral-700 mb-6">${this.escaparHTML(this.analisis.resumen)}</p>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-success-50 p-4 rounded-lg border border-success-200">
              <p class="text-sm text-success-700 font-medium mb-1">Temas cubiertos</p>
              <p class="text-3xl font-bold text-success-600">${this.analisis.temasDetectados.length}</p>
            </div>
            <div class="bg-warning-50 p-4 rounded-lg border border-warning-200">
              <p class="text-sm text-warning-700 font-medium mb-1">Temas faltantes</p>
              <p class="text-3xl font-bold text-warning-600">${this.analisis.temasNoDetectados.length}</p>
            </div>
          </div>
        </div>

        <!-- Temas detectados y faltantes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div class="card">
            <h4 class="font-bold text-success-700 mb-4">Temas Cubiertos</h4>
            <div class="flex flex-wrap gap-2">
              ${this.analisis.temasDetectados.map(tema => `
                <span class="badge badge-success">
                  ${this.escaparHTML(tema)}
                </span>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <h4 class="font-bold text-warning-700 mb-4">Temas Faltantes</h4>
            <div class="flex flex-wrap gap-2">
              ${this.analisis.temasNoDetectados.map(tema => `
                <span class="badge badge-warning">
                  ${this.escaparHTML(tema)}
                </span>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Tarjetas sugeridas -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-lg text-neutral-900">
              Tarjetas Sugeridas (${this.analisis.tarjetasSugeridas.length})
            </h3>
            <label class="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
              <input
                type="checkbox"
                id="select-all"
                class="w-4 h-4 rounded border-neutral-300 focus:ring-accent-500"
              />
              Seleccionar todas
            </label>
          </div>

          <div class="space-y-3">
            ${this.analisis.tarjetasSugeridas.map((tarjeta, idx) => this.renderizarTarjetaSugerida(tarjeta, idx)).join('')}
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-4 justify-end pt-6 border-t border-neutral-200">
          <button id="btn-cancelar" class="btn-secondary">
            Rechazar
          </button>
          <button id="btn-aceptar" class="btn-accent">
            Agregar ${this.tarjetasSeleccionadas.size} tarjeta(s)
          </button>
        </div>
      </div>
    `

    this.attachEventListeners()
  }

  private renderizarTarjetaSugerida(tarjeta: TarjetaSugerida, indice: number): string {
    const isSelected = this.tarjetasSeleccionadas.has(indice)
    return `
      <div class="card flex gap-4 items-start hover-shadow">
        <input
          type="checkbox"
          class="tarjeta-checkbox w-5 h-5 mt-2 flex-shrink-0 rounded border-neutral-300 focus:ring-accent-500 cursor-pointer"
          data-index="${indice}"
          ${isSelected ? 'checked' : ''}
        />
        <div class="flex-1">
          <div class="mb-4">
            <p class="text-xs text-neutral-500 font-medium uppercase mb-2">Pregunta</p>
            <p class="font-bold text-neutral-900">${this.escaparHTML(tarjeta.frente)}</p>
          </div>
          <div class="mb-4">
            <p class="text-xs text-neutral-500 font-medium uppercase mb-2">Respuesta</p>
            <p class="text-neutral-700">${this.escaparHTML(tarjeta.reverso)}</p>
          </div>
          ${
            tarjeta.confianza
              ? `<div class="inline-block px-3 py-1 bg-neutral-100 rounded text-xs text-neutral-600">
                   Confianza: ${Math.round(tarjeta.confianza * 100)}%
                 </div>`
              : ''
          }
        </div>
      </div>
    `
  }

  private attachEventListeners(): void {
    // Checkbox individual
    document.querySelectorAll('.tarjeta-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const index = parseInt((e.target as HTMLElement).getAttribute('data-index') || '0')
        if ((e.target as HTMLInputElement).checked) {
          this.tarjetasSeleccionadas.add(index)
        } else {
          this.tarjetasSeleccionadas.delete(index)
        }
        this.actualizarBotones()
      })
    })

    // Seleccionar todas
    document.getElementById('select-all')?.addEventListener('change', (e) => {
      if ((e.target as HTMLInputElement).checked) {
        this.analisis?.tarjetasSugeridas.forEach((_, idx) => {
          this.tarjetasSeleccionadas.add(idx)
        })
      } else {
        this.tarjetasSeleccionadas.clear()
      }
      this.renderizar()
    })

    // Botones
    document.getElementById('btn-cancelar')?.addEventListener('click', () => {
      if (confirm('Descartar las tarjetas sugeridas?')) {
        geminiController.rechazarTarjetasSugeridas()
        this.onCancelarClick?.()
      }
    })

    document.getElementById('btn-aceptar')?.addEventListener('click', () => {
      const tarjetasAceptadas = this.analisis!.tarjetasSugeridas.filter((_, idx) =>
        this.tarjetasSeleccionadas.has(idx)
      )

      if (tarjetasAceptadas.length === 0) {
        alert('Selecciona al menos una tarjeta')
        return
      }

      this.onAceptarClick?.(tarjetasAceptadas)
    })
  }

  private actualizarBotones(): void {
    const btnAceptar = document.getElementById('btn-aceptar')
    if (btnAceptar) {
      btnAceptar.textContent = `Agregar ${this.tarjetasSeleccionadas.size} tarjeta(s)`
    }
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
  }
}

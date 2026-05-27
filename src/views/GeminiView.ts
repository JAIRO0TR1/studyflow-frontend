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
    // Pre-seleccionar todas las tarjetas
    analisis.tarjetasSugeridas.forEach((_, idx) => this.tarjetasSeleccionadas.add(idx))
    this.renderizar()
  }

  private renderizar(): void {
    if (!this.analisis) return

    // Si el backend devuelve temasNoDetectados vacío, derivarlos de las tarjetas sugeridas
    const temasDetectados = this.analisis.temasDetectados.length > 0
      ? this.analisis.temasDetectados
      : []

    const temasFaltantes = this.analisis.temasNoDetectados.length > 0
      ? this.analisis.temasNoDetectados
      : this.analisis.tarjetasSugeridas.map(t =>
          t.frente.length > 55 ? t.frente.substring(0, 55) + '…' : t.frente
        )

    const seleccionadas = this.tarjetasSeleccionadas.size
    const total = this.analisis.tarjetasSugeridas.length

    this.container.innerHTML = `
      <div class="max-w-3xl animate-fade-in">

        <!-- Cabecera -->
        <div class="page-header">
          <h2 class="page-title">Análisis con Inteligencia Artificial</h2>
          <p class="page-subtitle">
            Gemini analizó tu mazo y generó tarjetas para cubrir los temas faltantes.
            Revisa y selecciona las que deseas agregar.
          </p>
        </div>

        <!-- Resumen de cobertura -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div class="card text-center">
            <p class="text-3xl font-bold text-success-600 mb-1">${temasDetectados.length}</p>
            <p class="text-xs text-neutral-500 uppercase tracking-wide font-medium">Temas cubiertos</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-warning-600 mb-1">${temasFaltantes.length}</p>
            <p class="text-xs text-neutral-500 uppercase tracking-wide font-medium">Temas faltantes</p>
          </div>
          <div class="card text-center">
            <p class="text-3xl font-bold text-accent-600 mb-1">${total}</p>
            <p class="text-xs text-neutral-500 uppercase tracking-wide font-medium">Tarjetas nuevas</p>
          </div>
        </div>

        <!-- Temas detectados y faltantes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div class="card">
            <h4 class="text-xs font-semibold text-success-700 uppercase tracking-wide mb-3">
              Temas cubiertos en el mazo
            </h4>
            <div class="flex flex-wrap gap-2">
              ${temasDetectados.length > 0
                ? temasDetectados.map(t => `
                    <span class="badge badge-success">${this.escaparHTML(t)}</span>
                  `).join('')
                : `<p class="text-sm text-neutral-400 italic">Sin datos de cobertura disponibles</p>`
              }
            </div>
          </div>

          <div class="card">
            <h4 class="text-xs font-semibold text-warning-700 uppercase tracking-wide mb-3">
              Temas que se agregarán
            </h4>
            <div class="flex flex-wrap gap-2">
              ${temasFaltantes.length > 0
                ? temasFaltantes.map(t => `
                    <span class="badge badge-warning">${this.escaparHTML(t)}</span>
                  `).join('')
                : `<p class="text-sm text-neutral-400 italic">No se detectaron temas faltantes</p>`
              }
            </div>
          </div>
        </div>

        <!-- Tarjetas sugeridas -->
        <div class="mb-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-semibold text-neutral-800">
              Tarjetas sugeridas
              <span class="ml-2 badge badge-accent">${seleccionadas} / ${total} seleccionadas</span>
            </h3>
            <label class="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer select-none">
              <input
                type="checkbox"
                id="select-all"
                class="w-4 h-4 rounded border-neutral-300 text-accent-500 focus:ring-accent-400"
                ${seleccionadas === total && total > 0 ? 'checked' : ''}
              />
              Seleccionar todas
            </label>
          </div>

          <div class="space-y-3">
            ${this.analisis.tarjetasSugeridas.map((t, idx) => this.renderizarTarjeta(t, idx)).join('')}
          </div>
        </div>

        <!-- Botones de acción -->
        <div class="flex gap-3 justify-between pt-6 border-t border-neutral-200">
          <button id="btn-cancelar" class="btn-secondary">
            Descartar sugerencias
          </button>
          <button id="btn-aceptar" class="btn-accent">
            Agregar ${seleccionadas} tarjeta${seleccionadas !== 1 ? 's' : ''} al mazo
          </button>
        </div>
      </div>
    `

    this.attachEventListeners()
  }

  private renderizarTarjeta(tarjeta: TarjetaSugerida, indice: number): string {
    const isSelected = this.tarjetasSeleccionadas.has(indice)
    const confianzaPct = tarjeta.confianza ? Math.round(tarjeta.confianza * 100) : null

    return `
      <div class="card flex gap-4 items-start ${isSelected ? 'border-accent-300 bg-accent-50/30' : ''} transition-colors">
        <input
          type="checkbox"
          class="tarjeta-checkbox w-4 h-4 mt-1 flex-shrink-0 rounded border-neutral-300 text-accent-500 focus:ring-accent-400 cursor-pointer"
          data-index="${indice}"
          ${isSelected ? 'checked' : ''}
        />
        <div class="flex-1 min-w-0">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-neutral-400 font-semibold uppercase tracking-wide mb-1">Pregunta</p>
              <p class="text-sm font-semibold text-neutral-900">${this.escaparHTML(tarjeta.frente)}</p>
            </div>
            <div>
              <p class="text-xs text-neutral-400 font-semibold uppercase tracking-wide mb-1">Respuesta</p>
              <p class="text-sm text-neutral-700">${this.escaparHTML(tarjeta.reverso)}</p>
            </div>
          </div>
          ${confianzaPct !== null ? `
            <div class="mt-3 flex items-center gap-2">
              <div class="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                <div class="h-full bg-accent-400 rounded-full" style="width: ${confianzaPct}%"></div>
              </div>
              <span class="text-xs text-neutral-400">Relevancia ${confianzaPct}%</span>
            </div>
          ` : ''}
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
        this.actualizarContadores()
      })
    })

    // Seleccionar / deseleccionar todas
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

    // Botón rechazar
    document.getElementById('btn-cancelar')?.addEventListener('click', () => {
      if (confirm('¿Descartar todas las tarjetas sugeridas por la IA?')) {
        geminiController.rechazarTarjetasSugeridas()
        this.onCancelarClick?.()
      }
    })

    // Botón aceptar
    document.getElementById('btn-aceptar')?.addEventListener('click', () => {
      const tarjetasAceptadas = this.analisis!.tarjetasSugeridas.filter((_, idx) =>
        this.tarjetasSeleccionadas.has(idx)
      )

      if (tarjetasAceptadas.length === 0) {
        alert('Selecciona al menos una tarjeta para agregar al mazo.')
        return
      }

      this.onAceptarClick?.(tarjetasAceptadas)
    })
  }

  private actualizarContadores(): void {
    const n = this.tarjetasSeleccionadas.size

    // Actualizar badge del título
    const badge = document.querySelector('.badge-accent')
    if (badge) badge.textContent = `${n} / ${this.analisis?.tarjetasSugeridas.length} seleccionadas`

    // Actualizar botón aceptar
    const btn = document.getElementById('btn-aceptar')
    if (btn) btn.textContent = `Agregar ${n} tarjeta${n !== 1 ? 's' : ''} al mazo`

    // Actualizar estilos de cards
    document.querySelectorAll('.tarjeta-checkbox').forEach(cb => {
      const idx = parseInt((cb as HTMLInputElement).getAttribute('data-index') || '0')
      const card = cb.closest('.card') as HTMLElement | null
      if (card) {
        if (this.tarjetasSeleccionadas.has(idx)) {
          card.classList.add('border-accent-300', 'bg-accent-50/30')
        } else {
          card.classList.remove('border-accent-300', 'bg-accent-50/30')
        }
      }
    })
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
  }
}

/**
 * Componente para mostrar una tarjeta de estudio con efecto de volteo
 */

import type { Tarjeta } from '@/models/Tarjeta'

export class TarjetaView {
  private container: HTMLElement
  private tarjeta: Tarjeta | null = null
  private volteada: boolean = false

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container with id ${containerId} not found`)
    }
    this.container = element
  }

  mostrarTarjeta(tarjeta: Tarjeta): void {
    this.tarjeta = tarjeta
    this.volteada = false
    this.renderizar()
  }

  private renderizar(): void {
    if (!this.tarjeta) return

    this.container.innerHTML = `
      <div class="h-full flex items-center justify-center p-4">
        <div
          id="card-flip"
          class="w-full h-96 cursor-pointer perspective transition-transform duration-500"
          style="transform-style: preserve-3d;"
        >
          <div class="relative w-full h-full">
            <!-- Frente -->
            <div
              id="card-front"
              class="absolute w-full h-full card flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-accent-50 to-accent-100"
              style="transform: rotateY(0deg); backface-visibility: hidden;"
            >
              <p class="text-xs text-accent-600 uppercase tracking-widest mb-6 font-semibold">Pregunta</p>
              <p class="text-3xl font-bold text-neutral-900 mb-8">${this.escaparHTML(this.tarjeta.frente)}</p>
              <p class="text-sm text-neutral-500">Clic para ver respuesta</p>
            </div>

            <!-- Reverso -->
            <div
              id="card-back"
              class="absolute w-full h-full card flex flex-col justify-center items-center text-center p-8 bg-gradient-to-br from-success-50 to-success-100"
              style="transform: rotateY(180deg); backface-visibility: hidden;"
            >
              <p class="text-xs text-success-600 uppercase tracking-widest mb-6 font-semibold">Respuesta</p>
              <p class="text-2xl font-bold text-neutral-900 mb-8">${this.escaparHTML(this.tarjeta.reverso)}</p>
              <p class="text-sm text-neutral-500">Clic para ver pregunta</p>
            </div>
          </div>
        </div>
      </div>

      ${
        this.tarjeta.conPista && this.tarjeta.pista
          ? `
        <div class="mt-6 p-4 bg-warning-50 border border-warning-300 rounded-lg">
          <p class="text-sm text-warning-700">
            <strong>Pista:</strong> ${this.escaparHTML(this.tarjeta.pista)}
          </p>
        </div>
      `
          : ''
      }
    `

    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    const cardFlip = document.getElementById('card-flip')
    cardFlip?.addEventListener('click', () => this.voltearTarjeta())
  }

  private voltearTarjeta(): void {
    const cardFlip = document.getElementById('card-flip')
    if (!cardFlip) return

    this.volteada = !this.volteada

    const front = document.getElementById('card-front')
    const back = document.getElementById('card-back')

    if (this.volteada) {
      front?.style.setProperty('transform', 'rotateY(-180deg)')
      back?.style.setProperty('transform', 'rotateY(0deg)')
    } else {
      front?.style.setProperty('transform', 'rotateY(0deg)')
      back?.style.setProperty('transform', 'rotateY(180deg)')
    }
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
  }

  obtenerTarjeta(): Tarjeta | null {
    return this.tarjeta
  }

  estaVolteada(): boolean {
    return this.volteada
  }
}

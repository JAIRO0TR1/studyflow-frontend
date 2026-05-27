/**
 * Tarjeta de estudio con volteo 3D
 * Atajo de teclado: Espacio / Enter → voltear
 */

import type { Tarjeta } from '@/models/Tarjeta'

export class TarjetaView {
  private container: HTMLElement
  private tarjeta:   Tarjeta | null = null
  private volteada   = false

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Container #${containerId} not found`)
    this.container = el
  }

  mostrarTarjeta(tarjeta: Tarjeta): void {
    this.tarjeta  = tarjeta
    this.volteada = false
    this.renderizar()
  }

  /** Voltear desde fuera (atajo de teclado) */
  voltearDesdeExterno(): void {
    this.voltear()
  }

  estaVolteada(): boolean { return this.volteada }
  obtenerTarjeta(): Tarjeta | null { return this.tarjeta }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  private renderizar(): void {
    if (!this.tarjeta) return

    this.container.innerHTML = `
      <div class="flip-perspective w-full" style="height:280px;">
        <div id="flip-inner" class="flip-card-inner w-full h-full cursor-pointer"
          role="button" aria-label="Voltear tarjeta" tabindex="0">

          <!-- FRENTE -->
          <div class="flip-card-front w-full h-full">
            <div class="w-full h-full rounded-2xl flex flex-col justify-center items-center
              text-center p-8 border-2 border-indigo-100 shadow-lg"
              style="background:linear-gradient(145deg,#eef2ff,#e0e7ff);">

              <div class="flex items-center gap-2 mb-4">
                <div class="w-2 h-2 rounded-full bg-indigo-400"></div>
                <p class="text-xs font-bold text-indigo-500 uppercase tracking-widest">Pregunta</p>
                <div class="w-2 h-2 rounded-full bg-indigo-400"></div>
              </div>

              <p class="text-2xl sm:text-3xl font-bold text-neutral-900 leading-snug mb-6">
                ${this.esc(this.tarjeta.frente)}
              </p>

              <div class="flex items-center gap-2 text-indigo-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672Zm-7.518-.267A8.25
                    8.25 0 1 1 20.25 10.5M8.288 14.212A5.25 5.25 0 1 1 17.25 10.5"/>
                </svg>
                <span class="text-xs">Clic o <kbd class="kbd text-xs">Espacio</kbd> para ver respuesta</span>
              </div>
            </div>
          </div>

          <!-- REVERSO -->
          <div class="flip-card-back w-full h-full">
            <div class="w-full h-full rounded-2xl flex flex-col justify-center items-center
              text-center p-8 border-2 border-teal-200 shadow-lg"
              style="background:linear-gradient(145deg,#f0fdfa,#ccfbf1);">

              <div class="flex items-center gap-2 mb-4">
                <div class="w-2 h-2 rounded-full bg-teal-400"></div>
                <p class="text-xs font-bold text-teal-600 uppercase tracking-widest">Respuesta</p>
                <div class="w-2 h-2 rounded-full bg-teal-400"></div>
              </div>

              <p class="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug mb-6">
                ${this.esc(this.tarjeta.reverso)}
              </p>

              <p class="text-xs text-teal-500">Califica tu desempeño con los botones de abajo</p>
            </div>
          </div>

        </div>
      </div>

      ${this.tarjeta.conPista && this.tarjeta.pista ? `
        <div class="mt-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75
              7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823
              1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
          </svg>
          <p class="text-sm text-amber-700">
            <strong>Pista:</strong> ${this.esc(this.tarjeta.pista)}
          </p>
        </div>
      ` : ''}
    `

    document.getElementById('flip-inner')?.addEventListener('click', () => this.voltear())
  }

  // ─── VOLTEO ───────────────────────────────────────────────────────────────────

  private voltear(): void {
    const inner = document.getElementById('flip-inner')
    if (!inner) return
    this.volteada = !this.volteada
    inner.classList.toggle('flipped', this.volteada)
  }

  private esc(t: string): string {
    const d = document.createElement('div')
    d.textContent = t
    return d.innerHTML
  }
}

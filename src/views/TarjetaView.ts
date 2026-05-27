/**
 * Tarjeta de estudio con volteo 3D refinado
 *
 * Animaciones:
 *   - flip 3D con easing cubic-bezier suave (0.7s)
 *   - hover con tilt sutil y profundidad
 *   - aparición animada (cardEnter)
 *   - indicador visual de "lado" en la esquina
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

  voltearDesdeExterno(): void { this.voltear() }
  estaVolteada(): boolean { return this.volteada }
  obtenerTarjeta(): Tarjeta | null { return this.tarjeta }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  private renderizar(): void {
    if (!this.tarjeta) return

    this.container.innerHTML = `
      <div class="flip-perspective w-full animate-card-enter" style="height:300px;">
        <div id="flip-inner" class="flip-card-inner w-full h-full cursor-pointer"
          role="button" aria-label="Voltear tarjeta" tabindex="0">

          <!-- ═══ FRENTE ═══ -->
          <div class="flip-card-front w-full h-full">
            <div class="w-full h-full rounded-2xl flex flex-col justify-between
              p-7 sm:p-9 border border-indigo-200/60 shadow-card-elevated relative overflow-hidden"
              style="background:linear-gradient(155deg,#eef2ff 0%,#e0e7ff 60%,#c7d2fe 100%);">

              <!-- Decoración: círculo difuminado -->
              <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none"
                style="background:radial-gradient(circle,#818cf8,transparent 70%);"></div>
              <div class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
                style="background:radial-gradient(circle,#a5b4fc,transparent 70%);"></div>

              <!-- Cabecera -->
              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-2">
                  <span class="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                  <p class="text-xs font-bold text-indigo-600 uppercase tracking-[0.18em]">
                    Pregunta
                  </p>
                </div>
                <span class="text-[10px] font-mono font-semibold text-indigo-400/70 uppercase tracking-widest">
                  Frente
                </span>
              </div>

              <!-- Contenido centrado -->
              <div class="flex-1 flex items-center justify-center relative z-10 my-4">
                <p class="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug text-center
                  tracking-tight" style="text-wrap:balance;">
                  ${this.esc(this.tarjeta.frente)}
                </p>
              </div>

              <!-- Footer hint -->
              <div class="flex items-center justify-center gap-2 text-indigo-500/80 relative z-10">
                <svg class="w-4 h-4 animate-flame-rise" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="M19.5 8.25v.25l-7.5 4.5-7.5-4.5v-.25M4.5 8.25l7.5 4.5
                    7.5-4.5M4.5 8.25v6.5l7.5 4.5 7.5-4.5v-6.5"/>
                </svg>
                <span class="text-xs font-medium">
                  Clic o <span class="kbd">Espacio</span> para revelar
                </span>
              </div>
            </div>
          </div>

          <!-- ═══ REVERSO ═══ -->
          <div class="flip-card-back w-full h-full">
            <div class="w-full h-full rounded-2xl flex flex-col justify-between
              p-7 sm:p-9 border border-teal-200/60 shadow-card-elevated relative overflow-hidden"
              style="background:linear-gradient(155deg,#f0fdfa 0%,#ccfbf1 60%,#99f6e4 100%);">

              <!-- Decoración -->
              <div class="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 blur-2xl pointer-events-none"
                style="background:radial-gradient(circle,#2dd4bf,transparent 70%);"></div>
              <div class="absolute -bottom-12 -left-12 w-40 h-40 rounded-full opacity-20 blur-2xl pointer-events-none"
                style="background:radial-gradient(circle,#5eead4,transparent 70%);"></div>

              <!-- Cabecera -->
              <div class="flex items-center justify-between relative z-10">
                <div class="flex items-center gap-2">
                  <span class="inline-block w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <p class="text-xs font-bold text-teal-700 uppercase tracking-[0.18em]">
                    Respuesta
                  </p>
                </div>
                <span class="text-[10px] font-mono font-semibold text-teal-500/70 uppercase tracking-widest">
                  Reverso
                </span>
              </div>

              <!-- Contenido centrado -->
              <div class="flex-1 flex items-center justify-center relative z-10 my-4">
                <p class="text-xl sm:text-2xl font-bold text-slate-900 leading-snug text-center
                  tracking-tight" style="text-wrap:balance;">
                  ${this.esc(this.tarjeta.reverso)}
                </p>
              </div>

              <!-- Footer -->
              <div class="text-center relative z-10">
                <p class="text-xs text-teal-700/80 font-medium">
                  Califica tu desempeño con los botones de abajo
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      ${this.tarjeta.conPista && this.tarjeta.pista ? `
        <div class="mt-4 px-4 py-3 bg-amber-50 border border-amber-200/80 rounded-xl
          flex items-start gap-2.5 animate-fade-in-up" style="animation-delay:0.2s">
          <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75
              7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823
              1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>
          </svg>
          <p class="text-sm text-amber-800 leading-snug">
            <strong>Pista:</strong> ${this.esc(this.tarjeta.pista)}
          </p>
        </div>
      ` : ''}
    `

    const inner = document.getElementById('flip-inner')
    inner?.addEventListener('click', () => this.voltear())
    inner?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault(); this.voltear()
      }
    })
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

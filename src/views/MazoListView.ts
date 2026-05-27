/**
 * Lista de mazos — tarjetas con identidad visual de color
 */

import type { Mazo } from '@/models/Mazo'
import { mazoController } from '@/controllers/MazoController'

// 6 paletas de color para diferenciar mazos visualmente
const PALETAS = [
  { grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff', accent: '#6366f1', text: '#4338ca', badge: 'badge-indigo',  label: 'Indigo'  },
  { grad: 'linear-gradient(135deg,#14b8a6,#10b981)', light: '#f0fdfa', accent: '#14b8a6', text: '#0f766e', badge: 'badge-teal',   label: 'Teal'    },
  { grad: 'linear-gradient(135deg,#f43f5e,#ec4899)', light: '#fff1f2', accent: '#f43f5e', text: '#be123c', badge: 'badge-rose',   label: 'Rose'    },
  { grad: 'linear-gradient(135deg,#f59e0b,#f97316)', light: '#fffbeb', accent: '#f59e0b', text: '#b45309', badge: 'badge-amber',  label: 'Amber'   },
  { grad: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', light: '#f5f3ff', accent: '#8b5cf6', text: '#6d28d9', badge: 'badge-violet', label: 'Violet'  },
  { grad: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', light: '#f0f9ff', accent: '#0ea5e9', text: '#0369a1', badge: 'badge-sky',   label: 'Sky'     },
]

const ALG_LABEL: Record<string, string> = {
  SM2: 'SM-2', LEITNER: 'Leitner', ALEATORIO: 'Aleatorio'
}

const ALG_BADGE: Record<string, string> = {
  SM2: 'badge-indigo', LEITNER: 'badge-amber', ALEATORIO: 'badge-teal'
}

const ALG_DESC: Record<string, string> = {
  SM2: 'Repetición espaciada adaptativa',
  LEITNER: 'Sistema de cajas de Leitner',
  ALEATORIO: 'Orden aleatorio'
}

export class MazoListView {
  private container: HTMLElement
  private mazos: Mazo[] = []
  private onMazoClick?:   (mazo: Mazo) => void
  private onEditClick?:   (mazo: Mazo) => void
  private onDeleteClick?: (mazo: Mazo) => void
  private onNewClick?:    () => void
  private onImportClick?: () => void

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Container #${containerId} not found`)
    this.container = el
  }

  setEventHandlers(h: {
    onMazoClick?:   (mazo: Mazo) => void
    onEditClick?:   (mazo: Mazo) => void
    onDeleteClick?: (mazo: Mazo) => void
    onNewClick?:    () => void
    onImportClick?: () => void
  }): void {
    this.onMazoClick   = h.onMazoClick
    this.onEditClick   = h.onEditClick
    this.onDeleteClick = h.onDeleteClick
    this.onNewClick    = h.onNewClick
    this.onImportClick = h.onImportClick
  }

  async cargarMazos(): Promise<void> {
    this.mostrarSkeleton()
    try {
      this.mazos = await mazoController.cargarMazos()
      this.renderizar()
    } catch {
      this.mostrarError('Error al cargar mazos. Verifica la conexión con el servidor.')
    }
  }

  // ─── RENDER PRINCIPAL ─────────────────────────────────────────────────────────

  private renderizar(): void {
    this.container.innerHTML = `
      <div class="animate-fade-in">

        <!-- Cabecera de página -->
        <div class="page-header flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 class="page-title">Mis Mazos</h1>
            <p class="page-subtitle">
              ${this.mazos.length === 0
                ? 'Crea tu primer mazo para comenzar a estudiar'
                : `${this.mazos.length} mazo${this.mazos.length !== 1 ? 's' : ''} de estudio`
              }
            </p>
          </div>
          <div class="flex gap-2">
            <button id="btn-importar-mazo" class="btn-secondary text-sm gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/>
              </svg>
              Importar
            </button>
            <button id="btn-nuevo-mazo" class="btn-accent text-sm gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15"/>
              </svg>
              Nuevo Mazo
            </button>
          </div>
        </div>

        ${this.mazos.length === 0 ? this.renderVacio() : this.renderGrid()}
      </div>
    `
    this.bindEventos()
  }

  private renderVacio(): string {
    return `
      <div class="text-center py-20 animate-fade-in">
        <div class="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style="background:linear-gradient(135deg,#eef2ff,#e0e7ff)">
          <svg class="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6
              18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3
              .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
          </svg>
        </div>
        <h3 class="text-lg font-bold text-neutral-800 mb-2">Sin mazos todavía</h3>
        <p class="text-neutral-500 text-sm mb-8 max-w-sm mx-auto">
          Crea tu primer mazo de estudio o importa uno existente en formato JSON.
        </p>
        <div class="flex gap-3 justify-center">
          <button id="btn-crear-primero" class="btn-accent">Crear primer mazo</button>
          <button id="btn-importar-primero" class="btn-secondary">Importar JSON</button>
        </div>
      </div>
    `
  }

  private renderGrid(): string {
    return `
      <div class="grid-responsive">
        ${this.mazos.map((m, i) => this.renderCard(m, i)).join('')}
      </div>
    `
  }

  private renderCard(mazo: Mazo, idx: number): string {
    const paleta   = PALETAS[idx % PALETAS.length]
    const total    = mazo.totalTarjetas ?? (mazo as any).total_tarjetas ?? 0
    const algoritmo = mazo.algoritmo || 'SM2'
    const algLabel  = ALG_LABEL[algoritmo] || algoritmo
    const algBadge  = ALG_BADGE[algoritmo] || 'badge-neutral'
    const algDesc   = ALG_DESC[algoritmo] || ''
    const record    = parseInt(localStorage.getItem(`sf_record_${mazo.id}`) ?? '0')

    return `
      <div class="card-mazo group" data-mazo-id="${mazo.id}">

        <!-- Franja de color superior -->
        <div class="h-1.5 w-full" style="background:${paleta.grad}"></div>

        <div class="p-5">

          <!-- Nombre + acciones -->
          <div class="flex justify-between items-start gap-2 mb-3">
            <h3 class="font-bold text-neutral-900 text-base leading-snug line-clamp-2
              group-hover:text-indigo-600 transition-colors" style="transition:color 0.15s">
              ${this.esc(mazo.nombre)}
            </h3>
            <div class="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="btn-edit-card w-8 h-8 flex items-center justify-center rounded-lg
                text-neutral-400 hover:text-indigo-500 hover:bg-indigo-50 transition-all"
                data-mazo-id="${mazo.id}" title="Editar mazo">
                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5
                    4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"/>
                </svg>
              </button>
              <button class="btn-delete-card w-8 h-8 flex items-center justify-center rounded-lg
                text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                data-mazo-id="${mazo.id}" title="Eliminar mazo">
                <svg class="w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16
                    19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456
                    0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0
                    0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964
                    51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Descripción -->
          ${mazo.descripcion ? `
            <p class="text-xs text-neutral-500 mb-3 line-clamp-2 leading-relaxed">
              ${this.esc(mazo.descripcion)}
            </p>
          ` : ''}

          <!-- Métricas -->
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <!-- Total tarjetas -->
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
              style="background:${paleta.light};color:${paleta.text}">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12
                  0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12
                  0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5
                  9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25
                  2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3
                  18v-6c0-.98.626-1.813 1.5-2.122"/>
              </svg>
              ${total} tarjeta${total !== 1 ? 's' : ''}
            </div>

            <!-- Algoritmo -->
            <span class="badge ${algBadge}" title="${algDesc}">${algLabel}</span>

            <!-- Récord si existe -->
            ${record > 0 ? `
              <span class="badge bg-amber-100 text-amber-700" title="Tu récord en Modo Desafío">
                <svg class="w-3 h-3 mr-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25
                    L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                ${record.toLocaleString()} pts
              </span>
            ` : ''}
          </div>

          <!-- Botón principal -->
          <button class="btn-estudiar-card w-full btn-accent text-sm justify-center">
            Abrir mazo
          </button>
        </div>
      </div>
    `
  }

  // ─── EVENTOS ──────────────────────────────────────────────────────────────────

  private bindEventos(): void {
    document.getElementById('btn-nuevo-mazo')?.addEventListener('click',    () => this.onNewClick?.())
    document.getElementById('btn-crear-primero')?.addEventListener('click', () => this.onNewClick?.())
    document.getElementById('btn-importar-mazo')?.addEventListener('click', () => this.onImportClick?.())
    document.getElementById('btn-importar-primero')?.addEventListener('click', () => this.onImportClick?.())

    // Click en tarjeta completa → abrir opciones
    document.querySelectorAll<HTMLElement>('[data-mazo-id]').forEach(el => {
      el.addEventListener('click', e => {
        const t = e.target as HTMLElement
        if (t.closest('.btn-edit-card') || t.closest('.btn-delete-card') || t.closest('.btn-estudiar-card')) return
        const mazo = this.mazos.find(m => m.id === el.getAttribute('data-mazo-id'))
        if (mazo) this.onMazoClick?.(mazo)
      })
    })

    // Botón "Abrir mazo"
    document.querySelectorAll('.btn-estudiar-card').forEach(btn => {
      btn.addEventListener('click', e => {
        const card  = (e.target as HTMLElement).closest('[data-mazo-id]')
        const mazo  = this.mazos.find(m => m.id === card?.getAttribute('data-mazo-id'))
        if (mazo) this.onMazoClick?.(mazo)
      })
    })

    // Editar
    document.querySelectorAll('.btn-edit-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const mazo = this.mazos.find(m => m.id === (e.currentTarget as HTMLElement).getAttribute('data-mazo-id'))
        if (mazo) this.onEditClick?.(mazo)
      })
    })

    // Eliminar
    document.querySelectorAll('.btn-delete-card').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation()
        const mazo = this.mazos.find(m => m.id === (e.currentTarget as HTMLElement).getAttribute('data-mazo-id'))
        if (mazo && confirm(`¿Eliminar "${mazo.nombre}" y todas sus tarjetas? Esta acción no se puede deshacer.`)) {
          this.onDeleteClick?.(mazo)
        }
      })
    })
  }

  // ─── ESTADOS AUXILIARES ───────────────────────────────────────────────────────

  private mostrarSkeleton(): void {
    this.container.innerHTML = `
      <div class="animate-pulse">
        <div class="page-header flex justify-between items-end">
          <div>
            <div class="h-7 w-32 bg-neutral-200 rounded-lg mb-2"></div>
            <div class="h-4 w-48 bg-neutral-100 rounded"></div>
          </div>
          <div class="h-10 w-32 bg-neutral-200 rounded-lg"></div>
        </div>
        <div class="grid-responsive">
          ${Array.from({ length: 6 }).map(() => `
            <div class="card-mazo overflow-hidden">
              <div class="h-1.5 bg-neutral-200"></div>
              <div class="p-5">
                <div class="h-5 bg-neutral-200 rounded mb-3 w-3/4"></div>
                <div class="h-3 bg-neutral-100 rounded mb-4 w-full"></div>
                <div class="flex gap-2 mb-4">
                  <div class="h-6 w-20 bg-neutral-100 rounded-full"></div>
                  <div class="h-6 w-16 bg-neutral-100 rounded-full"></div>
                </div>
                <div class="h-9 bg-neutral-100 rounded-lg"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private mostrarError(msg: string): void {
    this.container.innerHTML = `
      <div class="alert alert-danger max-w-lg mx-auto mt-8">${msg}</div>
    `
  }

  private esc(t: string): string {
    const d = document.createElement('div')
    d.textContent = t
    return d.innerHTML
  }
}

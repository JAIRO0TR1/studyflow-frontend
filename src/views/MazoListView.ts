/**
 * Componente para mostrar la lista de mazos
 */

import type { Mazo } from '@/models/Mazo'
import { mazoController } from '@/controllers/MazoController'

export class MazoListView {
  private container: HTMLElement
  private mazos: Mazo[] = []
  private onMazoClick?: (mazo: Mazo) => void
  private onEditClick?: (mazo: Mazo) => void
  private onDeleteClick?: (mazo: Mazo) => void
  private onNewClick?: () => void
  private onImportClick?: () => void

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) {
      throw new Error(`Container with id ${containerId} not found`)
    }
    this.container = element
  }

  setEventHandlers(handlers: {
    onMazoClick?: (mazo: Mazo) => void
    onEditClick?: (mazo: Mazo) => void
    onDeleteClick?: (mazo: Mazo) => void
    onNewClick?: () => void
    onImportClick?: () => void
  }) {
    this.onMazoClick = handlers.onMazoClick
    this.onEditClick = handlers.onEditClick
    this.onDeleteClick = handlers.onDeleteClick
    this.onNewClick = handlers.onNewClick
    this.onImportClick = handlers.onImportClick
  }

  async cargarMazos(): Promise<void> {
    try {
      this.mazos = await mazoController.cargarMazos()
      this.renderizar()
    } catch (error) {
      this.mostrarError('Error al cargar mazos. Verifica la conexión con el servidor.')
      console.error(error)
    }
  }

  private renderizar(): void {
    this.container.innerHTML = `
      <div class="animate-fade-in">
        <!-- Cabecera de página -->
        <div class="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="page-title">Mis Mazos</h1>
            <p class="page-subtitle">
              ${this.mazos.length === 0
                ? 'Crea tu primer mazo para comenzar a estudiar'
                : `${this.mazos.length} mazo${this.mazos.length !== 1 ? 's' : ''} de estudio`}
            </p>
          </div>
          <div class="flex gap-2">
            <button id="btn-importar-mazo" class="btn-secondary text-sm" title="Importar mazo desde archivo JSON">
              Importar
            </button>
            <button id="btn-nuevo-mazo" class="btn-accent text-sm">
              + Nuevo Mazo
            </button>
          </div>
        </div>

        ${this.mazos.length === 0
          ? this.renderizarVacio()
          : this.renderizarGrid()
        }
      </div>
    `

    this.attachEventListeners()
  }

  private renderizarVacio(): string {
    return `
      <div class="text-center py-20">
        <div class="w-16 h-16 bg-accent-100 rounded-full mx-auto mb-5 flex items-center justify-center">
          <span class="text-3xl text-accent-500">&#9633;</span>
        </div>
        <h3 class="text-lg font-semibold text-neutral-800 mb-2">Aún no tienes mazos</h3>
        <p class="text-neutral-500 text-sm mb-8 max-w-sm mx-auto">
          Crea tu primer mazo de estudio o importa uno existente para empezar
        </p>
        <div class="flex gap-3 justify-center">
          <button id="btn-crear-primero" class="btn-accent">Crear Mazo</button>
          <button id="btn-importar-primero" class="btn-secondary">Importar JSON</button>
        </div>
      </div>
    `
  }

  private renderizarGrid(): string {
    return `
      <div class="grid-responsive">
        ${this.mazos.map(m => this.renderizarCard(m)).join('')}
      </div>
    `
  }

  private renderizarCard(mazo: Mazo): string {
    const total     = mazo.totalTarjetas ?? mazo.total_tarjetas ?? 0
    const algoritmo = mazo.algoritmo || 'SM2'
    const algLabel: Record<string, string> = {
      SM2: 'SM-2', LEITNER: 'Leitner', ALEATORIO: 'Aleatorio'
    }
    const algText = algLabel[algoritmo] || algoritmo

    return `
      <div class="card-mazo group" data-mazo-id="${mazo.id}">
        <!-- Cabecera con nombre y acciones -->
        <div class="flex justify-between items-start gap-2 mb-3">
          <h3 class="font-bold text-neutral-900 text-base leading-tight group-hover:text-accent-600 transition-colors">
            ${this.escaparHTML(mazo.nombre)}
          </h3>
          <div class="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="btn-edit w-8 h-8 flex items-center justify-center rounded text-neutral-400 hover:text-accent-500 hover:bg-accent-50 transition-colors"
              data-mazo-id="${mazo.id}" title="Editar mazo"
            >&#9998;</button>
            <button
              class="btn-delete w-8 h-8 flex items-center justify-center rounded text-neutral-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
              data-mazo-id="${mazo.id}" title="Eliminar mazo"
            >&#10005;</button>
          </div>
        </div>

        ${mazo.descripcion
          ? `<p class="text-xs text-neutral-500 mb-3 line-clamp-2">${this.escaparHTML(mazo.descripcion)}</p>`
          : ''
        }

        <!-- Métricas del mazo -->
        <div class="flex items-center gap-3 text-xs text-neutral-500 mb-4">
          <span class="font-medium text-neutral-700">${total} tarjeta${total !== 1 ? 's' : ''}</span>
          <span class="text-neutral-300">&bull;</span>
          <span class="badge badge-accent text-xs">${algText}</span>
        </div>

        <!-- Botón de estudio -->
        <button class="btn-estudiar w-full btn-accent text-sm">
          Estudiar ahora
        </button>
      </div>
    `
  }

  private attachEventListeners(): void {
    document.getElementById('btn-nuevo-mazo')?.addEventListener('click', () =>
      this.onNewClick?.()
    )
    document.getElementById('btn-crear-primero')?.addEventListener('click', () =>
      this.onNewClick?.()
    )
    document.getElementById('btn-importar-mazo')?.addEventListener('click', () =>
      this.onImportClick?.()
    )
    document.getElementById('btn-importar-primero')?.addEventListener('click', () =>
      this.onImportClick?.()
    )

    // Clic en la tarjeta (abre opciones) — excepto botones de editar/eliminar/estudiar
    document.querySelectorAll('[data-mazo-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (target.closest('.btn-edit') || target.closest('.btn-delete') || target.closest('.btn-estudiar')) return
        const mazoId = el.getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo) this.onMazoClick?.(mazo)
      })
    })

    // Botones de estudio (van directamente a estudiar sin abrir opciones)
    document.querySelectorAll('.btn-estudiar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const card = (e.target as HTMLElement).closest('[data-mazo-id]')
        const mazoId = card?.getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo) this.onMazoClick?.(mazo)
      })
    })

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const mazoId = (e.currentTarget as HTMLElement).getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo) this.onEditClick?.(mazo)
      })
    })

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation()
        const mazoId = (e.currentTarget as HTMLElement).getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo && confirm(`¿Eliminar el mazo "${mazo.nombre}" y todas sus tarjetas?`)) {
          this.onDeleteClick?.(mazo)
        }
      })
    })
  }

  private mostrarError(mensaje: string): void {
    this.container.innerHTML = `
      <div class="alert alert-danger">${mensaje}</div>
    `
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
  }
}

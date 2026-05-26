/**
 * Componente para mostrar una lista de mazos
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
  }) {
    this.onMazoClick = handlers.onMazoClick
    this.onEditClick = handlers.onEditClick
    this.onDeleteClick = handlers.onDeleteClick
    this.onNewClick = handlers.onNewClick
  }

  async cargarMazos(): Promise<void> {
    try {
      this.mazos = await mazoController.cargarMazos()
      this.renderizar()
    } catch (error) {
      this.mostrarError('Error al cargar mazos')
      console.error(error)
    }
  }

  private renderizar(): void {
    this.container.innerHTML = `
      <div>
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-neutral-900">Mis Mazos</h1>
            <p class="text-neutral-500 mt-2">Administra tus mazos de estudio</p>
          </div>
          <button id="btn-nuevo-mazo" class="btn-accent">
            Nuevo Mazo
          </button>
        </div>

        ${
          this.mazos.length === 0
            ? this.renderizarVacio()
            : this.renderizarGridMazos()
        }
      </div>
    `

    this.attachEventListeners()
  }

  private renderizarVacio(): string {
    return `
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-neutral-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl text-neutral-400">Ø</span>
        </div>
        <p class="text-neutral-700 text-lg mb-2">No tienes mazos todavía</p>
        <p class="text-neutral-500 mb-6">Crea tu primer mazo para comenzar a estudiar</p>
        <button id="btn-crear-primero" class="btn-accent inline-block">
          Crear Primer Mazo
        </button>
      </div>
    `
  }

  private renderizarGridMazos(): string {
    return `
      <div class="grid-responsive">
        ${this.mazos.map(mazo => this.renderizarTarjetaMazo(mazo)).join('')}
      </div>
    `
  }

  private renderizarTarjetaMazo(mazo: Mazo): string {
    const total = mazo.totalTarjetas ?? mazo.total_tarjetas ?? 0
    const algoritmo = mazo.algoritmo || 'SM2'
    return `
      <div class="card hover-lift hover-shadow cursor-pointer" data-mazo-id="${mazo.id}">
        <div class="flex justify-between items-start mb-4">
          <div class="flex-1">
            <h3 class="font-bold text-lg text-neutral-900">${this.escaparHTML(mazo.nombre)}</h3>
            <p class="text-sm text-neutral-500 mt-1">${total} tarjeta${total !== 1 ? 's' : ''} · ${algoritmo}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button class="btn-edit text-accent-500 hover:text-accent-600 p-2 hover:bg-neutral-100 rounded" data-mazo-id="${mazo.id}" title="Editar">
              ✎
            </button>
            <button class="btn-delete text-danger-500 hover:text-danger-600 p-2 hover:bg-neutral-100 rounded" data-mazo-id="${mazo.id}" title="Eliminar">
              ×
            </button>
          </div>
        </div>

        ${mazo.descripcion ? `<p class="text-sm text-neutral-600 mb-3">${this.escaparHTML(mazo.descripcion)}</p>` : ''}

        <button class="w-full btn-accent text-sm mt-2">
          Estudiar ahora
        </button>
      </div>
    `
  }

  private attachEventListeners(): void {
    document.getElementById('btn-nuevo-mazo')?.addEventListener('click', () => {
      this.onNewClick?.()
    })

    document.getElementById('btn-crear-primero')?.addEventListener('click', () => {
      this.onNewClick?.()
    })

    document.querySelectorAll('[data-mazo-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).closest('.btn-edit')) return
        if ((e.target as HTMLElement).closest('.btn-delete')) return
        const mazoId = el.getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo) this.onMazoClick?.(mazo)
      })
    })

    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mazoId = (e.target as HTMLElement).getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo) this.onEditClick?.(mazo)
      })
    })

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mazoId = (e.target as HTMLElement).getAttribute('data-mazo-id')
        const mazo = this.mazos.find(m => m.id === mazoId)
        if (mazo && confirm(`¿Eliminar mazo "${mazo.nombre}"?`)) {
          this.onDeleteClick?.(mazo)
        }
      })
    })
  }

  private mostrarError(mensaje: string): void {
    this.container.innerHTML = `
      <div class="alert alert-danger">
        ${mensaje}
      </div>
    `
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
  }
}

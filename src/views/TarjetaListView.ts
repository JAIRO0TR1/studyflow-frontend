/**
 * Vista para gestionar tarjetas de un mazo (CRUD completo)
 */

import type { Tarjeta, TarjetaDTO } from '@/models/Tarjeta'
import type { Mazo } from '@/models/Mazo'
import { mazoController } from '@/controllers/MazoController'
import { tarjetaApi } from '@/api/tarjetaApi'

export class TarjetaListView {
  private container: HTMLElement
  private mazo: Mazo
  private tarjetas: Tarjeta[] = []
  private onVolver?: () => void

  constructor(containerId: string, mazo: Mazo) {
    const element = document.getElementById(containerId)
    if (!element) throw new Error(`Container with id ${containerId} not found`)
    this.container = element
    this.mazo = mazo
  }

  setEventHandlers(handlers: { onVolver?: () => void }): void {
    this.onVolver = handlers.onVolver
  }

  async cargarTarjetas(): Promise<void> {
    try {
      this.tarjetas = await tarjetaApi.obtenerPorMazo(this.mazo.id)
      this.renderizar()
    } catch {
      this.mostrarError('Error al cargar tarjetas')
    }
  }

  // ─── RENDER PRINCIPAL ────────────────────────────────────────────────────────

  private renderizar(): void {
    this.container.innerHTML = `
      <div>
        <div class="flex justify-between items-center mb-8">
          <div class="flex items-center gap-4">
            <button id="btn-volver-tarjetas" class="btn-secondary text-sm">← Volver</button>
            <div>
              <h1 class="text-3xl font-bold text-neutral-900">${this.escaparHTML(this.mazo.nombre)}</h1>
              <p class="text-neutral-500 mt-1">
                ${this.tarjetas.length} tarjeta${this.tarjetas.length !== 1 ? 's' : ''}
                · ${this.mazo.algoritmo || 'SM2'}
              </p>
            </div>
          </div>
          <button id="btn-nueva-tarjeta" class="btn-accent">+ Nueva Tarjeta</button>
        </div>

        ${this.tarjetas.length === 0 ? this.renderizarVacio() : this.renderizarLista()}
      </div>
    `
    this.attachEventListeners()
  }

  private renderizarVacio(): string {
    return `
      <div class="text-center py-16">
        <div class="w-16 h-16 bg-neutral-200 rounded-md mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl font-light text-neutral-400">[ ]</span>
        </div>
        <p class="text-neutral-700 text-lg mb-2">Sin tarjetas todavía</p>
        <p class="text-neutral-500 mb-6">
          Agrega la primera tarjeta para comenzar a estudiar.<br>
          También puedes usar <strong>Analizar con IA</strong> para generarlas automáticamente.
        </p>
        <button id="btn-crear-primera" class="btn-accent inline-block">Crear Primera Tarjeta</button>
      </div>
    `
  }

  private renderizarLista(): string {
    return `
      <div class="space-y-3">
        ${this.tarjetas.map(t => this.renderizarTarjeta(t)).join('')}
      </div>
    `
  }

  private renderizarTarjeta(tarjeta: Tarjeta): string {
    const tipoBadge = tarjeta.tipo === 'CODIGO'
      ? '<span class="text-xs font-medium px-2 py-0.5 rounded bg-accent-100 text-accent-700">Código</span>'
      : '<span class="text-xs font-medium px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">Texto</span>'

    return `
      <div class="card" data-tarjeta-id="${tarjeta.id}">
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              ${tipoBadge}
              ${tarjeta.etiquetas?.length ? `<span class="text-xs text-neutral-400">${tarjeta.etiquetas.join(', ')}</span>` : ''}
            </div>
            <p class="font-semibold text-neutral-900 mb-1">${this.escaparHTML(tarjeta.frente)}</p>
            <p class="text-sm text-neutral-600 border-t border-neutral-100 pt-2 mt-2">${this.escaparHTML(tarjeta.reverso)}</p>
            ${tarjeta.pista ? `<p class="text-xs text-neutral-400 mt-1 italic">💡 ${this.escaparHTML(tarjeta.pista)}</p>` : ''}
          </div>
          <div class="flex gap-1 shrink-0">
            <button
              class="btn-edit-tarjeta text-accent-500 hover:text-accent-600 p-2 hover:bg-neutral-100 rounded transition-colors"
              data-tarjeta-id="${tarjeta.id}"
              title="Editar tarjeta"
            >✎</button>
            <button
              class="btn-delete-tarjeta text-danger-500 hover:text-danger-600 p-2 hover:bg-neutral-100 rounded transition-colors"
              data-tarjeta-id="${tarjeta.id}"
              title="Eliminar tarjeta"
            >×</button>
          </div>
        </div>
      </div>
    `
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────────────────────────

  private attachEventListeners(): void {
    document.getElementById('btn-volver-tarjetas')?.addEventListener('click', () => {
      this.onVolver?.()
    })

    document.getElementById('btn-nueva-tarjeta')?.addEventListener('click', () => {
      this.mostrarModalCrear()
    })

    document.getElementById('btn-crear-primera')?.addEventListener('click', () => {
      this.mostrarModalCrear()
    })

    document.querySelectorAll('.btn-edit-tarjeta').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-tarjeta-id')
        const tarjeta = this.tarjetas.find(t => t.id === id)
        if (tarjeta) this.mostrarModalEditar(tarjeta)
      })
    })

    document.querySelectorAll('.btn-delete-tarjeta').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = (e.currentTarget as HTMLElement).getAttribute('data-tarjeta-id')
        const tarjeta = this.tarjetas.find(t => t.id === id)
        if (tarjeta && confirm(`¿Eliminar la tarjeta "${tarjeta.frente.substring(0, 50)}"?`)) {
          this.eliminarTarjeta(tarjeta.id)
        }
      })
    })
  }

  // ─── MODAL CREAR ─────────────────────────────────────────────────────────────

  private mostrarModalCrear(): void {
    this.eliminarModal()
    const modal = `
      <div class="modal-backdrop" id="modal-tarjeta">
        <div class="modal-content max-w-lg">
          <div class="card-header">
            <h2 class="text-xl font-bold">Nueva Tarjeta</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Frente (pregunta / concepto) *</label>
              <textarea id="input-frente" class="input" rows="3" placeholder="¿Qué es el patrón Factory Method?"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Reverso (respuesta / definición) *</label>
              <textarea id="input-reverso" class="input" rows="3" placeholder="Patrón creacional que define una interfaz para crear objetos..."></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                <select id="input-tipo" class="input">
                  <option value="TEXTO">📝 Texto</option>
                  <option value="CODIGO">{ } Código</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Etiquetas</label>
                <input id="input-etiquetas" type="text" class="input" placeholder="ej: java, patrones" />
              </div>
            </div>
            <div>
              <label class="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                <input type="checkbox" id="check-pista" class="rounded" />
                Agregar pista
              </label>
              <div id="campo-pista" class="hidden mt-2">
                <input id="input-pista" type="text" class="input" placeholder="Pista para recordar la respuesta..." />
              </div>
            </div>
            <p id="modal-tarjeta-error" class="text-danger-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Crear Tarjeta</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)
    this.attachModalListeners(null)
  }

  // ─── MODAL EDITAR ────────────────────────────────────────────────────────────

  private mostrarModalEditar(tarjeta: Tarjeta): void {
    this.eliminarModal()
    const etiquetasStr = tarjeta.etiquetas?.join(', ') || ''
    const modal = `
      <div class="modal-backdrop" id="modal-tarjeta">
        <div class="modal-content max-w-lg">
          <div class="card-header">
            <h2 class="text-xl font-bold">Editar Tarjeta</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Frente (pregunta / concepto) *</label>
              <textarea id="input-frente" class="input" rows="3">${this.escaparHTML(tarjeta.frente)}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Reverso (respuesta / definición) *</label>
              <textarea id="input-reverso" class="input" rows="3">${this.escaparHTML(tarjeta.reverso)}</textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                <select id="input-tipo" class="input">
                  <option value="TEXTO" ${tarjeta.tipo !== 'CODIGO' ? 'selected' : ''}>📝 Texto</option>
                  <option value="CODIGO" ${tarjeta.tipo === 'CODIGO' ? 'selected' : ''}>{ } Código</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-neutral-700 mb-1">Etiquetas</label>
                <input id="input-etiquetas" type="text" class="input" value="${this.escaparAtributo(etiquetasStr)}" placeholder="ej: java, patrones" />
              </div>
            </div>
            <div>
              <label class="flex items-center gap-2 text-sm font-medium text-neutral-700 cursor-pointer">
                <input type="checkbox" id="check-pista" class="rounded" ${tarjeta.conPista ? 'checked' : ''} />
                Agregar pista
              </label>
              <div id="campo-pista" class="${tarjeta.conPista ? '' : 'hidden'} mt-2">
                <input id="input-pista" type="text" class="input" value="${this.escaparAtributo(tarjeta.pista || '')}" placeholder="Pista para recordar la respuesta..." />
              </div>
            </div>
            <p id="modal-tarjeta-error" class="text-danger-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Guardar Cambios</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)
    this.attachModalListeners(tarjeta)
  }

  // ─── LÓGICA DE MODAL ─────────────────────────────────────────────────────────

  private attachModalListeners(tarjetaExistente: Tarjeta | null): void {
    const checkPista = document.getElementById('check-pista') as HTMLInputElement
    const campoPista = document.getElementById('campo-pista')

    checkPista?.addEventListener('change', () => {
      if (campoPista) {
        campoPista.classList.toggle('hidden', !checkPista.checked)
      }
    })

    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => {
      this.eliminarModal()
    })

    document.getElementById('modal-tarjeta')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-tarjeta')) this.eliminarModal()
    })

    document.getElementById('btn-modal-guardar')?.addEventListener('click', () => {
      if (tarjetaExistente) {
        this.guardarEdicion(tarjetaExistente.id)
      } else {
        this.guardarCreacion()
      }
    })
  }

  private leerDatosModal(): TarjetaDTO | null {
    const frente = (document.getElementById('input-frente') as HTMLTextAreaElement)?.value?.trim()
    const reverso = (document.getElementById('input-reverso') as HTMLTextAreaElement)?.value?.trim()
    const tipo = (document.getElementById('input-tipo') as HTMLSelectElement)?.value as 'TEXTO' | 'CODIGO'
    const etiquetasStr = (document.getElementById('input-etiquetas') as HTMLInputElement)?.value?.trim()
    const conPista = (document.getElementById('check-pista') as HTMLInputElement)?.checked
    const pista = (document.getElementById('input-pista') as HTMLInputElement)?.value?.trim()

    const errorEl = document.getElementById('modal-tarjeta-error')

    if (!frente) {
      if (errorEl) { errorEl.textContent = 'El frente es obligatorio'; errorEl.classList.remove('hidden') }
      return null
    }
    if (!reverso) {
      if (errorEl) { errorEl.textContent = 'El reverso es obligatorio'; errorEl.classList.remove('hidden') }
      return null
    }

    const etiquetas = etiquetasStr
      ? etiquetasStr.split(',').map(e => e.trim()).filter(Boolean)
      : []

    return { frente, reverso, tipo, etiquetas, conPista, pista: conPista ? pista : undefined }
  }

  private async guardarCreacion(): Promise<void> {
    const datos = this.leerDatosModal()
    if (!datos) return

    const btn = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btn) { btn.disabled = true; btn.textContent = 'Creando...' }

    try {
      await mazoController.agregarTarjeta(this.mazo.id, datos)
      this.eliminarModal()
      await this.cargarTarjetas()
    } catch {
      const errorEl = document.getElementById('modal-tarjeta-error')
      if (errorEl) { errorEl.textContent = 'Error al crear la tarjeta. Inténtalo de nuevo.'; errorEl.classList.remove('hidden') }
      if (btn) { btn.disabled = false; btn.textContent = 'Crear Tarjeta' }
    }
  }

  private async guardarEdicion(tarjetaId: string): Promise<void> {
    const datos = this.leerDatosModal()
    if (!datos) return

    const btn = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...' }

    try {
      await mazoController.editarTarjeta(tarjetaId, datos)
      this.eliminarModal()
      await this.cargarTarjetas()
    } catch {
      const errorEl = document.getElementById('modal-tarjeta-error')
      if (errorEl) { errorEl.textContent = 'Error al guardar los cambios. Inténtalo de nuevo.'; errorEl.classList.remove('hidden') }
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar Cambios' }
    }
  }

  private async eliminarTarjeta(tarjetaId: string): Promise<void> {
    try {
      await mazoController.eliminarTarjeta(tarjetaId)
      await this.cargarTarjetas()
    } catch {
      alert('Error al eliminar la tarjeta. Inténtalo de nuevo.')
    }
  }

  // ─── UTILIDADES ──────────────────────────────────────────────────────────────

  private eliminarModal(): void {
    document.getElementById('modal-tarjeta')?.remove()
    document.querySelector('.modal-backdrop')?.remove()
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

  private escaparAtributo(texto: string): string {
    return texto.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
}

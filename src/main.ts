import '@/styles/main.css'
import { router } from '@/router/router'
import { MazoListView } from '@/views/MazoListView'
import { SesionView } from '@/views/SesionView'
import { DashboardView } from '@/views/DashboardView'
import { GeminiView } from '@/views/GeminiView'
import { mazoController } from '@/controllers/MazoController'
import { sesionController } from '@/controllers/SesionController'
import { geminiController } from '@/controllers/GeminiController'
import type { Mazo } from '@/models/Mazo'

class App {
  private appContainer: HTMLElement | null = null
  private mazoListView: MazoListView | null = null
  private sesionView: SesionView | null = null
  private dashboardView: DashboardView | null = null
  private geminiView: GeminiView | null = null

  async inicializar(): Promise<void> {
    console.log('[App] Inicializando StudyFlow...')
    this.appContainer = document.getElementById('app')
    if (!this.appContainer) return

    this.renderizarLayout()
    this.configurarRutas()
    this.cargarRutaInicial()
    console.log('[App] StudyFlow listo')
  }

  private renderizarLayout(): void {
    this.appContainer!.innerHTML = `
      <div class="min-h-screen bg-neutral-50">
        <header class="header">
          <div class="main-container flex justify-between items-center py-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-accent-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">SF</span>
              </div>
              <h1 class="text-2xl font-bold text-primary-500">StudyFlow</h1>
            </div>
            <nav class="flex gap-6">
              <button id="nav-inicio" class="text-neutral-600 hover:text-accent-500 font-medium transition-colors">
                Mis Mazos
              </button>
              <button id="nav-dashboard" class="text-neutral-600 hover:text-accent-500 font-medium transition-colors">
                Progreso
              </button>
            </nav>
          </div>
        </header>
        <main class="main-container py-8">
          <div id="content"></div>
        </main>
      </div>
    `

    document.getElementById('nav-inicio')?.addEventListener('click', () => router.navegar('inicio'))
    document.getElementById('nav-dashboard')?.addEventListener('click', () => router.navegar('dashboard'))
  }

  private configurarRutas(): void {
    router.enRuta('inicio', () => this.mostrarInicio())
    router.enRuta('sesion', () => this.mostrarSesion())
    router.enRuta('dashboard', () => this.mostrarDashboard())
    router.enRuta('gemini', () => this.mostrarGemini())
  }

  private cargarRutaInicial(): void {
    router.navegar('inicio')
  }

  private limpiarContenido(): void {
    const content = document.getElementById('content')
    if (content) content.innerHTML = ''
  }

  // ─── INICIO ──────────────────────────────────────────────────────────────────

  private mostrarInicio(): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return

    content.innerHTML = '<div id="mazo-list-container"></div>'
    this.mazoListView = new MazoListView('mazo-list-container')
    this.mazoListView.setEventHandlers({
      onMazoClick: (mazo) => this.mostrarOpciones(mazo),
      onEditClick: (mazo) => this.mostrarModalEditarMazo(mazo),
      onDeleteClick: (mazo) => this.eliminarMazo(mazo.id),
      onNewClick: () => this.mostrarModalCrearMazo(),
    })
    this.mazoListView.cargarMazos()
  }

  // ─── MODALES MAZO ────────────────────────────────────────────────────────────

  private mostrarModalCrearMazo(): void {
    this.eliminarModal()
    const modal = `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-md">
          <div class="card-header">
            <h2 class="text-xl font-bold">Nuevo Mazo</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
              <input id="input-nombre" type="text" class="input" placeholder="Ej: Patrones de Diseño" maxlength="100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
              <textarea id="input-descripcion" class="input" rows="3" placeholder="Descripción opcional..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Algoritmo</label>
              <select id="input-algoritmo" class="input">
                <option value="SM2">SM-2 (Recomendado)</option>
                <option value="LEITNER">Leitner</option>
                <option value="ALEATORIO">Aleatorio</option>
              </select>
            </div>
            <p id="modal-error" class="text-danger-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Crear Mazo</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)
    document.getElementById('input-nombre')?.focus()

    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
    document.getElementById('btn-modal-guardar')?.addEventListener('click', () => this.crearMazoDesdeModal())
    document.getElementById('input-nombre')?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') this.crearMazoDesdeModal()
    })
  }

  private async crearMazoDesdeModal(): Promise<void> {
    const nombre = (document.getElementById('input-nombre') as HTMLInputElement)?.value?.trim()
    const descripcion = (document.getElementById('input-descripcion') as HTMLTextAreaElement)?.value?.trim()
    const algoritmo = (document.getElementById('input-algoritmo') as HTMLSelectElement)?.value
    const errorEl = document.getElementById('modal-error')

    if (!nombre) {
      if (errorEl) { errorEl.textContent = 'El nombre es obligatorio'; errorEl.classList.remove('hidden') }
      return
    }

    const btnGuardar = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = 'Creando...' }

    try {
      await mazoController.crearMazo({ nombre, descripcion: descripcion || undefined, algoritmo: algoritmo as any })
      this.eliminarModal()
      this.mostrarInicio()
    } catch (error: any) {
      if (errorEl) {
        errorEl.textContent = error?.message?.includes('409') || error?.message?.includes('conflicto')
          ? 'Ya existe un mazo con ese nombre'
          : 'Error al crear el mazo. Inténtalo de nuevo.'
        errorEl.classList.remove('hidden')
      }
      if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.textContent = 'Crear Mazo' }
    }
  }

  private mostrarModalEditarMazo(mazo: Mazo): void {
    this.eliminarModal()
    const modal = `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-md">
          <div class="card-header">
            <h2 class="text-xl font-bold">Editar Mazo</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Nombre *</label>
              <input id="input-nombre" type="text" class="input" value="${this.escaparAtributo(mazo.nombre)}" maxlength="100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
              <textarea id="input-descripcion" class="input" rows="3">${mazo.descripcion ? this.escaparHTML(mazo.descripcion) : ''}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1">Algoritmo</label>
              <select id="input-algoritmo" class="input">
                <option value="SM2" ${mazo.algoritmo === 'SM2' ? 'selected' : ''}>SM-2 (Recomendado)</option>
                <option value="LEITNER" ${mazo.algoritmo === 'LEITNER' ? 'selected' : ''}>Leitner</option>
                <option value="ALEATORIO" ${mazo.algoritmo === 'ALEATORIO' ? 'selected' : ''}>Aleatorio</option>
              </select>
            </div>
            <p id="modal-error" class="text-danger-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Guardar</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)

    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
    document.getElementById('btn-modal-guardar')?.addEventListener('click', () =>
      this.guardarEdicionMazo(mazo.id)
    )
  }

  private async guardarEdicionMazo(mazoId: string): Promise<void> {
    const nombre = (document.getElementById('input-nombre') as HTMLInputElement)?.value?.trim()
    const descripcion = (document.getElementById('input-descripcion') as HTMLTextAreaElement)?.value?.trim()
    const algoritmo = (document.getElementById('input-algoritmo') as HTMLSelectElement)?.value
    const errorEl = document.getElementById('modal-error')

    if (!nombre) {
      if (errorEl) { errorEl.textContent = 'El nombre es obligatorio'; errorEl.classList.remove('hidden') }
      return
    }

    const btnGuardar = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = 'Guardando...' }

    try {
      await mazoController.editarMazo(mazoId, { nombre, descripcion: descripcion || undefined, algoritmo: algoritmo as any })
      this.eliminarModal()
      this.mostrarInicio()
    } catch (error: any) {
      if (errorEl) { errorEl.textContent = 'Error al guardar cambios'; errorEl.classList.remove('hidden') }
      if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.textContent = 'Guardar' }
    }
  }

  private eliminarModal(): void {
    document.getElementById('modal-mazo')?.remove()
    document.querySelector('.modal-backdrop')?.remove()
  }

  // ─── OPCIONES MAZO ───────────────────────────────────────────────────────────

  private mostrarOpciones(mazo: Mazo): void {
    this.eliminarModal()
    const modal = `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-sm">
          <div class="card-header">
            <h2 class="text-xl font-bold text-neutral-900">${this.escaparHTML(mazo.nombre)}</h2>
            <p class="text-sm text-neutral-500 mt-1">${mazo.totalTarjetas ?? mazo.total_tarjetas ?? 0} tarjetas</p>
          </div>
          <div class="p-6 space-y-3">
            <button id="btn-estudiar" class="btn-accent w-full">Estudiar Ahora</button>
            <button id="btn-ver-progreso" class="btn-secondary w-full">Ver Progreso</button>
            <button id="btn-analizar-ia" class="btn-secondary w-full">Analizar con IA</button>
            <button id="btn-modal-cancelar" class="btn-outline w-full">Cerrar</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)

    document.getElementById('btn-estudiar')?.addEventListener('click', () => {
      this.eliminarModal()
      this.iniciarSesion(mazo.id)
    })
    document.getElementById('btn-ver-progreso')?.addEventListener('click', () => {
      sessionStorage.setItem('lastMazoId', mazo.id)
      this.eliminarModal()
      router.navegar('dashboard')
    })
    document.getElementById('btn-analizar-ia')?.addEventListener('click', () => {
      this.eliminarModal()
      this.analizarConGemini(mazo.id)
    })
    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
  }

  // ─── SESIÓN ───────────────────────────────────────────────────────────────────

  private async iniciarSesion(mazoId: string): Promise<void> {
    try {
      this.mostrarCargando('Iniciando sesión de estudio...')
      await sesionController.iniciarSesion({ mazoId })
      router.navegar('sesion')
    } catch (error: any) {
      this.limpiarContenido()
      this.mostrarAlerta(
        error?.message?.includes('pendientes') || error?.message?.includes('hoy')
          ? 'No hay tarjetas pendientes para estudiar hoy. Vuelve mañana o agrega nuevas tarjetas.'
          : 'Error al iniciar sesión de estudio.',
        'warning'
      )
      setTimeout(() => router.navegar('inicio'), 3000)
    }
  }

  private async mostrarSesion(): Promise<void> {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return

    content.innerHTML = '<div id="sesion-container"></div>'
    this.sesionView = new SesionView('sesion-container')

    const sesion = sesionController.obtenerSesionActiva()
    if (sesion) {
      this.sesionView.setEventHandlers({
        onSesionFinalizada: () => {
          sesionController.finalizarSesion().catch(console.error)
          setTimeout(() => router.navegar('inicio'), 1500)
        },
        onSesionCancelada: () => router.navegar('inicio'),
      })
      this.sesionView.mostrarSesion(sesion)
    } else {
      router.navegar('inicio')
    }
  }

  // ─── DASHBOARD ───────────────────────────────────────────────────────────────

  private async mostrarDashboard(): Promise<void> {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return

    content.innerHTML = '<div id="dashboard-container"></div>'
    this.dashboardView = new DashboardView('dashboard-container')

    const mazoId = sessionStorage.getItem('lastMazoId')
    if (mazoId) {
      await this.dashboardView.cargarProgreso(mazoId)
    } else {
      document.getElementById('dashboard-container')!.innerHTML = `
        <div class="text-center py-16">
          <div class="w-16 h-16 bg-neutral-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span class="text-2xl text-neutral-400">📊</span>
          </div>
          <h2 class="text-xl font-bold text-neutral-700 mb-2">Sin mazo seleccionado</h2>
          <p class="text-neutral-500 mb-6">Selecciona un mazo y elige "Ver Progreso" para ver tus estadísticas.</p>
          <button id="btn-ir-inicio" class="btn-accent">Ir a Mis Mazos</button>
        </div>
      `
      document.getElementById('btn-ir-inicio')?.addEventListener('click', () => router.navegar('inicio'))
    }
  }

  // ─── GEMINI ──────────────────────────────────────────────────────────────────

  private async analizarConGemini(mazoId: string): Promise<void> {
    try {
      this.mostrarCargando('Analizando mazo con IA... esto puede tomar unos segundos.')

      const analisis = await geminiController.analizarMazo(mazoId)

      this.limpiarContenido()
      const content = document.getElementById('content')
      if (!content) return

      content.innerHTML = '<div id="gemini-container"></div>'
      this.geminiView = new GeminiView('gemini-container')
      this.geminiView.setEventHandlers({
        onAceptarClick: async (tarjetas) => {
          try {
            this.mostrarCargando('Agregando tarjetas al mazo...')
            await geminiController.aceptarTarjetasSugeridas(mazoId, tarjetas)
            this.mostrarAlerta(`Se agregaron ${tarjetas.length} tarjeta(s) al mazo.`, 'success')
            setTimeout(() => router.navegar('inicio'), 2000)
          } catch (error) {
            this.mostrarAlerta('Error al agregar tarjetas. Inténtalo de nuevo.', 'danger')
          }
        },
        onCancelarClick: () => router.navegar('inicio'),
      })
      this.geminiView.mostrarAnalisis(analisis)
    } catch (error: any) {
      this.mostrarAlerta('No fue posible analizar el mazo con IA en este momento.', 'danger')
      setTimeout(() => router.navegar('inicio'), 3000)
    }
  }

  // ─── ELIMINAR MAZO ───────────────────────────────────────────────────────────

  private async eliminarMazo(mazoId: string): Promise<void> {
    try {
      await mazoController.eliminarMazo(mazoId)
      if (sessionStorage.getItem('lastMazoId') === mazoId) {
        sessionStorage.removeItem('lastMazoId')
      }
      this.mostrarInicio()
    } catch (error) {
      this.mostrarAlerta('Error al eliminar el mazo.', 'danger')
    }
  }

  // ─── UTILIDADES ──────────────────────────────────────────────────────────────

  private mostrarCargando(mensaje: string): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    content.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-neutral-600">${this.escaparHTML(mensaje)}</p>
      </div>
    `
  }

  private mostrarAlerta(mensaje: string, tipo: 'success' | 'warning' | 'danger' | 'info' = 'info'): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    const clases: Record<string, string> = {
      success: 'bg-success-50 border-success-200 text-success-700',
      warning: 'bg-warning-50 border-warning-200 text-warning-700',
      danger: 'bg-danger-50 border-danger-200 text-danger-700',
      info: 'bg-neutral-50 border-neutral-200 text-neutral-700',
    }
    content.innerHTML = `
      <div class="max-w-md mx-auto mt-16 p-6 border rounded-lg ${clases[tipo]}">
        <p class="text-center">${this.escaparHTML(mensaje)}</p>
      </div>
    `
  }

  private escaparHTML(texto: string): string {
    const div = document.createElement('div')
    div.textContent = texto
    return div.innerHTML
  }

  private escaparAtributo(texto: string): string {
    return texto.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App()
  app.inicializar()
})

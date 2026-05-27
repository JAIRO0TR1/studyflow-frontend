import '@/styles/main.css'
import { router } from '@/router/router'
import { MazoListView } from '@/views/MazoListView'
import { SesionView } from '@/views/SesionView'
import { DashboardView } from '@/views/DashboardView'
import { GeminiView } from '@/views/GeminiView'
import { TarjetaListView } from '@/views/TarjetaListView'
import { AuthView } from '@/views/AuthView'
import { mazoController } from '@/controllers/MazoController'
import { sesionController } from '@/controllers/SesionController'
import { geminiController } from '@/controllers/GeminiController'
import { authController } from '@/controllers/AuthController'
import { setSesionExpiradaHandler } from '@/api/HttpClient'
import type { Mazo } from '@/models/Mazo'
import type { UsuarioSesion } from '@/models/Auth'

class App {
  private appContainer: HTMLElement | null = null
  private mazoListView: MazoListView | null = null
  private sesionView: SesionView | null = null
  private dashboardView: DashboardView | null = null
  private geminiView: GeminiView | null = null
  private tarjetaListView: TarjetaListView | null = null
  private authView: AuthView | null = null
  private usuarioActual: UsuarioSesion | null = null

  async inicializar(): Promise<void> {
    this.appContainer = document.getElementById('app')
    if (!this.appContainer) return

    // Registrar handler global para sesiones expiradas (401)
    setSesionExpiradaHandler(() => this.mostrarLogin('login'))

    // Si hay sesión activa, mostrar la app; si no, mostrar login
    if (authController.estaAutenticado()) {
      this.usuarioActual = authController.obtenerUsuario()
      this.renderizarLayout()
      this.configurarRutas()
      this.cargarRutaInicial()
    } else {
      this.mostrarLogin('login')
    }

  }

  // ─── AUTH ────────────────────────────────────────────────────────────────────

  private mostrarLogin(modo: 'login' | 'registro' = 'login'): void {
    this.appContainer!.innerHTML = '<div id="auth-root"></div>'
    this.authView = new AuthView('auth-root')
    this.authView.setEventHandlers({
      onAutenticado: (usuario) => {
        this.usuarioActual = usuario
        this.renderizarLayout()
        this.configurarRutas()
        this.cargarRutaInicial()
      },
    })
    this.authView.mostrar(modo)
  }

  private cerrarSesion(): void {
    authController.cerrarSesion()
    this.usuarioActual = null
    this.mostrarLogin('login')
  }

  // ─── LAYOUT ──────────────────────────────────────────────────────────────────

  private renderizarLayout(): void {
    this.appContainer!.innerHTML = `
      <div class="min-h-screen bg-neutral-100">

        <!-- Header institucional -->
        <header class="header">
          <div class="main-container flex justify-between items-center py-3">
            <!-- Logo y nombre -->
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-white/15 rounded border border-white/25 flex items-center justify-center">
                <span class="text-white font-bold text-sm tracking-tight">SF</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-white tracking-wide leading-none">StudyFlow</h1>
                <p class="text-xs text-white/50 hidden sm:block leading-none mt-0.5">Sistema de Tarjetas Inteligentes</p>
              </div>
            </div>

            <!-- Navegación + usuario -->
            <div class="flex items-center gap-1">
              <button id="nav-inicio" class="nav-btn">Mis Mazos</button>
              <button id="nav-dashboard" class="nav-btn">Progreso</button>

              ${this.usuarioActual ? `
                <div class="flex items-center gap-2 ml-3 pl-3 border-l border-white/20">
                  <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    ${this.escaparHTML(this.usuarioActual.nombre.charAt(0).toUpperCase())}
                  </div>
                  <span class="text-white/80 text-sm hidden md:block">
                    ${this.escaparHTML(this.usuarioActual.nombre.split(' ')[0])}
                  </span>
                  <button id="btn-logout" class="nav-btn text-xs opacity-70 hover:opacity-100">
                    Salir
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </header>

        <!-- Contenido principal -->
        <main class="main-container py-8 flex-1">
          <div id="content"></div>
        </main>

        <!-- Footer institucional -->
        <footer class="border-t border-neutral-200 bg-white">
          <div class="main-container py-4 flex justify-between items-center text-xs text-neutral-400">
            <span>StudyFlow &mdash; Patrones de Software 2026</span>
            <span>SM-2 &bull; Gemini AI &bull; Spring Boot</span>
          </div>
        </footer>

      </div>
    `

    document.getElementById('nav-inicio')?.addEventListener('click', () => {
      router.navegar('inicio')
    })
    document.getElementById('nav-dashboard')?.addEventListener('click', () => {
      sessionStorage.removeItem('lastMazoId')
      router.navegar('dashboard')
    })
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('¿Cerrar sesión?')) this.cerrarSesion()
    })
  }

  private configurarRutas(): void {
    router.enRuta('inicio',     () => this.mostrarInicio())
    router.enRuta('sesion',     () => this.mostrarSesion())
    router.enRuta('dashboard',  () => this.mostrarDashboard())
    router.enRuta('gemini',     () => this.mostrarGemini())
    router.enRuta('tarjetas',   () => this.mostrarTarjetas())
  }

  private cargarRutaInicial(): void {
    router.navegar('inicio')
  }

  private limpiarContenido(): void {
    const c = document.getElementById('content')
    if (c) c.innerHTML = ''
  }

  // ─── INICIO ──────────────────────────────────────────────────────────────────

  private mostrarInicio(): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return

    content.innerHTML = '<div id="mazo-list-container"></div>'
    this.mazoListView = new MazoListView('mazo-list-container')
    this.mazoListView.setEventHandlers({
      onMazoClick:   (mazo) => this.mostrarOpciones(mazo),
      onEditClick:   (mazo) => this.mostrarModalEditarMazo(mazo),
      onDeleteClick: (mazo) => this.eliminarMazo(mazo.id),
      onNewClick:    ()     => this.mostrarModalCrearMazo(),
      onImportClick: ()     => this.importarMazo(),
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
            <h2 class="text-lg font-bold text-neutral-900">Nuevo Mazo</h2>
            <p class="text-sm text-neutral-500 mt-0.5">Los campos marcados con * son obligatorios</p>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1.5">Nombre *</label>
              <input id="input-nombre" type="text" class="input" placeholder="Ej: Patrones de Diseño" maxlength="100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1.5">Descripción</label>
              <textarea id="input-descripcion" class="input" rows="2" placeholder="Descripción breve (opcional)..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1.5">Algoritmo de repetición</label>
              <select id="input-algoritmo" class="input">
                <option value="SM2">SM-2 — Repetición espaciada adaptativa (Recomendado)</option>
                <option value="LEITNER">Leitner — Sistema de cajas</option>
                <option value="ALEATORIO">Aleatorio — Sin algoritmo fijo</option>
              </select>
            </div>
            <p id="modal-error" class="text-danger-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end border-t border-neutral-100 pt-4">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Crear y agregar tarjetas</button>
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
    const nombre      = (document.getElementById('input-nombre')      as HTMLInputElement)?.value?.trim()
    const descripcion = (document.getElementById('input-descripcion') as HTMLTextAreaElement)?.value?.trim()
    const algoritmo   = (document.getElementById('input-algoritmo')   as HTMLSelectElement)?.value
    const errorEl     = document.getElementById('modal-error')

    if (!nombre) {
      if (errorEl) { errorEl.textContent = 'El nombre es obligatorio'; errorEl.classList.remove('hidden') }
      return
    }

    const btnGuardar = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = 'Creando...' }

    try {
      const nuevoMazo = await mazoController.crearMazo({
        nombre,
        descripcion: descripcion || undefined,
        algoritmo:   algoritmo as any,
      })
      this.eliminarModal()

      // Ir directamente a agregar tarjetas al mazo recién creado
      sessionStorage.setItem('lastMazoId',   nuevoMazo.id)
      sessionStorage.setItem('lastMazoData', JSON.stringify(nuevoMazo))
      router.navegar('tarjetas')

    } catch (error: any) {
      if (errorEl) {
        errorEl.textContent = error?.message?.includes('409') || error?.message?.includes('conflicto')
          ? 'Ya existe un mazo con ese nombre'
          : 'Error al crear el mazo. Inténtalo de nuevo.'
        errorEl.classList.remove('hidden')
      }
      if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.textContent = 'Crear y agregar tarjetas' }
    }
  }

  private mostrarModalEditarMazo(mazo: Mazo): void {
    this.eliminarModal()
    const modal = `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-md">
          <div class="card-header">
            <h2 class="text-lg font-bold text-neutral-900">Editar Mazo</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1.5">Nombre *</label>
              <input id="input-nombre" type="text" class="input" value="${this.escaparAtributo(mazo.nombre)}" maxlength="100" />
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1.5">Descripción</label>
              <textarea id="input-descripcion" class="input" rows="2">${mazo.descripcion ? this.escaparHTML(mazo.descripcion) : ''}</textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-neutral-700 mb-1.5">Algoritmo de repetición</label>
              <select id="input-algoritmo" class="input">
                <option value="SM2"       ${mazo.algoritmo === 'SM2'       ? 'selected' : ''}>SM-2 — Repetición espaciada adaptativa</option>
                <option value="LEITNER"   ${mazo.algoritmo === 'LEITNER'   ? 'selected' : ''}>Leitner — Sistema de cajas</option>
                <option value="ALEATORIO" ${mazo.algoritmo === 'ALEATORIO' ? 'selected' : ''}>Aleatorio — Sin algoritmo fijo</option>
              </select>
            </div>
            <p id="modal-error" class="text-danger-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end border-t border-neutral-100 pt-4">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Guardar cambios</button>
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
    const nombre      = (document.getElementById('input-nombre')      as HTMLInputElement)?.value?.trim()
    const descripcion = (document.getElementById('input-descripcion') as HTMLTextAreaElement)?.value?.trim()
    const algoritmo   = (document.getElementById('input-algoritmo')   as HTMLSelectElement)?.value
    const errorEl     = document.getElementById('modal-error')

    if (!nombre) {
      if (errorEl) { errorEl.textContent = 'El nombre es obligatorio'; errorEl.classList.remove('hidden') }
      return
    }

    const btnGuardar = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btnGuardar) { btnGuardar.disabled = true; btnGuardar.textContent = 'Guardando...' }

    try {
      await mazoController.editarMazo(mazoId, {
        nombre,
        descripcion: descripcion || undefined,
        algoritmo:   algoritmo as any,
      })
      this.eliminarModal()
      this.mostrarInicio()
    } catch {
      if (errorEl) { errorEl.textContent = 'Error al guardar cambios'; errorEl.classList.remove('hidden') }
      if (btnGuardar) { btnGuardar.disabled = false; btnGuardar.textContent = 'Guardar cambios' }
    }
  }

  private eliminarModal(): void {
    document.getElementById('modal-mazo')?.remove()
    document.querySelector('.modal-backdrop')?.remove()
  }

  // ─── OPCIONES DEL MAZO ───────────────────────────────────────────────────────

  private mostrarOpciones(mazo: Mazo): void {
    this.eliminarModal()
    const total = mazo.totalTarjetas ?? mazo.total_tarjetas ?? 0
    const modal = `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-sm">
          <div class="card-header">
            <h2 class="text-lg font-bold text-neutral-900">${this.escaparHTML(mazo.nombre)}</h2>
            <p class="text-sm text-neutral-500 mt-0.5">
              ${total} tarjeta${total !== 1 ? 's' : ''}
              &bull; ${mazo.algoritmo || 'SM2'}
            </p>
          </div>
          <div class="p-6 space-y-2">
            <button id="btn-estudiar"          class="btn-accent    w-full">Estudiar ahora</button>
            <button id="btn-gestionar-tarjetas" class="btn-secondary w-full">Gestionar tarjetas</button>
            <button id="btn-analizar-ia"        class="btn-secondary w-full">Analizar con IA</button>
            <button id="btn-ver-progreso"       class="btn-secondary w-full">Ver progreso</button>
            <hr class="border-neutral-200 my-2">
            <div class="grid grid-cols-2 gap-2">
              <button id="btn-exportar-json"   class="btn-secondary text-sm">Exportar JSON</button>
              <button id="btn-exportar-csv"    class="btn-secondary text-sm">Exportar CSV</button>
            </div>
            <button id="btn-modal-cancelar" class="btn-outline w-full mt-2">Cerrar</button>
          </div>
        </div>
      </div>
    `
    document.body.insertAdjacentHTML('beforeend', modal)

    document.getElementById('btn-estudiar')?.addEventListener('click', () => {
      this.eliminarModal()
      this.iniciarSesion(mazo.id)
    })
    document.getElementById('btn-gestionar-tarjetas')?.addEventListener('click', () => {
      sessionStorage.setItem('lastMazoId',   mazo.id)
      sessionStorage.setItem('lastMazoData', JSON.stringify(mazo))
      this.eliminarModal()
      router.navegar('tarjetas')
    })
    document.getElementById('btn-analizar-ia')?.addEventListener('click', () => {
      this.eliminarModal()
      this.analizarConGemini(mazo.id)
    })
    document.getElementById('btn-ver-progreso')?.addEventListener('click', () => {
      sessionStorage.setItem('lastMazoId', mazo.id)
      this.eliminarModal()
      router.navegar('dashboard')
    })
    document.getElementById('btn-exportar-json')?.addEventListener('click', () => {
      this.eliminarModal()
      this.exportarMazo(mazo, 'json')
    })
    document.getElementById('btn-exportar-csv')?.addEventListener('click', () => {
      this.eliminarModal()
      this.exportarMazo(mazo, 'csv')
    })
    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
  }

  // ─── EXPORTAR ────────────────────────────────────────────────────────────────

  private async exportarMazo(mazo: Mazo, formato: 'json' | 'csv'): Promise<void> {
    try {
      this.mostrarCargando(`Exportando "${mazo.nombre}"...`)
      const blob = await mazoController.exportarMazo(mazo.id, formato)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `${mazo.nombre.replace(/[^a-z0-9]/gi, '_')}.${formato}`
      a.click()
      URL.revokeObjectURL(url)
      this.mostrarInicio()
    } catch {
      this.mostrarAlerta('Error al exportar el mazo. Inténtalo de nuevo.', 'danger')
      setTimeout(() => router.navegar('inicio'), 2500)
    }
  }

  // ─── IMPORTAR ────────────────────────────────────────────────────────────────

  private importarMazo(): void {
    const input = document.createElement('input')
    input.type   = 'file'
    input.accept = '.json'
    input.style.display = 'none'
    document.body.appendChild(input)

    input.addEventListener('change', async () => {
      const archivo = input.files?.[0]
      document.body.removeChild(input)
      if (!archivo) return

      try {
        this.mostrarCargando(`Importando "${archivo.name}"...`)
        await mazoController.importarMazo(archivo)
        this.mostrarAlerta('Mazo importado correctamente.', 'success')
        setTimeout(() => router.navegar('inicio'), 1500)
      } catch {
        this.mostrarAlerta('Error al importar. Asegúrate de que el archivo es un JSON válido exportado desde StudyFlow.', 'danger')
        setTimeout(() => router.navegar('inicio'), 3000)
      }
    })

    input.click()
  }

  // ─── SESIÓN ───────────────────────────────────────────────────────────────────

  private async iniciarSesion(mazoId: string): Promise<void> {
    try {
      this.mostrarCargando('Preparando sesión de estudio...')
      await sesionController.iniciarSesion({ mazoId })
      router.navegar('sesion')
    } catch (error: any) {
      this.limpiarContenido()
      this.mostrarAlerta(
        error?.message?.includes('pendientes') || error?.message?.includes('hoy')
          ? 'No hay tarjetas pendientes para hoy. Vuelve mañana o agrega nuevas tarjetas.'
          : 'Error al iniciar la sesión de estudio.',
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
        // Solo se llama cuando la sesión realmente termina (última tarjeta)
        onSesionFinalizada: () => {
          sesionController.finalizarSesion().catch(console.error)
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
    this.dashboardView.setEventHandlers({
      onIrAMazos: () => router.navegar('inicio'),
    })

    const mazoId = sessionStorage.getItem('lastMazoId')
    if (mazoId) {
      await this.dashboardView.cargarProgreso(mazoId)
    } else {
      await this.dashboardView.cargarEstadisticasGlobales()
    }
  }

  // ─── TARJETAS ────────────────────────────────────────────────────────────────

  private mostrarTarjetas(): void {
    const mazoDataRaw = sessionStorage.getItem('lastMazoData')
    if (!mazoDataRaw) { router.navegar('inicio'); return }

    let mazo: Mazo
    try {
      mazo = JSON.parse(mazoDataRaw) as Mazo
    } catch {
      router.navegar('inicio'); return
    }

    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return

    content.innerHTML = '<div id="tarjeta-list-container"></div>'
    this.tarjetaListView = new TarjetaListView('tarjeta-list-container', mazo)
    this.tarjetaListView.setEventHandlers({
      onVolver: () => router.navegar('inicio'),
    })
    this.tarjetaListView.cargarTarjetas()
  }

  // ─── GEMINI ──────────────────────────────────────────────────────────────────

  private mostrarGemini(): void {
    const mazoId = sessionStorage.getItem('lastMazoId')
    if (mazoId) {
      this.analizarConGemini(mazoId)
    } else {
      router.navegar('inicio')
    }
  }

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
            this.mostrarCargando(`Agregando ${tarjetas.length} tarjeta${tarjetas.length !== 1 ? 's' : ''} al mazo...`)
            await geminiController.aceptarTarjetasSugeridas(mazoId, tarjetas)
            this.mostrarAlerta(`${tarjetas.length} tarjeta${tarjetas.length !== 1 ? 's' : ''} agregada${tarjetas.length !== 1 ? 's' : ''} correctamente.`, 'success')
            setTimeout(() => router.navegar('inicio'), 2000)
          } catch {
            this.mostrarAlerta('Error al agregar las tarjetas. Inténtalo de nuevo.', 'danger')
          }
        },
        onCancelarClick: () => router.navegar('inicio'),
      })
      this.geminiView.mostrarAnalisis(analisis)
    } catch {
      this.mostrarAlerta('No fue posible analizar el mazo con IA en este momento. Inténtalo de nuevo.', 'danger')
      setTimeout(() => router.navegar('inicio'), 3000)
    }
  }

  // ─── ELIMINAR MAZO ───────────────────────────────────────────────────────────

  private async eliminarMazo(mazoId: string): Promise<void> {
    try {
      await mazoController.eliminarMazo(mazoId)
      if (sessionStorage.getItem('lastMazoId') === mazoId) {
        sessionStorage.removeItem('lastMazoId')
        sessionStorage.removeItem('lastMazoData')
      }
      this.mostrarInicio()
    } catch {
      this.mostrarAlerta('Error al eliminar el mazo.', 'danger')
    }
  }

  // ─── UTILIDADES ──────────────────────────────────────────────────────────────

  private mostrarCargando(mensaje: string): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    content.innerHTML = `
      <div class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-neutral-500 text-sm">${this.escaparHTML(mensaje)}</p>
      </div>
    `
  }

  private mostrarAlerta(mensaje: string, tipo: 'success' | 'warning' | 'danger' | 'info' = 'info'): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    const clases: Record<string, string> = {
      success: 'bg-success-50 border-success-300 text-success-700',
      warning: 'bg-warning-50 border-warning-300 text-warning-700',
      danger:  'bg-danger-50  border-danger-300  text-danger-700',
      info:    'bg-accent-50  border-accent-300  text-accent-700',
    }
    content.innerHTML = `
      <div class="max-w-sm mx-auto mt-20 p-6 border rounded-md ${clases[tipo]} text-center">
        <p>${this.escaparHTML(mensaje)}</p>
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

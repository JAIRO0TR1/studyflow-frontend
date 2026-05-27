import '@/styles/main.css'
import { router }              from '@/router/router'
import { MazoListView }        from '@/views/MazoListView'
import { SesionView }          from '@/views/SesionView'
import { DashboardView }       from '@/views/DashboardView'
import { GeminiView }          from '@/views/GeminiView'
import { TarjetaListView }     from '@/views/TarjetaListView'
import { AuthView }            from '@/views/AuthView'
import { DesafioView }         from '@/views/DesafioView'
import { mazoController }      from '@/controllers/MazoController'
import { sesionController }    from '@/controllers/SesionController'
import { geminiController }    from '@/controllers/GeminiController'
import { authController }      from '@/controllers/AuthController'
import { setSesionExpiradaHandler } from '@/api/HttpClient'
import type { Mazo }           from '@/models/Mazo'
import type { UsuarioSesion }  from '@/models/Auth'
import type { ResultadoDesafio } from '@/models/Desafio'

// ─── SISTEMA DE LOGROS (localStorage) ────────────────────────────────────────

function otorgarLogro(id: string, nombre: string): void {
  const raw    = JSON.parse(localStorage.getItem('sf_logros') ?? '{}')
  if (raw[id]) return   // ya obtenido
  raw[id] = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
  localStorage.setItem('sf_logros', JSON.stringify(raw))
  mostrarToast(`Logro desbloqueado: ${nombre}`, 'violet')
}

function mostrarToast(mensaje: string, tipo: 'success' | 'warning' | 'violet' | 'default' = 'default'): void {
  const t = document.createElement('div')
  t.className = `toast toast-${tipo === 'default' ? '' : tipo}`
  t.innerHTML = `
    <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      ${tipo === 'violet'
        ? '<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/>'
        : '<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>'}
    </svg>
    <span>${mensaje}</span>
  `
  document.body.appendChild(t)
  setTimeout(() => {
    t.style.opacity = '0'
    t.style.transition = 'opacity 0.4s'
    setTimeout(() => t.remove(), 400)
  }, 3500)
}

// ─── APP ──────────────────────────────────────────────────────────────────────

class App {
  private appContainer:   HTMLElement | null = null
  private mazoListView:   MazoListView   | null = null
  private sesionView:     SesionView     | null = null
  private dashboardView:  DashboardView  | null = null
  private geminiView:     GeminiView     | null = null
  private tarjetaListView: TarjetaListView | null = null
  private authView:       AuthView       | null = null
  private desafioView:    DesafioView    | null = null
  private usuarioActual:  UsuarioSesion  | null = null
  private rutaActiva      = 'inicio'

  async inicializar(): Promise<void> {
    this.appContainer = document.getElementById('app')
    if (!this.appContainer) return

    setSesionExpiradaHandler(() => this.mostrarLogin('login'))

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
    const inicial = this.usuarioActual?.nombre.charAt(0).toUpperCase() ?? '?'
    const nombre  = this.usuarioActual?.nombre.split(' ')[0] ?? ''

    this.appContainer!.innerHTML = `
      <div class="min-h-screen bg-neutral-50 flex flex-col">

        <!-- Header con gradiente -->
        <header class="header sticky top-0 z-40">
          <div class="main-container flex justify-between items-center py-3">

            <!-- Logo -->
            <div class="flex items-center gap-2">
              <img src="/logo.png" alt="StudyFlow" class="h-10 w-auto drop-shadow-md"
                style="filter:brightness(0) invert(1) drop-shadow(0 1px 3px rgba(0,0,0,0.4))" />
            </div>

            <!-- Nav + usuario -->
            <div class="flex items-center gap-1">
              <button id="nav-inicio"    class="nav-btn">Mis Mazos</button>
              <button id="nav-dashboard" class="nav-btn">Progreso</button>

              ${this.usuarioActual ? `
                <div class="flex items-center gap-2 ml-3 pl-3 border-l border-white/20">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white
                    text-sm font-black shadow-sm"
                    style="background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3)">
                    ${this.esc(inicial)}
                  </div>
                  <span class="text-white/80 text-sm hidden md:block font-medium">
                    ${this.esc(nombre)}
                  </span>
                  <button id="btn-logout" class="nav-btn text-xs opacity-70 hover:opacity-100">
                    Salir
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        </header>

        <!-- Contenido -->
        <main class="main-container py-8 flex-1">
          <div id="content"></div>
        </main>

        <!-- Footer -->
        <footer class="border-t border-neutral-200 bg-white">
          <div class="main-container py-4 flex flex-col sm:flex-row justify-between
            items-center gap-2 text-xs text-neutral-400">
            <span>StudyFlow &mdash; Patrones de Software 2026</span>
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                </svg>
                Spring Boot
              </span>
              <span class="text-neutral-200">|</span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                </svg>
                SM-2
              </span>
              <span class="text-neutral-200">|</span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3 text-violet-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
                </svg>
                Gemini AI
              </span>
            </div>
          </div>
        </footer>

      </div>
    `

    document.getElementById('nav-inicio')?.addEventListener('click', () => {
      this.rutaActiva = 'inicio'
      this.actualizarNavActivo()
      router.navegar('inicio')
    })
    document.getElementById('nav-dashboard')?.addEventListener('click', () => {
      sessionStorage.removeItem('lastMazoId')
      this.rutaActiva = 'dashboard'
      this.actualizarNavActivo()
      router.navegar('dashboard')
    })
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      if (confirm('¿Cerrar sesión?')) this.cerrarSesion()
    })
  }

  private actualizarNavActivo(): void {
    const btns: Record<string, string> = { inicio: 'nav-inicio', dashboard: 'nav-dashboard' }
    Object.entries(btns).forEach(([ruta, id]) => {
      const btn = document.getElementById(id)
      if (!btn) return
      if (ruta === this.rutaActiva) {
        btn.className = 'nav-btn-active'
      } else {
        btn.className = 'nav-btn'
      }
    })
  }

  private configurarRutas(): void {
    router.enRuta('inicio',    () => this.mostrarInicio())
    router.enRuta('sesion',    () => this.mostrarSesion())
    router.enRuta('dashboard', () => this.mostrarDashboard())
    router.enRuta('gemini',    () => this.mostrarGemini())
    router.enRuta('tarjetas',  () => this.mostrarTarjetas())
    router.enRuta('desafio',   () => this.mostrarDesafio())
  }

  private cargarRutaInicial(): void {
    this.rutaActiva = 'inicio'
    this.actualizarNavActivo()
    router.navegar('inicio')
  }

  private limpiarContenido(): void {
    const c = document.getElementById('content')
    if (c) c.innerHTML = ''
  }

  // ─── INICIO ──────────────────────────────────────────────────────────────────

  private mostrarInicio(): void {
    this.rutaActiva = 'inicio'
    this.actualizarNavActivo()
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
      onVerProgresoClick: () => {
        sessionStorage.removeItem('lastMazoId')
        router.navegar('dashboard')
      },
    })
    this.mazoListView.cargarMazos()
  }

  // ─── MODAL CREAR MAZO ────────────────────────────────────────────────────────

  private mostrarModalCrearMazo(): void {
    this.eliminarModal()
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-md">
          <div class="card-header">
            <h2 class="text-lg font-bold text-neutral-900">Nuevo Mazo</h2>
            <p class="text-sm text-neutral-500 mt-0.5">Los campos con * son obligatorios</p>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1.5">Nombre *</label>
              <input id="input-nombre" type="text" class="input"
                placeholder="Ej: Patrones de Diseño" maxlength="100"/>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1.5">Descripción</label>
              <textarea id="input-descripcion" class="input" rows="2"
                placeholder="Descripción breve (opcional)..."></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1.5">Algoritmo de repetición</label>
              <select id="input-algoritmo" class="input">
                <option value="SM2">SM-2 — Repetición espaciada adaptativa (Recomendado)</option>
                <option value="LEITNER">Leitner — Sistema de cajas</option>
                <option value="ALEATORIO">Aleatorio — Sin algoritmo fijo</option>
              </select>
            </div>
            <p id="modal-error" class="text-rose-600 text-sm hidden bg-rose-50 border border-rose-200
              rounded-lg p-3"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end border-t border-neutral-100 pt-4">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Crear y agregar tarjetas</button>
          </div>
        </div>
      </div>
    `)
    document.getElementById('input-nombre')?.focus()
    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
    document.getElementById('btn-modal-guardar')?.addEventListener('click', () => this.crearMazoDesdeModal())
    document.getElementById('input-nombre')?.addEventListener('keydown', e => {
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
    const btn = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btn) { btn.disabled = true; btn.textContent = 'Creando...' }

    try {
      const nuevoMazo = await mazoController.crearMazo({ nombre, descripcion: descripcion || undefined, algoritmo: algoritmo as any })
      this.eliminarModal()
      sessionStorage.setItem('lastMazoId',   nuevoMazo.id)
      sessionStorage.setItem('lastMazoData', JSON.stringify(nuevoMazo))
      router.navegar('tarjetas')
    } catch (err: any) {
      if (errorEl) {
        errorEl.textContent = err?.message?.includes('409') ? 'Ya existe un mazo con ese nombre' : 'Error al crear el mazo'
        errorEl.classList.remove('hidden')
      }
      if (btn) { btn.disabled = false; btn.textContent = 'Crear y agregar tarjetas' }
    }
  }

  // ─── MODAL EDITAR MAZO ───────────────────────────────────────────────────────

  private mostrarModalEditarMazo(mazo: Mazo): void {
    this.eliminarModal()
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-md">
          <div class="card-header">
            <h2 class="text-lg font-bold text-neutral-900">Editar Mazo</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1.5">Nombre *</label>
              <input id="input-nombre" type="text" class="input"
                value="${this.escAttr(mazo.nombre)}" maxlength="100"/>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1.5">Descripción</label>
              <textarea id="input-descripcion" class="input" rows="2">${mazo.descripcion ? this.esc(mazo.descripcion) : ''}</textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-neutral-700 mb-1.5">Algoritmo de repetición</label>
              <select id="input-algoritmo" class="input">
                <option value="SM2"       ${mazo.algoritmo === 'SM2'       ? 'selected' : ''}>SM-2 — Repetición espaciada adaptativa</option>
                <option value="LEITNER"   ${mazo.algoritmo === 'LEITNER'   ? 'selected' : ''}>Leitner — Sistema de cajas</option>
                <option value="ALEATORIO" ${mazo.algoritmo === 'ALEATORIO' ? 'selected' : ''}>Aleatorio — Sin algoritmo fijo</option>
              </select>
            </div>
            <p id="modal-error" class="text-rose-600 text-sm hidden"></p>
          </div>
          <div class="flex gap-3 px-6 pb-6 justify-end border-t border-neutral-100 pt-4">
            <button id="btn-modal-cancelar" class="btn-secondary">Cancelar</button>
            <button id="btn-modal-guardar" class="btn-accent">Guardar cambios</button>
          </div>
        </div>
      </div>
    `)
    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
    document.getElementById('btn-modal-guardar')?.addEventListener('click', () => this.guardarEdicionMazo(mazo.id))
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
    const btn = document.getElementById('btn-modal-guardar') as HTMLButtonElement
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...' }
    try {
      await mazoController.editarMazo(mazoId, { nombre, descripcion: descripcion || undefined, algoritmo: algoritmo as any })
      this.eliminarModal()
      this.mostrarInicio()
    } catch {
      if (errorEl) { errorEl.textContent = 'Error al guardar cambios'; errorEl.classList.remove('hidden') }
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar cambios' }
    }
  }

  private eliminarModal(): void {
    document.getElementById('modal-mazo')?.remove()
    document.querySelector('.modal-backdrop')?.remove()
  }

  // ─── OPCIONES DEL MAZO ───────────────────────────────────────────────────────

  private mostrarOpciones(mazo: Mazo): void {
    this.eliminarModal()
    const total     = mazo.totalTarjetas ?? (mazo as any).total_tarjetas ?? 0
    const algoritmo = mazo.algoritmo || 'SM2'
    const algLabel: Record<string, string> = { SM2: 'SM-2', LEITNER: 'Leitner', ALEATORIO: 'Aleatorio' }
    const record    = parseInt(localStorage.getItem(`sf_record_${mazo.id}`) ?? '0')

    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-backdrop" id="modal-mazo">
        <div class="modal-content max-w-sm">
          <div class="card-header">
            <h2 class="text-lg font-bold text-neutral-900 leading-snug">${this.esc(mazo.nombre)}</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="badge badge-indigo">${algLabel[algoritmo] || algoritmo}</span>
              <span class="text-xs text-neutral-500">${total} tarjeta${total !== 1 ? 's' : ''}</span>
              ${record > 0 ? `<span class="badge bg-amber-100 text-amber-700">Récord: ${record.toLocaleString()} pts</span>` : ''}
            </div>
          </div>
          <div class="p-5 space-y-2">

            <!-- Acción principal -->
            <button id="btn-estudiar" class="btn-accent w-full justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"/>
              </svg>
              Estudiar ahora
            </button>

            <!-- Modo Desafío IA -->
            <button id="btn-desafio" class="btn-violet w-full justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/>
              </svg>
              Modo Desafío IA
            </button>

            <hr class="border-neutral-100"/>

            <button id="btn-gestionar" class="btn-secondary w-full justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"/>
              </svg>
              Gestionar tarjetas
            </button>

            <button id="btn-analizar" class="btn-secondary w-full justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/>
              </svg>
              Generar tarjetas con IA
            </button>

            <button id="btn-progreso" class="btn-secondary w-full justify-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>
              </svg>
              Ver progreso
            </button>

            <hr class="border-neutral-100"/>
            <div class="grid grid-cols-2 gap-2">
              <button id="btn-export-json" class="btn-secondary text-sm justify-center">JSON</button>
              <button id="btn-export-csv"  class="btn-secondary text-sm justify-center">CSV</button>
            </div>
            <button id="btn-modal-cancelar" class="btn-outline w-full justify-center">Cerrar</button>
          </div>
        </div>
      </div>
    `)

    document.getElementById('btn-estudiar')?.addEventListener('click', () => {
      this.eliminarModal(); this.iniciarSesion(mazo.id)
    })
    document.getElementById('btn-desafio')?.addEventListener('click', () => {
      sessionStorage.setItem('lastMazoId',   mazo.id)
      sessionStorage.setItem('lastMazoData', JSON.stringify(mazo))
      this.eliminarModal()
      router.navegar('desafio')
    })
    document.getElementById('btn-gestionar')?.addEventListener('click', () => {
      sessionStorage.setItem('lastMazoId', mazo.id)
      sessionStorage.setItem('lastMazoData', JSON.stringify(mazo))
      this.eliminarModal(); router.navegar('tarjetas')
    })
    document.getElementById('btn-analizar')?.addEventListener('click', () => {
      this.eliminarModal(); this.analizarConGemini(mazo.id)
    })
    document.getElementById('btn-progreso')?.addEventListener('click', () => {
      sessionStorage.setItem('lastMazoId', mazo.id)
      this.eliminarModal(); router.navegar('dashboard')
    })
    document.getElementById('btn-export-json')?.addEventListener('click', () => {
      this.eliminarModal(); this.exportarMazo(mazo, 'json')
    })
    document.getElementById('btn-export-csv')?.addEventListener('click', () => {
      this.eliminarModal(); this.exportarMazo(mazo, 'csv')
    })
    document.getElementById('btn-modal-cancelar')?.addEventListener('click', () => this.eliminarModal())
    document.getElementById('modal-mazo')?.addEventListener('click', e => {
      if (e.target === document.getElementById('modal-mazo')) this.eliminarModal()
    })
  }

  // ─── EXPORTAR / IMPORTAR ──────────────────────────────────────────────────────

  private async exportarMazo(mazo: Mazo, fmt: 'json' | 'csv'): Promise<void> {
    try {
      this.mostrarCargando(`Exportando "${mazo.nombre}"...`)
      const blob = await mazoController.exportarMazo(mazo.id, fmt)
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url; a.download = `${mazo.nombre.replace(/[^a-z0-9]/gi, '_')}.${fmt}`; a.click()
      URL.revokeObjectURL(url)
      this.mostrarInicio()
    } catch {
      this.mostrarAlerta('Error al exportar el mazo.', 'danger')
      setTimeout(() => router.navegar('inicio'), 2500)
    }
  }

  private importarMazo(): void {
    const input = document.createElement('input')
    input.type = 'file'; input.accept = '.json'
    input.style.display = 'none'
    document.body.appendChild(input)
    input.addEventListener('change', async () => {
      const archivo = input.files?.[0]
      document.body.removeChild(input)
      if (!archivo) return
      try {
        this.mostrarCargando(`Importando "${archivo.name}"...`)
        await mazoController.importarMazo(archivo)
        mostrarToast('Mazo importado correctamente', 'success')
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
    } catch (err: any) {
      this.limpiarContenido()
      this.mostrarAlerta(
        err?.message?.includes('pendientes') || err?.message?.includes('hoy')
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
    this.sesionView   = new SesionView('sesion-container')
    const sesion      = sesionController.obtenerSesionActiva()
    if (sesion) {
      this.sesionView.setEventHandlers({
        onSesionFinalizada: (resultado) => {
          sesionController.finalizarSesion()
          // Logros de sesión
          otorgarLogro('first_session', 'Primera sesión')
          if ((resultado.estadisticas?.porcentaje ?? 0) >= 90) {
            otorgarLogro('accuracy_90', 'Precisión élite')
          }
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
    this.rutaActiva = 'dashboard'
    this.actualizarNavActivo()
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    content.innerHTML = '<div id="dashboard-container"></div>'
    this.dashboardView = new DashboardView('dashboard-container')
    this.dashboardView.setEventHandlers({ onIrAMazos: () => router.navegar('inicio') })
    const mazoId = sessionStorage.getItem('lastMazoId')
    if (mazoId) {
      await this.dashboardView.cargarProgreso(mazoId)
    } else {
      await this.dashboardView.cargarEstadisticasGlobales()
    }
  }

  // ─── TARJETAS ────────────────────────────────────────────────────────────────

  private mostrarTarjetas(): void {
    const raw = sessionStorage.getItem('lastMazoData')
    if (!raw) { router.navegar('inicio'); return }
    let mazo: Mazo
    try { mazo = JSON.parse(raw) as Mazo } catch { router.navegar('inicio'); return }
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    content.innerHTML = '<div id="tarjeta-list-container"></div>'
    this.tarjetaListView = new TarjetaListView('tarjeta-list-container', mazo)
    this.tarjetaListView.setEventHandlers({ onVolver: () => router.navegar('inicio') })
    this.tarjetaListView.cargarTarjetas()
  }

  // ─── GEMINI ──────────────────────────────────────────────────────────────────

  private mostrarGemini(): void {
    const mazoId = sessionStorage.getItem('lastMazoId')
    if (mazoId) this.analizarConGemini(mazoId)
    else router.navegar('inicio')
  }

  private async analizarConGemini(mazoId: string): Promise<void> {
    try {
      this.mostrarCargando('Analizando mazo con Gemini AI... esto puede tardar unos segundos.')
      const analisis = await geminiController.analizarMazo(mazoId)
      this.limpiarContenido()
      const content = document.getElementById('content')
      if (!content) return
      content.innerHTML = '<div id="gemini-container"></div>'
      this.geminiView = new GeminiView('gemini-container')
      this.geminiView.setEventHandlers({
        onAceptarClick: async (tarjetas) => {
          try {
            this.mostrarCargando(`Agregando ${tarjetas.length} tarjeta${tarjetas.length !== 1 ? 's' : ''}...`)
            await geminiController.aceptarTarjetasSugeridas(mazoId, tarjetas)
            mostrarToast(`${tarjetas.length} tarjeta${tarjetas.length !== 1 ? 's' : ''} agregada${tarjetas.length !== 1 ? 's' : ''} correctamente`, 'success')
            setTimeout(() => router.navegar('inicio'), 1800)
          } catch {
            this.mostrarAlerta('Error al agregar las tarjetas. Inténtalo de nuevo.', 'danger')
          }
        },
        onCancelarClick: () => router.navegar('inicio'),
      })
      this.geminiView.mostrarAnalisis(analisis)
    } catch {
      this.mostrarAlerta('No fue posible analizar el mazo con IA. Inténtalo de nuevo.', 'danger')
      setTimeout(() => router.navegar('inicio'), 3000)
    }
  }

  // ─── DESAFÍO IA ──────────────────────────────────────────────────────────────

  private mostrarDesafio(): void {
    const mazoDataRaw = sessionStorage.getItem('lastMazoData')
    const mazoId      = sessionStorage.getItem('lastMazoId')
    if (!mazoId || !mazoDataRaw) { router.navegar('inicio'); return }

    let mazoNombre = 'Mazo'
    try { mazoNombre = (JSON.parse(mazoDataRaw) as Mazo).nombre } catch { /* */ }

    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return

    content.innerHTML = `
      <div class="max-w-2xl mx-auto">
        <!-- Cabecera del modo desafío -->
        <div class="page-header flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="badge badge-violet text-xs">Modo Desafío</span>
              <span class="badge bg-amber-100 text-amber-700 text-xs">Gemini AI</span>
            </div>
            <h1 class="page-title">${this.esc(mazoNombre)}</h1>
            <p class="page-subtitle">Preguntas generadas por IA &bull; Timer &bull; Combo multiplicador</p>
          </div>
          <button id="btn-volver-desafio" class="btn-secondary text-sm gap-2">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"/>
            </svg>
            Volver
          </button>
        </div>
        <div id="desafio-container"></div>
      </div>
    `
    document.getElementById('btn-volver-desafio')?.addEventListener('click', () => router.navegar('inicio'))

    this.desafioView = new DesafioView('desafio-container', mazoId, mazoNombre)
    this.desafioView.setEventHandlers({
      onVolver: () => router.navegar('inicio'),
      onCompleto: (resultado: ResultadoDesafio) => {
        // Logros del desafío
        otorgarLogro('ai_challenger', 'Desafiante IA')
        if (resultado.porcentaje === 100) otorgarLogro('perfect_game',  'Juego perfecto')
        if (resultado.puntuacion >= 2000) otorgarLogro('high_scorer',   'Puntuador alto')
        if (resultado.esRecord) mostrarToast(`Nuevo récord: ${resultado.puntuacion.toLocaleString()} pts`, 'success')
      },
    })
    this.desafioView.iniciar()
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
        <div class="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"
          style="border-width:3px"></div>
        <p class="text-neutral-500 text-sm">${this.esc(mensaje)}</p>
      </div>
    `
  }

  private mostrarAlerta(mensaje: string, tipo: 'success' | 'warning' | 'danger' | 'info' = 'info'): void {
    this.limpiarContenido()
    const content = document.getElementById('content')
    if (!content) return
    const clases: Record<string, string> = {
      success: 'alert-success', warning: 'alert-warning', danger: 'alert-danger', info: 'alert-info',
    }
    content.innerHTML = `
      <div class="max-w-sm mx-auto mt-20 alert ${clases[tipo]} text-center">${this.esc(mensaje)}</div>
    `
  }

  private esc(t: string): string {
    const d = document.createElement('div'); d.textContent = t; return d.innerHTML
  }
  private escAttr(t: string): string {
    return t.replace(/"/g, '&quot;').replace(/'/g, '&#39;')
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App()
  app.inicializar()
})

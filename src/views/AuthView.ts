/**
 * Vista de autenticación — Login y Registro
 */

import { authController } from '@/controllers/AuthController'
import type { UsuarioSesion } from '@/models/Auth'

type Modo = 'login' | 'registro'

export class AuthView {
  private container: HTMLElement
  private modo: Modo = 'login'
  private onAutenticado?: (usuario: UsuarioSesion) => void

  constructor(containerId: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`Container #${containerId} not found`)
    this.container = el
  }

  setEventHandlers(handlers: { onAutenticado?: (usuario: UsuarioSesion) => void }): void {
    this.onAutenticado = handlers.onAutenticado
  }

  mostrar(modo: Modo = 'login'): void {
    this.modo = modo
    this.renderizar()
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  private renderizar(): void {
    this.container.innerHTML = `
      <div class="min-h-screen bg-neutral-100 flex flex-col">

        <!-- Header de la pantalla de auth -->
        <header class="header">
          <div class="main-container flex items-center py-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-white/15 rounded border border-white/25 flex items-center justify-center">
                <span class="text-white font-bold text-sm tracking-tight">SF</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-white tracking-wide leading-none">StudyFlow</h1>
                <p class="text-xs text-white/50 hidden sm:block leading-none mt-0.5">Sistema de Tarjetas Inteligentes</p>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenido centrado -->
        <main class="flex-1 flex items-center justify-center p-4 py-12">
          <div class="w-full max-w-md">

            <!-- Card principal -->
            <div class="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden">

              <!-- Pestañas login / registro -->
              <div class="flex border-b border-neutral-200">
                <button
                  id="tab-login"
                  class="flex-1 py-3.5 text-sm font-semibold transition-colors
                    ${this.modo === 'login'
                      ? 'text-accent-600 border-b-2 border-accent-500 bg-accent-50/50'
                      : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}"
                >
                  Iniciar sesión
                </button>
                <button
                  id="tab-registro"
                  class="flex-1 py-3.5 text-sm font-semibold transition-colors
                    ${this.modo === 'registro'
                      ? 'text-accent-600 border-b-2 border-accent-500 bg-accent-50/50'
                      : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'}"
                >
                  Crear cuenta
                </button>
              </div>

              <!-- Formulario -->
              <div class="p-8">
                ${this.modo === 'login' ? this.renderizarLogin() : this.renderizarRegistro()}
              </div>
            </div>

            <!-- Nota institucional -->
            <p class="text-center text-xs text-neutral-400 mt-6">
              StudyFlow &mdash; Patrones de Software 2026
            </p>
          </div>
        </main>
      </div>
    `

    this.attachEventListeners()
  }

  private renderizarLogin(): string {
    return `
      <div class="animate-fade-in">
        <h2 class="text-xl font-bold text-neutral-900 mb-1">Bienvenido</h2>
        <p class="text-sm text-neutral-500 mb-6">Ingresa tus credenciales para continuar</p>

        <form id="form-auth" class="space-y-4" novalidate>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="input-email"
              type="email"
              class="input"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1.5">
              Contraseña
            </label>
            <div class="relative">
              <input
                id="input-password"
                type="password"
                class="input pr-10"
                placeholder="••••••••"
                autocomplete="current-password"
              />
              <button type="button" id="btn-toggle-password"
                class="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600">
                <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <p id="auth-error" class="text-danger-600 text-sm hidden bg-danger-50 border border-danger-200 rounded p-3"></p>

          <button
            id="btn-submit"
            type="submit"
            class="btn-accent w-full mt-2"
          >
            Iniciar sesión
          </button>
        </form>

        <p class="text-center text-sm text-neutral-500 mt-6">
          ¿No tienes cuenta?
          <button id="link-cambiar" class="text-accent-600 font-medium hover:underline">
            Crear una gratis
          </button>
        </p>
      </div>
    `
  }

  private renderizarRegistro(): string {
    return `
      <div class="animate-fade-in">
        <h2 class="text-xl font-bold text-neutral-900 mb-1">Crear cuenta</h2>
        <p class="text-sm text-neutral-500 mb-6">Completa los datos para comenzar a estudiar</p>

        <form id="form-auth" class="space-y-4" novalidate>
          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1.5">
              Nombre completo
            </label>
            <input
              id="input-nombre"
              type="text"
              class="input"
              placeholder="Juan Pérez"
              autocomplete="name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1.5">
              Correo electrónico
            </label>
            <input
              id="input-email"
              type="email"
              class="input"
              placeholder="tu@correo.com"
              autocomplete="email"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1.5">
              Contraseña
              <span class="font-normal text-neutral-400">(mínimo 6 caracteres)</span>
            </label>
            <div class="relative">
              <input
                id="input-password"
                type="password"
                class="input pr-10"
                placeholder="••••••••"
                autocomplete="new-password"
              />
              <button type="button" id="btn-toggle-password"
                class="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600">
                <svg id="eye-icon" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-neutral-700 mb-1.5">
              Confirmar contraseña
            </label>
            <input
              id="input-password2"
              type="password"
              class="input"
              placeholder="••••••••"
              autocomplete="new-password"
            />
          </div>

          <p id="auth-error" class="text-danger-600 text-sm hidden bg-danger-50 border border-danger-200 rounded p-3"></p>

          <button
            id="btn-submit"
            type="submit"
            class="btn-accent w-full mt-2"
          >
            Crear cuenta
          </button>
        </form>

        <p class="text-center text-sm text-neutral-500 mt-6">
          ¿Ya tienes cuenta?
          <button id="link-cambiar" class="text-accent-600 font-medium hover:underline">
            Iniciar sesión
          </button>
        </p>
      </div>
    `
  }

  // ─── EVENT LISTENERS ─────────────────────────────────────────────────────────

  private attachEventListeners(): void {
    // Pestañas
    document.getElementById('tab-login')?.addEventListener('click', () => {
      if (this.modo !== 'login') { this.modo = 'login'; this.renderizar() }
    })
    document.getElementById('tab-registro')?.addEventListener('click', () => {
      if (this.modo !== 'registro') { this.modo = 'registro'; this.renderizar() }
    })
    document.getElementById('link-cambiar')?.addEventListener('click', () => {
      this.modo = this.modo === 'login' ? 'registro' : 'login'
      this.renderizar()
    })

    // Toggle contraseña visible
    document.getElementById('btn-toggle-password')?.addEventListener('click', () => {
      const input = document.getElementById('input-password') as HTMLInputElement | null
      const icon  = document.getElementById('eye-icon')
      if (!input) return
      if (input.type === 'password') {
        input.type = 'text'
        if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
      } else {
        input.type = 'password'
        if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
      }
    })

    // Submit del form
    const form = document.getElementById('form-auth')
    form?.addEventListener('submit', (e) => {
      e.preventDefault()
      if (this.modo === 'login') {
        this.handleLogin()
      } else {
        this.handleRegistro()
      }
    })

    // Enter en el último campo también envía
    document.getElementById('input-password2')?.addEventListener('keydown', (e) => {
      if ((e as KeyboardEvent).key === 'Enter') this.handleRegistro()
    })
  }

  // ─── HANDLERS ────────────────────────────────────────────────────────────────

  private async handleLogin(): Promise<void> {
    const email    = (document.getElementById('input-email')    as HTMLInputElement)?.value?.trim()
    const password = (document.getElementById('input-password') as HTMLInputElement)?.value

    const error = this.validarCampos({ email, password })
    if (error) { this.mostrarError(error); return }

    this.setLoading(true, 'Iniciando sesión...')
    try {
      const usuario = await authController.login({ email, password })
      this.onAutenticado?.(usuario)
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || ''
      if (msg.includes('401') || msg.includes('credencial') || msg.includes('incorrecta')) {
        this.mostrarError('Correo o contraseña incorrectos.')
      } else if (msg.includes('network') || msg.includes('fetch')) {
        this.mostrarError('Sin conexión con el servidor. Inténtalo de nuevo.')
      } else {
        this.mostrarError(err?.message || 'Error al iniciar sesión. Inténtalo de nuevo.')
      }
    } finally {
      this.setLoading(false, 'Iniciar sesión')
    }
  }

  private async handleRegistro(): Promise<void> {
    const nombre    = (document.getElementById('input-nombre')    as HTMLInputElement)?.value?.trim()
    const email     = (document.getElementById('input-email')     as HTMLInputElement)?.value?.trim()
    const password  = (document.getElementById('input-password')  as HTMLInputElement)?.value
    const password2 = (document.getElementById('input-password2') as HTMLInputElement)?.value

    const error = this.validarCampos({ nombre, email, password, password2 })
    if (error) { this.mostrarError(error); return }

    this.setLoading(true, 'Creando cuenta...')
    try {
      const usuario = await authController.registro({ nombre: nombre!, email, password })
      this.onAutenticado?.(usuario)
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || ''
      if (msg.includes('409') || msg.includes('ya está registrado') || msg.includes('existe')) {
        this.mostrarError('Este correo ya está registrado. ¿Quieres iniciar sesión?')
      } else {
        this.mostrarError(err?.message || 'Error al crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      this.setLoading(false, 'Crear cuenta')
    }
  }

  // ─── VALIDACIÓN ──────────────────────────────────────────────────────────────

  private validarCampos(campos: {
    nombre?:    string
    email:      string
    password:   string
    password2?: string
  }): string | null {
    if (campos.nombre !== undefined && !campos.nombre) {
      return 'El nombre es obligatorio.'
    }
    if (!campos.email) {
      return 'El correo electrónico es obligatorio.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email)) {
      return 'Ingresa un correo electrónico válido.'
    }
    if (!campos.password) {
      return 'La contraseña es obligatoria.'
    }
    if (campos.password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (campos.password2 !== undefined && campos.password !== campos.password2) {
      return 'Las contraseñas no coinciden.'
    }
    return null
  }

  // ─── UTILIDADES ──────────────────────────────────────────────────────────────

  private mostrarError(mensaje: string): void {
    const errorEl = document.getElementById('auth-error')
    if (!errorEl) return
    errorEl.textContent = mensaje
    errorEl.classList.remove('hidden')
    // Auto-ocultar después de 6 segundos
    setTimeout(() => errorEl.classList.add('hidden'), 6000)
  }

  private setLoading(cargando: boolean, textoBoton: string): void {
    const btn = document.getElementById('btn-submit') as HTMLButtonElement | null
    const inputs = document.querySelectorAll('#form-auth input')
    if (!btn) return

    if (cargando) {
      btn.disabled   = true
      btn.innerHTML  = `
        <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
        ${textoBoton}
      `
      inputs.forEach(i => (i as HTMLInputElement).disabled = true)
    } else {
      btn.disabled      = false
      btn.textContent   = textoBoton
      inputs.forEach(i => (i as HTMLInputElement).disabled = false)
    }
  }
}

/**
 * Router SPA para gestionar las vistas principales
 */

export type RouteType = 'inicio' | 'mazo' | 'sesion' | 'dashboard' | 'gemini'

export interface Route {
  path: RouteType
  titulo: string
}

export class Router {
  private rutas: Map<RouteType, Route> = new Map([
    ['inicio', { path: 'inicio', titulo: 'Mis Mazos' }],
    ['mazo', { path: 'mazo', titulo: 'Mazo' }],
    ['sesion', { path: 'sesion', titulo: 'Sesión de Estudio' }],
    ['dashboard', { path: 'dashboard', titulo: 'Dashboard' }],
    ['gemini', { path: 'gemini', titulo: 'Análisis IA' }],
  ])

  private rutaActual: RouteType = 'inicio'
  private callbacks: Map<RouteType, (() => void)[]> = new Map()

  constructor() {
    this.inicializarCallbacks()
  }

  private inicializarCallbacks(): void {
    this.rutas.forEach((ruta) => {
      this.callbacks.set(ruta.path, [])
    })
  }

  /**
   * Navegar a una ruta
   */
  navegar(ruta: RouteType): void {
    if (!this.rutas.has(ruta)) {
      console.error(`Ruta desconocida: ${ruta}`)
      return
    }

    console.log(`[Router] Navegando a: ${ruta}`)
    this.rutaActual = ruta

    // Ejecutar callbacks registrados para esta ruta
    const callbacks = this.callbacks.get(ruta) || []
    callbacks.forEach(cb => cb())

    // Actualizar historial del navegador
    window.history.pushState({ ruta }, '', `#${ruta}`)
  }

  /**
   * Obtener la ruta actual
   */
  obtenerRutaActual(): RouteType {
    return this.rutaActual
  }

  /**
   * Registrar un callback para cuando se navegue a una ruta
   */
  enRuta(ruta: RouteType, callback: () => void): void {
    const callbacks = this.callbacks.get(ruta) || []
    callbacks.push(callback)
    this.callbacks.set(ruta, callbacks)
  }

  /**
   * Obtener datos de una ruta
   */
  obtenerRuta(ruta: RouteType): Route | undefined {
    return this.rutas.get(ruta)
  }
}

export const router = new Router()

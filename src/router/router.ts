/**
 * Router SPA para gestionar las vistas principales
 */

export type RouteType = 'inicio' | 'mazo' | 'sesion' | 'dashboard' | 'gemini' | 'tarjetas' | 'desafio'

export interface Route {
  path: RouteType
  titulo: string
}

export class Router {
  private rutas: Map<RouteType, Route> = new Map([
    ['inicio',    { path: 'inicio',    titulo: 'Mis Mazos' }],
    ['mazo',      { path: 'mazo',      titulo: 'Mazo' }],
    ['sesion',    { path: 'sesion',    titulo: 'Sesión de Estudio' }],
    ['dashboard', { path: 'dashboard', titulo: 'Dashboard' }],
    ['gemini',    { path: 'gemini',    titulo: 'Análisis IA' }],
    ['tarjetas',  { path: 'tarjetas',  titulo: 'Gestionar Tarjetas' }],
    ['desafio',   { path: 'desafio',   titulo: 'Modo Desafío IA' }],
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

  navegar(ruta: RouteType): void {
    if (!this.rutas.has(ruta)) return

    this.rutaActual = ruta
    const callbacks = this.callbacks.get(ruta) || []
    callbacks.forEach(cb => cb())
    window.history.pushState({ ruta }, '', `#${ruta}`)
  }

  obtenerRutaActual(): RouteType {
    return this.rutaActual
  }

  enRuta(ruta: RouteType, callback: () => void): void {
    const callbacks = this.callbacks.get(ruta) || []
    callbacks.push(callback)
    this.callbacks.set(ruta, callbacks)
  }

  obtenerRuta(ruta: RouteType): Route | undefined {
    return this.rutas.get(ruta)
  }
}

export const router = new Router()

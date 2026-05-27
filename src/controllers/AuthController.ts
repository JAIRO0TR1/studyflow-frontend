import { authApi } from '@/api/authApi'
import type { LoginRequest, RegistroRequest, UsuarioSesion } from '@/models/Auth'

const TOKEN_KEY   = 'authToken'
const USUARIO_KEY = 'authUsuario'

/**
 * Controlador de autenticación — gestiona sesión local y llamadas al backend
 */
export class AuthController {

  /** Inicia sesión y guarda token + datos de usuario */
  async login(datos: LoginRequest): Promise<UsuarioSesion> {
    const resp = await authApi.login(datos)
    this.guardarSesion(resp.token, {
      usuarioId: resp.usuarioId,
      nombre:    resp.nombre,
      email:     resp.email,
    })
    return this.obtenerUsuario()!
  }

  /** Registra usuario nuevo e inicia sesión automáticamente */
  async registro(datos: RegistroRequest): Promise<UsuarioSesion> {
    const resp = await authApi.registro(datos)
    this.guardarSesion(resp.token, {
      usuarioId: resp.usuarioId,
      nombre:    resp.nombre,
      email:     resp.email,
    })
    return this.obtenerUsuario()!
  }

  /** Cierra sesión y limpia almacenamiento local */
  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
    sessionStorage.clear()
  }

  /** Verifica si hay sesión activa */
  estaAutenticado(): boolean {
    return !!localStorage.getItem(TOKEN_KEY)
  }

  /** Obtiene datos del usuario desde localStorage */
  obtenerUsuario(): UsuarioSesion | null {
    try {
      const raw = localStorage.getItem(USUARIO_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  /** Obtiene el token JWT */
  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  private guardarSesion(token: string, usuario: UsuarioSesion): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
  }
}

export const authController = new AuthController()

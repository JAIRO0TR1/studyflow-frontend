import { authApi } from '@/api/authApi'
import type { LoginRequest, RegistroRequest, UsuarioSesion } from '@/models/Auth'

const TOKEN_KEY   = 'authToken'
const USUARIO_KEY = 'authUsuario'

/**
 * Controlador de autenticación.
 * Gestiona el ciclo de vida de la sesión del usuario (Capa Controlador — MVC).
 */
export class AuthController {

  async login(datos: LoginRequest): Promise<UsuarioSesion> {
    const resp = await authApi.login(datos)
    this.guardarSesion(resp.token, {
      usuarioId: resp.usuarioId,
      nombre:    resp.nombre,
      email:     resp.email,
    })
    return this.obtenerUsuario()!
  }

  async registro(datos: RegistroRequest): Promise<UsuarioSesion> {
    const resp = await authApi.registro(datos)
    this.guardarSesion(resp.token, {
      usuarioId: resp.usuarioId,
      nombre:    resp.nombre,
      email:     resp.email,
    })
    return this.obtenerUsuario()!
  }

  cerrarSesion(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USUARIO_KEY)
    sessionStorage.clear()
  }

  estaAutenticado(): boolean {
    return !!localStorage.getItem(TOKEN_KEY)
  }

  obtenerUsuario(): UsuarioSesion | null {
    try {
      const raw = localStorage.getItem(USUARIO_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  }

  private guardarSesion(token: string, usuario: UsuarioSesion): void {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario))
  }
}

export const authController = new AuthController()

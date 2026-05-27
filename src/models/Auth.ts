/**
 * Modelos de autenticación
 */

export interface LoginRequest {
  email: string
  password: string
}

export interface RegistroRequest {
  nombre: string
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  usuarioId: string
  nombre: string
  email: string
}

export interface UsuarioSesion {
  usuarioId: string
  nombre: string
  email: string
}

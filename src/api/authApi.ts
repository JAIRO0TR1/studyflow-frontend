import { httpClient } from './HttpClient'
import type { LoginRequest, RegistroRequest, AuthResponse } from '@/models/Auth'

/**
 * API de autenticación
 */
export const authApi = {
  async login(datos: LoginRequest): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/login', datos)
  },

  async registro(datos: RegistroRequest): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>('/auth/registro', datos)
  },
}

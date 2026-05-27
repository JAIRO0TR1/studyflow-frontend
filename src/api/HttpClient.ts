/**
 * Cliente HTTP genérico para comunicación con el backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Compatibilidad: se mantiene para endpoints que aún usen el header demo
export const DEMO_USER_ID = 'demo-user-001'

// Callback global para manejar expiración de sesión (se setea desde main.ts)
let onSesionExpirada: (() => void) | null = null
export function setSesionExpiradaHandler(fn: () => void): void {
  onSesionExpirada = fn
}

export class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    // Adjuntar JWT si existe
    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      // Fallback para compatibilidad con endpoints que usen X-Usuario-Id
      headers['X-Usuario-Id'] = DEMO_USER_ID
    }

    try {
      const response = await fetch(url, { ...options, headers })

      // Sesión expirada o no autorizado → limpiar y redirigir al login
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUsuario')
        sessionStorage.clear()
        onSesionExpirada?.()
        throw new Error('Sesión expirada. Por favor inicia sesión de nuevo.')
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorText || errorMessage
        } catch {
          if (errorText) errorMessage = errorText.substring(0, 300)
        }
        throw new Error(errorMessage)
      }

      if (response.status === 204) {
        return undefined as unknown as T
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()

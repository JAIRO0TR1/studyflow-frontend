/**
 * Cliente HTTP genérico para comunicación con el backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// ID del usuario demo — en una app con auth real vendría del token
export const DEMO_USER_ID = 'demo-user-001'

export class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Usuario-Id': DEMO_USER_ID,
      ...(options.headers as Record<string, string>),
    }

    const token = localStorage.getItem('authToken')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, { ...options, headers })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = `HTTP ${response.status}`
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorText || errorMessage
        } catch {
          if (errorText) errorMessage = errorText.substring(0, 300)
        }
        console.error(`[HttpClient] Backend error ${response.status} en ${endpoint}:`, errorMessage)
        throw new Error(errorMessage)
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return undefined as unknown as T
      }

      return await response.json()
    } catch (error) {
      console.error(`[HttpClient] Error en ${endpoint}:`, error)
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

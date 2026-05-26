import { httpClient, DEMO_USER_ID } from './HttpClient'
import type { Mazo, MazoDTO, MazoDeCreacion, MazoConEstadisticas } from '@/models/Mazo'

/**
 * API para gestión de mazos
 */

export const mazoApi = {
  /**
   * Obtener todos los mazos del usuario
   */
  async obtenerTodos(): Promise<Mazo[]> {
    return httpClient.get<Mazo[]>('/mazos')
  },

  /**
   * Obtener un mazo específico con sus tarjetas
   */
  async obtenerPorId(id: string): Promise<MazoConEstadisticas> {
    return httpClient.get<MazoConEstadisticas>(`/mazos/${id}`)
  },

  /**
   * Crear un nuevo mazo
   */
  async crear(datos: MazoDeCreacion): Promise<Mazo> {
    return httpClient.post<Mazo>('/mazos', datos)
  },

  /**
   * Actualizar un mazo
   */
  async actualizar(id: string, datos: MazoDTO): Promise<Mazo> {
    return httpClient.put<Mazo>(`/mazos/${id}`, datos)
  },

  /**
   * Eliminar un mazo
   */
  async eliminar(id: string): Promise<void> {
    return httpClient.delete<void>(`/mazos/${id}`)
  },

  /**
   * Duplicar un mazo
   */
  async duplicar(id: string): Promise<Mazo> {
    return httpClient.post<Mazo>(`/mazos/${id}/duplicar`, {})
  },

  /**
   * Exportar un mazo (JSON o CSV)
   */
  async exportar(id: string, formato: 'json' | 'csv'): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/mazos/${id}/exportar?formato=${formato}`,
      {
        method: 'POST',
        headers: {
          'X-Usuario-Id': DEMO_USER_ID,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Error al exportar mazo: ${response.statusText}`)
    }

    return response.blob()
  },

  /**
   * Importar un mazo desde archivo
   */
  async importar(archivo: File): Promise<Mazo> {
    const formData = new FormData()
    formData.append('archivo', archivo)

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/mazos/importar`,
      {
        method: 'POST',
        headers: {
          'X-Usuario-Id': DEMO_USER_ID,
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
        body: formData,
      }
    )

    if (!response.ok) {
      throw new Error(`Error al importar mazo: ${response.statusText}`)
    }

    return response.json()
  },
}

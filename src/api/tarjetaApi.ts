import { httpClient } from './HttpClient'
import type { Tarjeta, TarjetaDTO, TarjetaDeCreacion } from '@/models/Tarjeta'

/**
 * API para gestión de tarjetas
 */

export const tarjetaApi = {
  /**
   * Obtener todas las tarjetas de un mazo
   */
  async obtenerPorMazo(mazoId: string): Promise<Tarjeta[]> {
    return httpClient.get<Tarjeta[]>(`/mazos/${mazoId}/tarjetas`)
  },

  /**
   * Obtener una tarjeta específica
   */
  async obtenerPorId(id: string): Promise<Tarjeta> {
    return httpClient.get<Tarjeta>(`/tarjetas/${id}`)
  },

  /**
   * Crear una nueva tarjeta
   */
  async crear(datos: TarjetaDeCreacion): Promise<Tarjeta> {
    return httpClient.post<Tarjeta>('/tarjetas', datos)
  },

  /**
   * Actualizar una tarjeta
   */
  async actualizar(id: string, datos: TarjetaDTO): Promise<Tarjeta> {
    return httpClient.put<Tarjeta>(`/tarjetas/${id}`, datos)
  },

  /**
   * Eliminar una tarjeta
   */
  async eliminar(id: string): Promise<void> {
    return httpClient.delete<void>(`/tarjetas/${id}`)
  },

  /**
   * Crear múltiples tarjetas (para importación o generadas por IA)
   */
  async crearMultiples(mazoId: string, tarjetas: TarjetaDTO[]): Promise<Tarjeta[]> {
    return httpClient.post<Tarjeta[]>(`/mazos/${mazoId}/tarjetas/crear-multiples`, {
      tarjetas,
    })
  },
}

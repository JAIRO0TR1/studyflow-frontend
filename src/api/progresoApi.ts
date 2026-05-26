import { httpClient } from './HttpClient'
import type { Progreso, EstadisticasGlobales } from '@/models/Progreso'

/**
 * API para obtener estadísticas y progreso
 */

export const progresoApi = {
  /**
   * Obtener progreso de un mazo específico
   */
  async obtenerDelMazo(mazoId: string): Promise<Progreso> {
    return httpClient.get<Progreso>(`/progreso/${mazoId}`)
  },

  /**
   * Obtener estadísticas globales del usuario
   */
  async obtenerGlobales(): Promise<EstadisticasGlobales> {
    return httpClient.get<EstadisticasGlobales>('/progreso/globales')
  },
}

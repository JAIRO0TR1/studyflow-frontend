import { progresoApi } from '@/api/progresoApi'
import type { Progreso, EstadisticasGlobales } from '@/models/Progreso'

/**
 * Controlador para acceso a estadísticas y progreso
 */

export class ProgresoController {
  /**
   * Obtener el progreso de un mazo específico
   */
  async obtenerProgresoMazo(mazoId: string): Promise<Progreso> {
    try {
      console.log(`[ProgresoController] Obteniendo progreso del mazo ${mazoId}`)
      const progreso = await progresoApi.obtenerDelMazo(mazoId)
      return progreso
    } catch (error) {
      console.error(`[ProgresoController] Error al obtener progreso:`, error)
      throw error
    }
  }

  /**
   * Obtener estadísticas globales del usuario
   */
  async obtenerEstadisticasGlobales(): Promise<EstadisticasGlobales> {
    try {
      console.log('[ProgresoController] Obteniendo estadísticas globales')
      const estadisticas = await progresoApi.obtenerGlobales()
      return estadisticas
    } catch (error) {
      console.error('[ProgresoController] Error al obtener estadísticas:', error)
      throw error
    }
  }

  /**
   * Formatear racha de días como texto legible
   */
  formatearRacha(racha: number): string {
    if (racha === 0) return 'Sin racha'
    if (racha === 1) return '1 día'
    return `${racha} días`
  }

  /**
   * Formatear porcentaje con decimales
   */
  formatearPorcentaje(valor: number, decimales: number = 1): string {
    return `${valor.toFixed(decimales)}%`
  }

  /**
   * Calcular días restantes para dominar el mazo
   */
  calcularDiasRestantes(
    tarjetasPendientes: number,
    tarjetasEstudiadosPorDia: number = 20
  ): number {
    if (tarjetasEstudiadosPorDia <= 0) return 0
    return Math.ceil(tarjetasPendientes / tarjetasEstudiadosPorDia)
  }
}

export const progresoController = new ProgresoController()

import { progresoApi } from '@/api/progresoApi'
import type { Progreso, EstadisticasGlobales } from '@/models/Progreso'

/**
 * Controlador para estadísticas y progreso.
 * Refleja el patrón Observer del backend: el dashboard se actualiza
 * automáticamente al finalizar cada sesión (Capa Controlador — MVC).
 */
export class ProgresoController {

  async obtenerProgresoMazo(mazoId: string): Promise<Progreso> {
    return progresoApi.obtenerDelMazo(mazoId)
  }

  async obtenerEstadisticasGlobales(): Promise<EstadisticasGlobales> {
    return progresoApi.obtenerGlobales()
  }

  formatearRacha(racha: number): string {
    if (racha === 0) return 'Sin racha'
    if (racha === 1) return '1 día'
    return `${racha} días`
  }

  formatearPorcentaje(valor: number, decimales: number = 1): string {
    return `${valor.toFixed(decimales)}%`
  }

  calcularDiasRestantes(
    tarjetasPendientes: number,
    tarjetasEstudiadosPorDia: number = 20
  ): number {
    if (tarjetasEstudiadosPorDia <= 0) return 0
    return Math.ceil(tarjetasPendientes / tarjetasEstudiadosPorDia)
  }
}

export const progresoController = new ProgresoController()

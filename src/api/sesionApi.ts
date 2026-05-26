import { httpClient } from './HttpClient'
import type { Sesion, SesionDeCreacion, SesionActiva, RespuestaRegistro } from '@/models/Sesion'

/**
 * API para gestión de sesiones de estudio
 */

export const sesionApi = {
  /**
   * Iniciar una nueva sesión de estudio para un mazo
   */
  async iniciar(datos: SesionDeCreacion): Promise<SesionActiva> {
    return httpClient.post<SesionActiva>('/sesiones/iniciar', datos)
  },

  /**
   * Obtener una sesión activa
   */
  async obtenerActiva(sesionId: string): Promise<SesionActiva> {
    return httpClient.get<SesionActiva>(`/sesiones/${sesionId}`)
  },

  /**
   * Registrar la respuesta a una tarjeta
   */
  async registrarRespuesta(
    sesionId: string,
    tarjetaId: string,
    calificacion: 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE'
  ): Promise<RespuestaRegistro> {
    return httpClient.post<RespuestaRegistro>(
      `/sesiones/${sesionId}/responder`,
      {
        tarjetaId,
        calificacion,
      }
    )
  },

  /**
   * Finalizar una sesión
   */
  async finalizar(sesionId: string): Promise<Sesion> {
    return httpClient.post<Sesion>(`/sesiones/${sesionId}/finalizar`, {})
  },

  /**
   * Obtener historial de sesiones de un mazo
   */
  async obtenerHistorial(mazoId: string): Promise<Sesion[]> {
    return httpClient.get<Sesion[]>(`/mazos/${mazoId}/sesiones`)
  },
}

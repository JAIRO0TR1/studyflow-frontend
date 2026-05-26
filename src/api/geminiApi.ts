import { httpClient } from './HttpClient'
import type { AnalisiaGeminiResponse, SolicitudAnalisisGemini } from '@/models/Gemini'

/**
 * API para integración con Gemini
 */

export const geminiApi = {
  /**
   * Solicitar análisis de un mazo y obtener tarjetas sugeridas
   */
  async analizarMazo(
    datos: SolicitudAnalisisGemini
  ): Promise<AnalisiaGeminiResponse> {
    return httpClient.post<AnalisiaGeminiResponse>(
      `/mazos/${datos.mazoId}/analizar`,
      {
        numeroTarjetas: datos.numeroTarjetas || 5,
      }
    )
  },
}

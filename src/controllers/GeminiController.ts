import { geminiApi } from '@/api/geminiApi'
import { tarjetaApi } from '@/api/tarjetaApi'
import type { AnalisiaGeminiResponse, TarjetaSugerida } from '@/models/Gemini'
import type { Tarjeta } from '@/models/Tarjeta'

/**
 * Controlador para integración con IA de Gemini
 * Orquesta el análisis de mazos y generación de tarjetas sugeridas
 */

export class GeminiController {
  /**
   * Solicitar análisis del mazo a Gemini
   */
  async analizarMazo(
    mazoId: string,
    numeroTarjetas: number = 5
  ): Promise<AnalisiaGeminiResponse> {
    try {
      console.log(
        `[GeminiController] Analizando mazo ${mazoId} para generar ${numeroTarjetas} tarjetas`
      )
      const analisis = await geminiApi.analizarMazo({
        mazoId,
        numeroTarjetas,
      })
      console.log(
        `[GeminiController] Análisis completado. ${analisis.tarjetasSugeridas.length} tarjetas sugeridas`
      )
      return analisis
    } catch (error) {
      console.error('[GeminiController] Error al analizar mazo:', error)
      throw error
    }
  }

  /**
   * Aceptar y agregar las tarjetas sugeridas por Gemini al mazo
   */
  async aceptarTarjetasSugeridas(
    mazoId: string,
    tarjetasSugeridas: TarjetaSugerida[]
  ): Promise<Tarjeta[]> {
    try {
      console.log(
        `[GeminiController] Agregando ${tarjetasSugeridas.length} tarjetas sugeridas al mazo ${mazoId}`
      )
      const tarjetasCreadas = await tarjetaApi.crearMultiples(
        mazoId,
        tarjetasSugeridas.map(t => ({
          frente: t.frente,
          reverso: t.reverso,
          tipo: 'TEXTO',
        }))
      )
      console.log(
        `[GeminiController] ${tarjetasCreadas.length} tarjetas agregadas correctamente`
      )
      return tarjetasCreadas
    } catch (error) {
      console.error(
        '[GeminiController] Error al agregar tarjetas sugeridas:',
        error
      )
      throw error
    }
  }

  /**
   * Rechazar las tarjetas sugeridas (no hacer nada)
   */
  rechazarTarjetasSugeridas(): void {
    console.log('[GeminiController] Tarjetas sugeridas rechazadas por el usuario')
  }

  /**
   * Editar una tarjeta sugerida antes de aceptarla
   */
  editarTarjetaSugerida(
    tarjeta: TarjetaSugerida,
    nuevoFrente?: string,
    nuevoReverso?: string
  ): TarjetaSugerida {
    return {
      ...tarjeta,
      frente: nuevoFrente || tarjeta.frente,
      reverso: nuevoReverso || tarjeta.reverso,
    }
  }

  /**
   * Validar tarjeta antes de aceptarla
   */
  validarTarjetaSugerida(tarjeta: TarjetaSugerida): boolean {
    return tarjeta.frente.trim().length > 0 && tarjeta.reverso.trim().length > 0
  }
}

export const geminiController = new GeminiController()

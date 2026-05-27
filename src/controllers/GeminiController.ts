import { geminiApi } from '@/api/geminiApi'
import { mazoController } from '@/controllers/MazoController'
import type { AnalisiaGeminiResponse, TarjetaSugerida } from '@/models/Gemini'
import type { Tarjeta } from '@/models/Tarjeta'

/**
 * Controlador de integración con Gemini.
 * Implementa el patrón Facade del backend desde el cliente: una llamada
 * al endpoint /analizar oculta toda la complejidad de IA (Capa Controlador — MVC).
 */
export class GeminiController {

  async analizarMazo(
    mazoId: string,
    numeroTarjetas: number = 5
  ): Promise<AnalisiaGeminiResponse> {
    return geminiApi.analizarMazo({ mazoId, numeroTarjetas })
  }

  /**
   * Acepta tarjetas sugeridas y las agrega al mazo una por una.
   * Cada creación invoca un CrearTarjetaCommand en el backend (patrón Command).
   */
  async aceptarTarjetasSugeridas(
    mazoId: string,
    tarjetasSugeridas: TarjetaSugerida[]
  ): Promise<Tarjeta[]> {
    const tarjetasCreadas: Tarjeta[] = []
    for (const t of tarjetasSugeridas) {
      const tarjeta = await mazoController.agregarTarjeta(mazoId, {
        frente:   t.frente,
        reverso:  t.reverso,
        tipo:     'TEXTO',
        etiquetas: [],
        conPista:  false,
      })
      tarjetasCreadas.push(tarjeta)
    }
    return tarjetasCreadas
  }

  rechazarTarjetasSugeridas(): void {
    // Sin efecto local; el backend no persiste sugerencias rechazadas
  }

  editarTarjetaSugerida(
    tarjeta: TarjetaSugerida,
    nuevoFrente?: string,
    nuevoReverso?: string
  ): TarjetaSugerida {
    return {
      ...tarjeta,
      frente:  nuevoFrente  || tarjeta.frente,
      reverso: nuevoReverso || tarjeta.reverso,
    }
  }

  validarTarjetaSugerida(tarjeta: TarjetaSugerida): boolean {
    return tarjeta.frente.trim().length > 0 && tarjeta.reverso.trim().length > 0
  }
}

export const geminiController = new GeminiController()

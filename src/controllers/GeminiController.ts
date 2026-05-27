import { geminiApi } from '@/api/geminiApi'
import { tarjetaApi } from '@/api/tarjetaApi'
import { mazoController } from '@/controllers/MazoController'
import type { AnalisiaGeminiResponse, TarjetaSugerida } from '@/models/Gemini'
import type { Tarjeta } from '@/models/Tarjeta'

/**
 * Controlador de integración con Gemini.
 * Implementa el patrón Facade del backend desde el cliente: una llamada
 * al endpoint /analizar oculta toda la complejidad de IA (Capa Controlador — MVC).
 */
export class GeminiController {

  /**
   * Analizar un mazo y obtener tarjetas sugeridas.
   * Filtra duplicados contra las tarjetas existentes (frente normalizado).
   */
  async analizarMazo(
    mazoId: string,
    numeroTarjetas: number = 5
  ): Promise<AnalisiaGeminiResponse> {
    // 1. Obtener análisis y tarjetas existentes en paralelo
    const [analisis, existentes] = await Promise.all([
      geminiApi.analizarMazo({ mazoId, numeroTarjetas }),
      tarjetaApi.obtenerPorMazo(mazoId).catch(() => [] as Tarjeta[]),
    ])

    // 2. Construir set de frentes existentes normalizados
    const frentesExistentes = new Set(
      existentes.map(t => this.normalizar(t.frente))
    )

    // 3. Deduplicar sugerencias: contra existentes y entre sí
    const vistasFrente  = new Set<string>()
    const vistasReverso = new Set<string>()
    const filtradas: TarjetaSugerida[] = []

    for (const t of analisis.tarjetasSugeridas) {
      const fNorm = this.normalizar(t.frente)
      const rNorm = this.normalizar(t.reverso)
      if (!fNorm || !rNorm) continue
      if (frentesExistentes.has(fNorm)) continue
      if (vistasFrente.has(fNorm))      continue
      if (vistasReverso.has(rNorm))     continue
      vistasFrente.add(fNorm)
      vistasReverso.add(rNorm)
      filtradas.push(t)
    }

    return { ...analisis, tarjetasSugeridas: filtradas }
  }

  /**
   * Acepta tarjetas sugeridas y las agrega al mazo una por una.
   * Re-verifica duplicados antes de crear cada tarjeta.
   */
  async aceptarTarjetasSugeridas(
    mazoId: string,
    tarjetasSugeridas: TarjetaSugerida[]
  ): Promise<Tarjeta[]> {
    // Re-obtener tarjetas existentes (puede haber cambiado entre el análisis y la aceptación)
    const existentes = await tarjetaApi.obtenerPorMazo(mazoId).catch(() => [] as Tarjeta[])
    const frentesExistentes = new Set(existentes.map(t => this.normalizar(t.frente)))

    const creadas: Tarjeta[] = []
    for (const t of tarjetasSugeridas) {
      const fNorm = this.normalizar(t.frente)
      if (frentesExistentes.has(fNorm)) continue
      const tarjeta = await mazoController.agregarTarjeta(mazoId, {
        frente:    t.frente,
        reverso:   t.reverso,
        tipo:      'TEXTO',
        etiquetas: [],
        conPista:  false,
      })
      frentesExistentes.add(fNorm)
      creadas.push(tarjeta)
    }
    return creadas
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

  /**
   * Normaliza un texto para comparaciones: trim, minúsculas, sin tildes,
   * sin signos de puntuación finales, espacios colapsados.
   */
  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')   // diacríticos combinantes (tildes, etc)
      .toLowerCase()
      .replace(/[¿?¡!.,;:"'`´]/g, '')    // puntuación común
      .replace(/\s+/g, ' ')
      .trim()
  }
}

export const geminiController = new GeminiController()

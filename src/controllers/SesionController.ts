import { sesionApi } from '@/api/sesionApi'
import type { SesionDeCreacion, SesionActiva, RespuestaRegistro } from '@/models/Sesion'

/**
 * Controlador para sesiones de estudio.
 * Aplica el patrón Template Method a través del flujo de sesión (Capa Controlador — MVC).
 */
export class SesionController {
  private sesionActiva: SesionActiva | null = null

  async iniciarSesion(datos: SesionDeCreacion): Promise<SesionActiva> {
    this.sesionActiva = await sesionApi.iniciar(datos)
    return this.sesionActiva
  }

  obtenerSesionActiva(): SesionActiva | null {
    return this.sesionActiva
  }

  async registrarRespuesta(
    tarjetaId: string,
    calificacion: 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE'
  ): Promise<RespuestaRegistro> {
    if (!this.sesionActiva) throw new Error('No hay sesión activa')

    const respuesta = await sesionApi.registrarRespuesta(
      this.sesionActiva.sesionId,
      tarjetaId,
      calificacion
    )

    if (respuesta.siguienteTarjeta) {
      this.sesionActiva.tarjetaActual = respuesta.siguienteTarjeta
      this.sesionActiva.tarjetasRestantes--
      this.sesionActiva.indice++
    }

    return respuesta
  }

  async finalizarSesion(): Promise<void> {
    if (!this.sesionActiva) return
    await sesionApi.finalizar(this.sesionActiva.sesionId)
    this.sesionActiva = null
  }

  cancelarSesion(): void {
    this.sesionActiva = null
  }

  haySesionActiva(): boolean {
    return this.sesionActiva !== null
  }

  obtenerProgresoSesion(): { actual: number; total: number; porcentaje: number } | null {
    if (!this.sesionActiva) return null
    const actual     = this.sesionActiva.indice
    const total      = this.sesionActiva.totalTarjetas
    const porcentaje = Math.round((actual / total) * 100)
    return { actual, total, porcentaje }
  }
}

export const sesionController = new SesionController()

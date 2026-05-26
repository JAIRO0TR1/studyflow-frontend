import { sesionApi } from '@/api/sesionApi'
import type { SesionDeCreacion, SesionActiva, RespuestaRegistro } from '@/models/Sesion'

/**
 * Controlador para la gestión de sesiones de estudio
 * Orquesta la lógica de negocio del cliente para sesiones
 */

export class SesionController {
  private sesionActiva: SesionActiva | null = null
  private tiempoInicioTarjeta: number = 0

  /**
   * Iniciar una nueva sesión de estudio
   */
  async iniciarSesion(datos: SesionDeCreacion): Promise<SesionActiva> {
    try {
      console.log(`[SesionController] Iniciando sesión para mazo ${datos.mazoId}`)
      this.sesionActiva = await sesionApi.iniciar(datos)
      this.tiempoInicioTarjeta = Date.now()
      console.log(`[SesionController] Sesión iniciada: ${this.sesionActiva.sesionId}`)
      return this.sesionActiva
    } catch (error) {
      console.error('[SesionController] Error al iniciar sesión:', error)
      throw error
    }
  }

  /**
   * Obtener la sesión activa actual
   */
  obtenerSesionActiva(): SesionActiva | null {
    return this.sesionActiva
  }

  /**
   * Registrar la respuesta del usuario a una tarjeta
   */
  async registrarRespuesta(
    tarjetaId: string,
    calificacion: 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE'
  ): Promise<RespuestaRegistro> {
    if (!this.sesionActiva) {
      throw new Error('No hay sesión activa')
    }

    try {
      const tiempoRespuesta = Date.now() - this.tiempoInicioTarjeta
      console.log(
        `[SesionController] Registrando respuesta: ${calificacion} (tiempo: ${tiempoRespuesta}ms)`
      )

      const respuesta = await sesionApi.registrarRespuesta(
        this.sesionActiva.sesionId,
        tarjetaId,
        calificacion
      )

      // Actualizar la sesión con la tarjeta siguiente
      if (respuesta.siguienteTarjeta) {
        this.sesionActiva.tarjetaActual = respuesta.siguienteTarjeta
        this.sesionActiva.tarjetasRestantes--
        this.sesionActiva.indice++
      }

      this.tiempoInicioTarjeta = Date.now()
      return respuesta
    } catch (error) {
      console.error('[SesionController] Error al registrar respuesta:', error)
      throw error
    }
  }

  /**
   * Finalizar la sesión actual
   */
  async finalizarSesion(): Promise<void> {
    if (!this.sesionActiva) {
      throw new Error('No hay sesión activa')
    }

    try {
      console.log(`[SesionController] Finalizando sesión ${this.sesionActiva.sesionId}`)
      await sesionApi.finalizar(this.sesionActiva.sesionId)
      this.sesionActiva = null
      console.log('[SesionController] Sesión finalizada')
    } catch (error) {
      console.error('[SesionController] Error al finalizar sesión:', error)
      throw error
    }
  }

  /**
   * Cancelar la sesión actual sin guardar
   */
  cancelarSesion(): void {
    console.log('[SesionController] Cancelando sesión sin guardar')
    this.sesionActiva = null
    this.tiempoInicioTarjeta = 0
  }

  /**
   * Verificar si hay una sesión activa
   */
  haySesionActiva(): boolean {
    return this.sesionActiva !== null
  }

  /**
   * Obtener el progreso de la sesión actual
   */
  obtenerProgresoSesion(): {
    actual: number
    total: number
    porcentaje: number
  } | null {
    if (!this.sesionActiva) return null

    const actual = this.sesionActiva.indice
    const total = this.sesionActiva.totalTarjetas
    const porcentaje = Math.round((actual / total) * 100)

    return { actual, total, porcentaje }
  }
}

export const sesionController = new SesionController()

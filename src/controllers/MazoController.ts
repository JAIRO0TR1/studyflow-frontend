import { mazoApi } from '@/api/mazoApi'
import { tarjetaApi } from '@/api/tarjetaApi'
import type { Mazo, MazoDTO, MazoDeCreacion, MazoConEstadisticas } from '@/models/Mazo'
import type { Tarjeta, TarjetaDTO, TarjetaDeCreacion } from '@/models/Tarjeta'

/**
 * Controlador para la gestión de mazos
 * Orquesta la lógica de negocio del cliente para operaciones con mazos
 */

export class MazoController {
  /**
   * Cargar todos los mazos del usuario
   */
  async cargarMazos(): Promise<Mazo[]> {
    try {
      console.log('[MazoController] Cargando mazos...')
      const mazos = await mazoApi.obtenerTodos()
      console.log(`[MazoController] ${mazos.length} mazos cargados`)
      return mazos
    } catch (error) {
      console.error('[MazoController] Error al cargar mazos:', error)
      throw error
    }
  }

  /**
   * Cargar un mazo específico con sus tarjetas
   */
  async cargarMazo(mazoId: string): Promise<MazoConEstadisticas> {
    try {
      console.log(`[MazoController] Cargando mazo ${mazoId}...`)
      const mazo = await mazoApi.obtenerPorId(mazoId)
      console.log(`[MazoController] Mazo ${mazoId} cargado: ${mazo.tarjetas.length} tarjetas`)
      return mazo
    } catch (error) {
      console.error(`[MazoController] Error al cargar mazo ${mazoId}:`, error)
      throw error
    }
  }

  /**
   * Crear un nuevo mazo
   */
  async crearMazo(datos: MazoDeCreacion): Promise<Mazo> {
    try {
      console.log('[MazoController] Creando nuevo mazo:', datos.nombre)
      const nuevoMazo = await mazoApi.crear(datos)
      console.log(`[MazoController] Mazo creado: ${nuevoMazo.id}`)
      return nuevoMazo
    } catch (error) {
      console.error('[MazoController] Error al crear mazo:', error)
      throw error
    }
  }

  /**
   * Editar un mazo existente
   */
  async editarMazo(mazoId: string, datos: MazoDTO): Promise<Mazo> {
    try {
      console.log(`[MazoController] Editando mazo ${mazoId}`)
      const mazoActualizado = await mazoApi.actualizar(mazoId, datos)
      console.log(`[MazoController] Mazo ${mazoId} actualizado`)
      return mazoActualizado
    } catch (error) {
      console.error(`[MazoController] Error al editar mazo ${mazoId}:`, error)
      throw error
    }
  }

  /**
   * Eliminar un mazo
   */
  async eliminarMazo(mazoId: string): Promise<void> {
    try {
      console.log(`[MazoController] Eliminando mazo ${mazoId}`)
      await mazoApi.eliminar(mazoId)
      console.log(`[MazoController] Mazo ${mazoId} eliminado`)
    } catch (error) {
      console.error(`[MazoController] Error al eliminar mazo ${mazoId}:`, error)
      throw error
    }
  }

  /**
   * Duplicar un mazo existente
   */
  async duplicarMazo(mazoId: string): Promise<Mazo> {
    try {
      console.log(`[MazoController] Duplicando mazo ${mazoId}`)
      const mazoDuplicado = await mazoApi.duplicar(mazoId)
      console.log(`[MazoController] Mazo ${mazoId} duplicado: ${mazoDuplicado.id}`)
      return mazoDuplicado
    } catch (error) {
      console.error(`[MazoController] Error al duplicar mazo ${mazoId}:`, error)
      throw error
    }
  }

  /**
   * Exportar un mazo
   */
  async exportarMazo(mazoId: string, formato: 'json' | 'csv'): Promise<Blob> {
    try {
      console.log(`[MazoController] Exportando mazo ${mazoId} en formato ${formato}`)
      const blob = await mazoApi.exportar(mazoId, formato)
      console.log(`[MazoController] Mazo ${mazoId} exportado`)
      return blob
    } catch (error) {
      console.error(`[MazoController] Error al exportar mazo ${mazoId}:`, error)
      throw error
    }
  }

  /**
   * Importar un mazo desde archivo
   */
  async importarMazo(archivo: File): Promise<Mazo> {
    try {
      console.log('[MazoController] Importando mazo desde archivo:', archivo.name)
      const nuevoMazo = await mazoApi.importar(archivo)
      console.log(`[MazoController] Mazo importado: ${nuevoMazo.id}`)
      return nuevoMazo
    } catch (error) {
      console.error('[MazoController] Error al importar mazo:', error)
      throw error
    }
  }

  /**
   * Agregar una tarjeta a un mazo
   */
  async agregarTarjeta(mazoId: string, datos: TarjetaDTO): Promise<Tarjeta> {
    try {
      console.log(`[MazoController] Agregando tarjeta al mazo ${mazoId}`)
      const nuevaTarjeta = await tarjetaApi.crear({
        ...datos,
        mazoId,
      })
      console.log(`[MazoController] Tarjeta agregada: ${nuevaTarjeta.id}`)
      return nuevaTarjeta
    } catch (error) {
      console.error(`[MazoController] Error al agregar tarjeta:`, error)
      throw error
    }
  }

  /**
   * Editar una tarjeta
   */
  async editarTarjeta(tarjetaId: string, datos: TarjetaDTO): Promise<Tarjeta> {
    try {
      console.log(`[MazoController] Editando tarjeta ${tarjetaId}`)
      const tarjetaActualizada = await tarjetaApi.actualizar(tarjetaId, datos)
      console.log(`[MazoController] Tarjeta ${tarjetaId} actualizada`)
      return tarjetaActualizada
    } catch (error) {
      console.error(`[MazoController] Error al editar tarjeta:`, error)
      throw error
    }
  }

  /**
   * Eliminar una tarjeta
   */
  async eliminarTarjeta(tarjetaId: string): Promise<void> {
    try {
      console.log(`[MazoController] Eliminando tarjeta ${tarjetaId}`)
      await tarjetaApi.eliminar(tarjetaId)
      console.log(`[MazoController] Tarjeta ${tarjetaId} eliminada`)
    } catch (error) {
      console.error(`[MazoController] Error al eliminar tarjeta:`, error)
      throw error
    }
  }
}

export const mazoController = new MazoController()

import { mazoApi } from '@/api/mazoApi'
import { tarjetaApi } from '@/api/tarjetaApi'
import type { Mazo, MazoDTO, MazoDeCreacion, MazoConEstadisticas } from '@/models/Mazo'
import type { Tarjeta, TarjetaDTO } from '@/models/Tarjeta'

/**
 * Controlador para la gestión de mazos.
 * Orquesta la lógica de negocio del cliente (Capa Controlador — MVC).
 */
export class MazoController {

  async cargarMazos(): Promise<Mazo[]> {
    return mazoApi.obtenerTodos()
  }

  async cargarMazo(mazoId: string): Promise<MazoConEstadisticas> {
    return mazoApi.obtenerPorId(mazoId)
  }

  async crearMazo(datos: MazoDeCreacion): Promise<Mazo> {
    return mazoApi.crear(datos)
  }

  async editarMazo(mazoId: string, datos: MazoDTO): Promise<Mazo> {
    return mazoApi.actualizar(mazoId, datos)
  }

  async eliminarMazo(mazoId: string): Promise<void> {
    return mazoApi.eliminar(mazoId)
  }

  async duplicarMazo(mazoId: string): Promise<Mazo> {
    return mazoApi.duplicar(mazoId)
  }

  async exportarMazo(mazoId: string, formato: 'json' | 'csv'): Promise<Blob> {
    return mazoApi.exportar(mazoId, formato)
  }

  async importarMazo(archivo: File): Promise<Mazo> {
    return mazoApi.importar(archivo)
  }

  async agregarTarjeta(mazoId: string, datos: TarjetaDTO): Promise<Tarjeta> {
    return tarjetaApi.crear({ ...datos, mazoId })
  }

  async editarTarjeta(tarjetaId: string, datos: TarjetaDTO): Promise<Tarjeta> {
    return tarjetaApi.actualizar(tarjetaId, datos)
  }

  async eliminarTarjeta(tarjetaId: string): Promise<void> {
    return tarjetaApi.eliminar(tarjetaId)
  }
}

export const mazoController = new MazoController()

import type { Tarjeta } from './Tarjeta'

/**
 * Interfaz que representa un mazo de estudio
 */
export interface Mazo {
  id: string;
  nombre: string;
  descripcion?: string;
  etiquetas: string[];
  tarjetas: Tarjeta[];
  fechaCreacion: Date;
  ultimaModificacion: Date;
  algoritmo: 'SM2' | 'LEITNER' | 'ALEATORIO';
  usuarioId: string;
  publicado: boolean;
  totalTarjetas: number;
  total_tarjetas?: number; // alias para compatibilidad
}

export interface MazoDTO {
  nombre: string;
  descripcion?: string;
  etiquetas?: string[];
  algoritmo?: 'SM2' | 'LEITNER' | 'ALEATORIO';
}

export interface MazoDeCreacion extends MazoDTO {
  // Sin usuarioId: se establece en backend desde la sesión
}

export interface MazoConEstadisticas extends Mazo {
  tarjetasDominadas: number;
  tarjetasPendientes: number;
  porcentajeCompletado: number;
  proximaSesion?: Date;
}

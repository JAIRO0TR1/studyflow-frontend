import type { Tarjeta } from './Tarjeta'

/**
 * Registro de una respuesta a una tarjeta durante una sesión
 */
export interface RegistroRespuesta {
  id: string;
  tarjetaId: string;
  sesionId: string;
  calificacion: 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE';
  tiempoRespuesta: number; // en segundos
  timestamp: Date;
}

/**
 * Sesión de estudio activa
 */
export interface Sesion {
  id: string;
  mazoId: string;
  usuarioId: string;
  tarjetas: Tarjeta[];
  fechaInicio: Date;
  fechaFin?: Date;
  registros: RegistroRespuesta[];
  tarjetaActualIndex: number;
  completada: boolean;
}

export interface SesionDeCreacion {
  mazoId: string;
}

export interface SesionActiva {
  sesionId: string;
  tarjetaActual: Tarjeta;
  totalTarjetas: number;
  tarjetasRestantes: number;
  indice: number;
}

export interface RespuestaRegistro {
  sesionId: string;
  tarjetaId: string;
  calificacion: 'FACIL' | 'BIEN' | 'DIFICIL' | 'NO_LA_SUPE';
  siguienteTarjeta?: Tarjeta;
  sesionCompletada: boolean;
  estadisticas?: {
    aciertos: number;
    total: number;
    porcentaje: number;
  };
}

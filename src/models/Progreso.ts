/**
 * Estadísticas de progreso de un mazo
 */
export interface Progreso {
  mazoId: string;
  usuarioId: string;
  tarjetasDominadas: number;
  tarjetasPendientes: number;
  tarjetasNuevas: number;
  porcentajeCompletado: number;
  racha: number; // días consecutivos estudiados
  ultimaSesion: Date;
  proximaSesion: Date;
  aciertosTotal: number;
  intentosTotales: number;
  porcentajeAciertos: number;
  actividadUltimosMeses: ActividadDiaria[];
}

export interface ActividadDiaria {
  fecha: Date;
  tarjetasEstudiadas: number;
  aciertos: number;
  intentos: number;
}

export interface EstadisticasGlobales {
  totalMazos: number;
  totalTarjetas: number;
  rachaActual: number;
  aciertosHoy: number;
  intentosHoy: number;
  tiempoEstudiadoHoy: number; // en minutos
}

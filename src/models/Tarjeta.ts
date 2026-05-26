/**
 * Interfaz base para todas las tarjetas de estudio
 */
export interface Tarjeta {
  id: string;
  mazoId: string;
  frente: string;
  reverso: string;
  etiquetas: string[];
  tipo: 'TEXTO' | 'CODIGO';
  fechaCreacion: Date;
  proximoRepaso: Date;
  nivelDificultad: number; // 0-5 basado en SM-2
  intentosTotales: number;
  aciertos: number;
  conPista?: boolean;
  pista?: string;
}

export interface TarjetaDTO {
  frente: string;
  reverso: string;
  etiquetas?: string[];
  tipo?: 'TEXTO' | 'CODIGO';
  conPista?: boolean;
  pista?: string;
}

export interface TarjetaDeCreacion extends TarjetaDTO {
  mazoId: string;
}

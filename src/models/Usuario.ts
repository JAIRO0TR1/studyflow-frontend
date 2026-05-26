/**
 * Usuario del sistema
 */
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  apellido?: string;
  fechaRegistro: Date;
  ultimaConexion: Date;
  preferencias: PreferenciasUsuario;
}

export interface PreferenciasUsuario {
  algoritmoPorDefecto: 'SM2' | 'LEITNER' | 'ALEATORIO';
  tarjetasPorSesion?: number;
  idioma: 'es' | 'en';
  tema: 'light' | 'dark';
  notificacionesHabilitadas: boolean;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

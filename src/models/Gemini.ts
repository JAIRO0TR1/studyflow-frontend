/**
 * Respuesta de la API de Gemini con tarjetas sugeridas
 */
export interface TarjetaSugerida {
  frente: string;
  reverso: string;
  confianza?: number; // 0-1
}

export interface AnalisiaGeminiResponse {
  mazoId: string;
  resumen: string;
  tarjetasSugeridas: TarjetaSugerida[];
  temasDetectados: string[];
  temasNoDetectados: string[];
}

export interface SolicitudAnalisisGemini {
  mazoId: string;
  numeroTarjetas?: number;
}

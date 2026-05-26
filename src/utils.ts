/**
 * Utilidades comunes para el frontend
 */

/**
 * Formatear fecha a texto legible
 */
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formatear hora
 */
export function formatearHora(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Calcular diferencia de días entre dos fechas
 */
export function calcularDiasDiferencia(fecha1: Date, fecha2: Date): number {
  const diferencia = Math.abs(fecha2.getTime() - fecha1.getTime())
  return Math.floor(diferencia / (1000 * 60 * 60 * 24))
}

/**
 * Validar email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Truncar texto a una longitud máxima
 */
export function truncarTexto(texto: string, max: number = 50): string {
  return texto.length > max ? texto.substring(0, max) + '...' : texto
}

/**
 * Generar un ID único
 */
export function generarId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Delay (espera)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Convertir calificación a emoji
 */
export function calificacionAEmoji(calificacion: string): string {
  const emojis: Record<string, string> = {
    FACIL: '😄',
    BIEN: '👍',
    DIFICIL: '😕',
    NO_LA_SUPE: '😞',
  }
  return emojis[calificacion] || '❓'
}

/**
 * Convertir calificación a color Tailwind
 */
export function calificacionAColor(calificacion: string): string {
  const colores: Record<string, string> = {
    FACIL: 'success',
    BIEN: 'primary',
    DIFICIL: 'warning',
    NO_LA_SUPE: 'danger',
  }
  return colores[calificacion] || 'gray'
}

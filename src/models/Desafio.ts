/**
 * Tipos para el Modo Desafío IA
 */

export interface PreguntaDesafio {
  pregunta:          string
  respuestaCorrecta: string
  opciones:          string[]  // 4 opciones mezcladas
  indiceCorrecta:    number    // 0-3
}

export interface ResultadoDesafio {
  puntuacion: number
  correctas:  number
  total:      number
  porcentaje: number
  grado:      string
  esRecord:   boolean
}

/**
 * Modo Desafío IA — Mini-juego de opción múltiple generado por Gemini
 *
 * Flujo:
 *  1. Llama a /mazos/{id}/analizar para obtener tarjetas de IA
 *  2. Convierte cada tarjeta en una pregunta de 4 opciones
 *  3. Juego con timer por pregunta, vidas y combo multiplicador
 *  4. Guarda récord en localStorage
 */

import { geminiApi } from '@/api/geminiApi'
import type { TarjetaSugerida } from '@/models/Gemini'
import type { PreguntaDesafio, ResultadoDesafio } from '@/models/Desafio'

const TIEMPO_POR_PREGUNTA = 20
const VIDAS_INICIALES     = 3
const PREGUNTAS_MAX       = 10

const GRADOS: Record<string, string> = {
  'A+': '#059669', A: '#10b981', B: '#0ea5e9',
  C: '#f59e0b', D: '#f97316', F: '#f43f5e',
}

export class DesafioView {
  private container: HTMLElement
  private mazoId:    string
  private mazoNombre: string

  // Estado del juego
  private preguntas:   PreguntaDesafio[] = []
  private preguntaIdx  = 0
  private vidas        = VIDAS_INICIALES
  private puntuacion   = 0
  private combo        = 0
  private correctas    = 0
  private tiempoSeg    = TIEMPO_POR_PREGUNTA
  private timerHandle: ReturnType<typeof setInterval> | null = null
  private respondido   = false

  private onVolver?:         () => void
  private onCompleto?:       (r: ResultadoDesafio) => void

  constructor(containerId: string, mazoId: string, mazoNombre: string) {
    const el = document.getElementById(containerId)
    if (!el) throw new Error(`#${containerId} no encontrado`)
    this.container  = el
    this.mazoId     = mazoId
    this.mazoNombre = mazoNombre
  }

  setEventHandlers(h: { onVolver?: () => void; onCompleto?: (r: ResultadoDesafio) => void }): void {
    this.onVolver   = h.onVolver
    this.onCompleto = h.onCompleto
  }

  // ─── INICIO ──────────────────────────────────────────────────────────────────

  async iniciar(): Promise<void> {
    this.preguntaIdx = 0
    this.vidas       = VIDAS_INICIALES
    this.puntuacion  = 0
    this.combo       = 0
    this.correctas   = 0
    this.tiempoSeg   = TIEMPO_POR_PREGUNTA
    this.respondido  = false

    this.pantallaCarga()
    try {
      const res = await geminiApi.analizarMazo({ mazoId: this.mazoId, numeroTarjetas: PREGUNTAS_MAX })
      if (!res.tarjetasSugeridas || res.tarjetasSugeridas.length < 2) {
        this.pantallaError('Este mazo necesita al menos 2 tarjetas para generar el desafío. Agrega más contenido primero.')
        return
      }
      this.preguntas = this.construirPreguntas(res.tarjetasSugeridas)
      await this.pantallaConteo()
      this.mostrarPregunta()
    } catch {
      this.pantallaError('No se pudo conectar con la IA. Verifica tu conexión e intenta de nuevo.')
    }
  }

  // ─── CONSTRUCCIÓN DE PREGUNTAS ───────────────────────────────────────────────

  private construirPreguntas(tarjetas: TarjetaSugerida[]): PreguntaDesafio[] {
    const max      = Math.min(tarjetas.length, PREGUNTAS_MAX)
    const mezcladas = this.shuffle([...tarjetas]).slice(0, max)
    const reversos  = tarjetas.map(t => t.reverso)

    return mezcladas.map(t => {
      const correcta    = t.reverso
      const distractors = reversos
        .filter(r => r !== correcta)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)

      // Completar con genéricas si el mazo es pequeño
      const relleno = ['Ninguna de las anteriores', 'No se puede determinar', 'Todas las opciones', 'Depende del contexto']
      while (distractors.length < 3) distractors.push(relleno[distractors.length] ?? `Opción ${distractors.length + 2}`)

      const opciones       = this.shuffle([correcta, ...distractors])
      const indiceCorrecta = opciones.indexOf(correcta)

      return { pregunta: t.frente, respuestaCorrecta: correcta, opciones, indiceCorrecta }
    })
  }

  private shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  // ─── PANTALLAS ───────────────────────────────────────────────────────────────

  private pantallaCarga(): void {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-6 animate-fade-in" style="min-height:400px">
        <div class="relative">
          <div class="w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-once"
            style="background:linear-gradient(135deg,#8b5cf6,#6d28d9)">
            <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"/>
            </svg>
          </div>
          <div class="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-400 rounded-full
            flex items-center justify-center shadow-md">
            <svg class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        </div>
        <div class="text-center">
          <h2 class="text-xl font-bold text-neutral-900 mb-1">Preparando Desafío IA</h2>
          <p class="text-neutral-500 text-sm">Gemini está analizando <strong>${this.esc(this.mazoNombre)}</strong>...</p>
          <p class="text-neutral-400 text-xs mt-1">Esto puede tardar unos segundos</p>
        </div>
        <div class="flex gap-2">
          ${['Generando preguntas', 'Creando distractores', 'Calibrando dificultad'].map((t, i) => `
            <div class="px-3 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-600"
              style="animation-delay:${i * 0.3}s; animation: fadeIn 0.5s ease-in ${i * 0.4}s both">
              ${t}
            </div>
          `).join('')}
        </div>
      </div>
    `
  }

  private pantallaError(msg: string): void {
    this.container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-16 animate-fade-in">
        <div class="w-16 h-16 bg-rose-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
          <svg class="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"/>
          </svg>
        </div>
        <h2 class="text-lg font-bold text-neutral-900 mb-2">No se pudo iniciar el desafío</h2>
        <p class="text-neutral-500 text-sm mb-6">${this.esc(msg)}</p>
        <button id="btn-err-volver" class="btn-secondary">Volver</button>
      </div>
    `
    document.getElementById('btn-err-volver')?.addEventListener('click', () => this.onVolver?.())
  }

  private pantallaConteo(): Promise<void> {
    return new Promise(resolve => {
      const pasos = [
        { texto: '3', color: '#6366f1' },
        { texto: '2', color: '#8b5cf6' },
        { texto: '1', color: '#d946ef' },
        { texto: 'Adelante', color: '#059669' },
      ]
      let i = 0
      const siguiente = () => {
        if (i >= pasos.length) { resolve(); return }
        const p = pasos[i]
        this.container.innerHTML = `
          <div class="flex flex-col items-center justify-center gap-6" style="min-height:400px">
            <p class="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
              ${this.preguntas.length} preguntas &bull; ${VIDAS_INICIALES} vidas &bull; ${TIEMPO_POR_PREGUNTA}s por pregunta
            </p>
            <div class="text-9xl font-black animate-bounce-in" style="color:${p.color}; line-height:1">
              ${p.texto}
            </div>
          </div>
        `
        i++
        setTimeout(siguiente, i === pasos.length ? 650 : 900)
      }
      siguiente()
    })
  }

  // ─── PREGUNTA ─────────────────────────────────────────────────────────────────

  private mostrarPregunta(): void {
    if (this.preguntaIdx >= this.preguntas.length || this.vidas <= 0) {
      this.pantallaResultados(); return
    }

    const p            = this.preguntas[this.preguntaIdx]
    const letras       = ['A', 'B', 'C', 'D']
    const pct          = Math.round((this.preguntaIdx / this.preguntas.length) * 100)
    const multip       = this.multiplicador()
    this.tiempoSeg     = TIEMPO_POR_PREGUNTA
    this.respondido    = false

    this.container.innerHTML = `
      <div class="max-w-2xl mx-auto animate-slide-up">

        <!-- HUD -->
        <div class="flex justify-between items-center mb-5">
          <!-- Vidas -->
          <div class="flex items-center gap-1.5">
            ${Array.from({ length: VIDAS_INICIALES }).map((_, vi) => `
              <svg class="w-6 h-6 transition-all duration-300 ${vi < this.vidas ? 'text-rose-500' : 'text-neutral-200'}"
                fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42
                  4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3
                  16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55
                  11.54L12 21.35z"/>
              </svg>
            `).join('')}
          </div>

          <!-- Score + Combo -->
          <div class="flex items-center gap-3">
            ${multip > 1 ? `
              <div class="combo-badge animate-bounce-in">×${multip.toFixed(1)} COMBO</div>
            ` : ''}
            <div class="text-right">
              <p class="text-xs text-neutral-400 leading-none">Puntos</p>
              <p id="score-num" class="text-2xl font-black text-indigo-600 leading-tight tabular-nums">
                ${this.puntuacion.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <!-- Progreso de preguntas -->
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs text-neutral-400 shrink-0 tabular-nums">
            ${this.preguntaIdx + 1} / ${this.preguntas.length}
          </span>
          <div class="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              style="width:${pct}%;background:linear-gradient(90deg,#14b8a6,#6366f1)"></div>
          </div>
          <!-- Timer numérico -->
          <div id="timer-num" class="shrink-0 text-lg font-black tabular-nums w-8 text-right"
            style="color:#6366f1">${this.tiempoSeg}</div>
        </div>

        <!-- Barra de tiempo -->
        <div class="timer-bar-track mb-6">
          <div id="timer-fill" class="timer-bar-fill" style="width:100%"></div>
        </div>

        <!-- Tarjeta pregunta -->
        <div class="card mb-5" style="border-top:4px solid #6366f1;">
          <p class="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
            Pregunta ${this.preguntaIdx + 1}
          </p>
          <p class="text-xl sm:text-2xl font-bold text-neutral-900 leading-snug">
            ${this.esc(p.pregunta)}
          </p>
        </div>

        <!-- Opciones -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="opciones-grid">
          ${p.opciones.map((op, i) => `
            <button class="quiz-option" data-idx="${i}">
              <span class="quiz-option-letra">${letras[i]}</span>
              <span class="flex-1 text-sm leading-snug">${this.esc(op)}</span>
            </button>
          `).join('')}
        </div>

        <!-- Hint teclado -->
        <div class="flex justify-center gap-2 mt-4">
          ${letras.map(l => `<span class="kbd">${l}</span>`).join('')}
          <span class="text-xs text-neutral-400 ml-1 self-center">para responder</span>
        </div>
      </div>
    `

    this.iniciarTimer()
    this.escucharRespuesta()
  }

  // ─── TIMER ────────────────────────────────────────────────────────────────────

  private iniciarTimer(): void {
    this.detenerTimer()

    // Drena la barra visualmente con CSS transition
    requestAnimationFrame(() => {
      const fill = document.getElementById('timer-fill')
      if (fill) {
        fill.style.transition = `width ${TIEMPO_POR_PREGUNTA}s linear`
        fill.style.width      = '0%'
      }
    })

    this.timerHandle = setInterval(() => {
      this.tiempoSeg--
      const numEl = document.getElementById('timer-num')
      if (numEl) {
        numEl.textContent = String(this.tiempoSeg)
        if (this.tiempoSeg <= 5)       numEl.style.color = '#f43f5e'
        else if (this.tiempoSeg <= 10) numEl.style.color = '#f59e0b'
        else                           numEl.style.color = '#6366f1'
      }
      const fill = document.getElementById('timer-fill')
      if (fill && this.tiempoSeg <= 5) fill.classList.add('timer-bar-danger')

      if (this.tiempoSeg <= 0) {
        this.detenerTimer()
        if (!this.respondido) {
          this.respondido = true
          this.vidas--
          this.combo = 0
          this.mostrarFeedback(-1, false)
        }
      }
    }, 1000)
  }

  private detenerTimer(): void {
    if (this.timerHandle !== null) {
      clearInterval(this.timerHandle)
      this.timerHandle = null
    }
  }

  // ─── RESPUESTA ────────────────────────────────────────────────────────────────

  private escucharRespuesta(): void {
    const handler = (e: KeyboardEvent) => {
      if (this.respondido) return
      const mapa: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 }
      const idx = mapa[e.key.toLowerCase()]
      if (idx !== undefined) {
        document.removeEventListener('keydown', handler)
        this.procesar(idx)
      }
    }
    document.addEventListener('keydown', handler)

    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.respondido) return
        const idx = parseInt((btn as HTMLElement).dataset.idx ?? '0')
        document.removeEventListener('keydown', handler)
        this.procesar(idx)
      })
    })
  }

  private procesar(idx: number): void {
    if (this.respondido) return
    this.respondido = true
    this.detenerTimer()

    const p         = this.preguntas[this.preguntaIdx]
    const acierto   = idx === p.indiceCorrecta

    if (acierto) {
      this.combo++
      this.correctas++
      const pts = Math.round((100 + this.tiempoSeg * 5) * this.multiplicador())
      this.puntuacion += pts
      this.mostrarFeedback(idx, true, pts)
    } else {
      this.vidas--
      this.combo = 0
      this.mostrarFeedback(idx, false)
    }
  }

  private mostrarFeedback(idx: number, acierto: boolean, pts?: number): void {
    const p     = this.preguntas[this.preguntaIdx]
    const btns  = document.querySelectorAll<HTMLButtonElement>('.quiz-option')
    const tiempoAgotado = idx === -1

    btns.forEach((btn, i) => {
      btn.disabled = true
      if (i === p.indiceCorrecta) {
        btn.classList.add('quiz-option-correct')
      } else if (i === idx && !tiempoAgotado) {
        btn.classList.add('quiz-option-wrong')
      }
    })

    // Puntos flotantes
    if (acierto && pts) {
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;top:40%;left:50%;transform:translateX(-50%);
        font-size:2.5rem;font-weight:900;color:#059669;pointer-events:none;z-index:9999;
        animation:floatUp 0.9s ease-out forwards;`
      el.textContent = `+${pts}`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1000)
    }

    // Tiempo agotado — colorear barra
    if (tiempoAgotado) {
      const fill = document.getElementById('timer-fill')
      if (fill) { fill.style.background = '#f43f5e'; fill.style.width = '0%' }
    }

    setTimeout(() => {
      this.preguntaIdx++
      if (this.vidas <= 0 || this.preguntaIdx >= this.preguntas.length) {
        this.pantallaResultados()
      } else {
        this.mostrarPregunta()
      }
    }, 1300)
  }

  private multiplicador(): number {
    if (this.combo >= 5) return 3.0
    if (this.combo >= 4) return 2.5
    if (this.combo >= 3) return 2.0
    if (this.combo >= 2) return 1.5
    return 1.0
  }

  // ─── RESULTADOS ───────────────────────────────────────────────────────────────

  private pantallaResultados(): void {
    const total      = this.preguntas.length
    const pct        = Math.round((this.correctas / total) * 100)
    const grado      = this.grado(pct)
    const esRecord   = this.guardarRecord()
    const gradoColor = GRADOS[grado] ?? '#6366f1'

    const resultado: ResultadoDesafio = {
      puntuacion: this.puntuacion,
      correctas:  this.correctas,
      total,
      porcentaje: pct,
      grado,
      esRecord,
    }
    this.onCompleto?.(resultado)

    if (pct >= 70) this.confetti()

    const barColor = pct >= 80
      ? 'linear-gradient(90deg,#10b981,#059669)'
      : pct >= 60
      ? 'linear-gradient(90deg,#f59e0b,#d97706)'
      : 'linear-gradient(90deg,#f43f5e,#e11d48)'

    this.container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-6 animate-bounce-in">

        <!-- Grado -->
        <div class="mb-4">
          <div class="text-8xl font-black animate-bounce-in"
            style="color:${gradoColor};line-height:1.1">${grado}</div>
          ${esRecord ? `
            <div class="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold
              bg-amber-100 text-amber-700 border border-amber-300">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7
                  14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              NUEVO RÉCORD
            </div>
          ` : ''}
        </div>

        <!-- Puntuación -->
        <div class="card-featured mb-5 py-6">
          <p class="text-4xl font-black text-indigo-600 tabular-nums">${this.puntuacion.toLocaleString()}</p>
          <p class="text-sm text-neutral-500 mt-1">puntos obtenidos</p>
          ${this.recordGuardado() > 0 && !esRecord ? `
            <p class="text-xs text-neutral-400 mt-1">Récord: ${this.recordGuardado().toLocaleString()} pts</p>
          ` : ''}
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="card stat-card stat-card-emerald py-5">
            <p class="text-2xl font-bold text-emerald-600">${this.correctas}</p>
            <p class="text-xs text-neutral-500 mt-1">Correctas</p>
          </div>
          <div class="card stat-card stat-card-rose py-5">
            <p class="text-2xl font-bold text-rose-600">${total - this.correctas}</p>
            <p class="text-xs text-neutral-500 mt-1">Incorrectas</p>
          </div>
          <div class="card stat-card stat-card-indigo py-5">
            <p class="text-2xl font-bold text-indigo-600">${pct}%</p>
            <p class="text-xs text-neutral-500 mt-1">Precisión</p>
          </div>
        </div>

        <!-- Barra precisión -->
        <div class="progress mb-6">
          <div class="h-full rounded-full transition-all duration-1000"
            style="width:${pct}%;${barColor ? `background:${barColor}` : ''}"></div>
        </div>

        <!-- Mensaje motivacional -->
        <p class="text-sm text-neutral-500 mb-6">${this.mensajeMotivacion(pct)}</p>

        <!-- Acciones -->
        <div class="flex flex-col gap-2.5">
          <button id="btn-reintentar" class="btn-violet w-full py-3">
            Jugar de nuevo con nuevas preguntas
          </button>
          <button id="btn-volver-juego" class="btn-secondary w-full">
            Volver al inicio
          </button>
        </div>
      </div>
    `

    document.getElementById('btn-reintentar')?.addEventListener('click', () => this.iniciar())
    document.getElementById('btn-volver-juego')?.addEventListener('click', () => this.onVolver?.())
  }

  // ─── UTILIDADES ───────────────────────────────────────────────────────────────

  private grado(pct: number): string {
    if (pct >= 95) return 'A+'
    if (pct >= 80) return 'A'
    if (pct >= 70) return 'B'
    if (pct >= 60) return 'C'
    if (pct >= 50) return 'D'
    return 'F'
  }

  private mensajeMotivacion(pct: number): string {
    if (pct >= 95) return '¡Dominio absoluto! Eres un experto en este tema.'
    if (pct >= 80) return '¡Excelente desempeño! Tienes un sólido conocimiento del tema.'
    if (pct >= 70) return 'Buen trabajo. Repasa las tarjetas que fallaste y vuelve a intentarlo.'
    if (pct >= 50) return 'Vas por buen camino. Sigue estudiando el mazo para mejorar.'
    return 'No te desanimes. Estudia el mazo un poco más y vuelve a desafiarte.'
  }

  private guardarRecord(): boolean {
    const key   = `sf_record_${this.mazoId}`
    const previo = parseInt(localStorage.getItem(key) ?? '0')
    if (this.puntuacion > previo) {
      localStorage.setItem(key, String(this.puntuacion))
      return true
    }
    return false
  }

  private recordGuardado(): number {
    return parseInt(localStorage.getItem(`sf_record_${this.mazoId}`) ?? '0')
  }

  private confetti(): void {
    const colores = ['#6366f1', '#14b8a6', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#0ea5e9', '#d946ef']
    for (let i = 0; i < 70; i++) {
      const el = document.createElement('div')
      const size = Math.random() * 9 + 4
      el.style.cssText = `
        position:fixed; width:${size}px; height:${size}px;
        background:${colores[Math.floor(Math.random() * colores.length)]};
        left:${Math.random() * 100}vw; top:-12px;
        border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
        z-index:9999; pointer-events:none;
        opacity:${0.7 + Math.random() * 0.3};
        animation:confettiFall ${1.8 + Math.random() * 1.8}s ease-in ${Math.random() * 0.8}s forwards;
      `
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 4000)
    }
  }

  private esc(t: string): string {
    const d = document.createElement('div')
    d.textContent = t
    return d.innerHTML
  }
}

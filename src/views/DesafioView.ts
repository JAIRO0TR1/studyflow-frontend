/**
 * Modo Desafío IA — Mini-juego de opción múltiple generado por Gemini
 *
 * Garantías de variedad:
 *  - Preguntas únicas (frente normalizado) entre sí
 *  - Opciones únicas dentro de cada pregunta
 *  - Distractors prefieren ser reversos de OTRAS preguntas del mismo conjunto
 *  - Si Gemini devuelve pocas tarjetas, se complementan con tarjetas existentes del mazo
 */

import { geminiApi }   from '@/api/geminiApi'
import { tarjetaApi }  from '@/api/tarjetaApi'
import type { TarjetaSugerida } from '@/models/Gemini'
import type { Tarjeta }         from '@/models/Tarjeta'
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

  // Estado
  private preguntas:   PreguntaDesafio[] = []
  private preguntaIdx  = 0
  private vidas        = VIDAS_INICIALES
  private puntuacion   = 0
  private combo        = 0
  private correctas    = 0
  private tiempoSeg    = TIEMPO_POR_PREGUNTA
  private timerHandle: ReturnType<typeof setInterval> | null = null
  private respondido   = false
  private keyHandler:  ((e: KeyboardEvent) => void) | null = null

  private onVolver?:   () => void
  private onCompleto?: (r: ResultadoDesafio) => void

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
      // Pedir tarjetas a Gemini Y existentes en paralelo
      const [analisis, existentes] = await Promise.all([
        geminiApi.analizarMazo({ mazoId: this.mazoId, numeroTarjetas: PREGUNTAS_MAX }),
        tarjetaApi.obtenerPorMazo(this.mazoId).catch(() => [] as Tarjeta[]),
      ])

      // Pool de pares pregunta/respuesta: Gemini + existentes (complemento)
      const candidatos: TarjetaSugerida[] = [
        ...analisis.tarjetasSugeridas,
        ...existentes.map(t => ({ frente: t.frente, reverso: t.reverso } as TarjetaSugerida)),
      ]

      const unicos = this.deduplicar(candidatos)

      if (unicos.length < 2) {
        this.pantallaError('Este mazo necesita al menos 2 tarjetas distintas para generar el desafío. Agrega más contenido y vuelve a intentar.')
        return
      }

      this.preguntas = this.construirPreguntas(unicos)
      await this.pantallaConteo()
      this.mostrarPregunta()
    } catch {
      this.pantallaError('No se pudo conectar con la IA. Verifica tu conexión e intenta de nuevo.')
    }
  }

  // ─── DEDUPLICACIÓN ────────────────────────────────────────────────────────────

  private deduplicar(items: TarjetaSugerida[]): TarjetaSugerida[] {
    const vistasFrente  = new Set<string>()
    const vistasReverso = new Set<string>()
    const out: TarjetaSugerida[] = []

    for (const t of items) {
      if (!t?.frente?.trim() || !t?.reverso?.trim()) continue
      const f = this.normalizar(t.frente)
      const r = this.normalizar(t.reverso)
      if (!f || !r) continue
      if (vistasFrente.has(f) || vistasReverso.has(r)) continue
      vistasFrente.add(f)
      vistasReverso.add(r)
      out.push(t)
    }
    return out
  }

  // ─── CONSTRUCCIÓN DE PREGUNTAS ───────────────────────────────────────────────

  private construirPreguntas(unicos: TarjetaSugerida[]): PreguntaDesafio[] {
    const maxPreg = Math.min(unicos.length, PREGUNTAS_MAX)
    const elegidas = this.shuffle([...unicos]).slice(0, maxPreg)

    // Pool de TODOS los reversos del mazo (para distractors)
    const todosReversos = unicos.map(t => t.reverso)

    return elegidas.map(t => {
      const correcta    = t.reverso
      const correctaN   = this.normalizar(correcta)
      // Distractors: reversos de OTRAS tarjetas (no la actual), normalizados-únicos
      const candidatos  = todosReversos
        .filter(r => this.normalizar(r) !== correctaN)
        .sort(() => Math.random() - 0.5)

      const distractors: string[]      = []
      const vistasNorm = new Set<string>([correctaN])
      for (const c of candidatos) {
        const n = this.normalizar(c)
        if (vistasNorm.has(n)) continue
        vistasNorm.add(n)
        distractors.push(c)
        if (distractors.length === 3) break
      }

      // Si no alcanzan, rellenar con genéricas únicas
      const fallback = ['Ninguna de las anteriores', 'No se puede determinar con esta información', 'Todas las opciones son válidas', 'Depende del contexto del problema']
      let fi = 0
      while (distractors.length < 3) {
        const cand = fallback[fi++]
        if (!cand) break
        const n = this.normalizar(cand)
        if (vistasNorm.has(n)) continue
        vistasNorm.add(n)
        distractors.push(cand)
      }

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

  private normalizar(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[¿?¡!.,;:"'`´]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // ─── PANTALLAS ───────────────────────────────────────────────────────────────

  private pantallaCarga(): void {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center gap-6 animate-fade-in" style="min-height:400px">
        <div class="relative">
          <div class="w-24 h-24 rounded-2xl flex items-center justify-center shadow-colored-violet animate-pulse-once"
            style="background:linear-gradient(135deg,#7c3aed,#4f46e5)">
            <svg class="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.5">
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
          <h2 class="text-xl font-bold text-slate-900 mb-1">Preparando Desafío IA</h2>
          <p class="text-slate-500 text-sm">Gemini está analizando <strong>${this.esc(this.mazoNombre)}</strong>...</p>
          <p class="text-slate-400 text-xs mt-1">Esto puede tardar unos segundos</p>
        </div>
        <div class="flex flex-wrap justify-center gap-2">
          ${['Generando preguntas', 'Creando distractores', 'Calibrando dificultad'].map((t, i) => `
            <div class="px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
              style="animation: fadeIn 0.5s ease-in ${i * 0.4}s both">
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
        <h2 class="text-lg font-bold text-slate-900 mb-2">No se pudo iniciar el desafío</h2>
        <p class="text-slate-500 text-sm mb-6">${this.esc(msg)}</p>
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
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest">
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

    const p      = this.preguntas[this.preguntaIdx]
    const letras = ['A', 'B', 'C', 'D']
    const pct    = Math.round((this.preguntaIdx / this.preguntas.length) * 100)
    const multip = this.multiplicador()
    this.tiempoSeg  = TIEMPO_POR_PREGUNTA
    this.respondido = false

    this.container.innerHTML = `
      <div class="max-w-2xl mx-auto animate-slide-up">

        <!-- HUD -->
        <div class="flex justify-between items-center mb-5">
          <div class="flex items-center gap-1.5">
            ${Array.from({ length: VIDAS_INICIALES }).map((_, vi) => `
              <svg class="w-6 h-6 transition-all duration-300 ${vi < this.vidas ? 'text-rose-500' : 'text-slate-200'}"
                fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42
                  4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3
                  16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55
                  11.54L12 21.35z"/>
              </svg>
            `).join('')}
          </div>
          <div class="flex items-center gap-3">
            ${multip > 1 ? `<div class="combo-badge animate-bounce-in">×${multip.toFixed(1)} COMBO</div>` : ''}
            <div class="text-right">
              <p class="text-xs text-slate-400 leading-none">Puntos</p>
              <p id="score-num" class="text-2xl font-black text-indigo-600 leading-tight tabular-nums">
                ${this.puntuacion.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <!-- Progreso preguntas -->
        <div class="flex items-center gap-3 mb-4">
          <span class="text-xs text-slate-400 shrink-0 tabular-nums">${this.preguntaIdx + 1} / ${this.preguntas.length}</span>
          <div class="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              style="width:${pct}%;background:linear-gradient(90deg,#14b8a6,#6366f1)"></div>
          </div>
          <div id="timer-num" class="shrink-0 text-lg font-black tabular-nums w-8 text-right"
            style="color:#6366f1">${this.tiempoSeg}</div>
        </div>

        <!-- Barra de tiempo -->
        <div class="timer-bar-track mb-6">
          <div id="timer-fill" class="timer-bar-fill" style="width:100%"></div>
        </div>

        <!-- Pregunta -->
        <div class="card mb-5" style="border-top:4px solid #6366f1;">
          <p class="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">
            Pregunta ${this.preguntaIdx + 1}
          </p>
          <p class="text-xl sm:text-2xl font-bold text-slate-900 leading-snug" style="text-wrap:balance">
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
          <span class="text-xs text-slate-400 ml-1 self-center">para responder</span>
        </div>
      </div>
    `

    this.iniciarTimer()
    this.escucharRespuesta()
  }

  // ─── TIMER ────────────────────────────────────────────────────────────────────

  private iniciarTimer(): void {
    this.detenerTimer()
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
        this.quitarKeyHandler()
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

  private quitarKeyHandler(): void {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler)
      this.keyHandler = null
    }
  }

  // ─── RESPUESTA ────────────────────────────────────────────────────────────────

  private escucharRespuesta(): void {
    this.quitarKeyHandler()
    this.keyHandler = (e: KeyboardEvent) => {
      if (this.respondido) return
      const mapa: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, '1': 0, '2': 1, '3': 2, '4': 3 }
      const idx = mapa[e.key.toLowerCase()]
      if (idx !== undefined) {
        this.quitarKeyHandler()
        this.procesar(idx)
      }
    }
    document.addEventListener('keydown', this.keyHandler)
    document.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        if (this.respondido) return
        const idx = parseInt((btn as HTMLElement).dataset.idx ?? '0')
        this.quitarKeyHandler()
        this.procesar(idx)
      })
    })
  }

  private procesar(idx: number): void {
    if (this.respondido) return
    this.respondido = true
    this.detenerTimer()
    const p = this.preguntas[this.preguntaIdx]
    if (idx === p.indiceCorrecta) {
      this.combo++; this.correctas++
      const pts = Math.round((100 + this.tiempoSeg * 5) * this.multiplicador())
      this.puntuacion += pts
      this.mostrarFeedback(idx, true, pts)
    } else {
      this.vidas--; this.combo = 0
      this.mostrarFeedback(idx, false)
    }
  }

  private mostrarFeedback(idx: number, acierto: boolean, pts?: number): void {
    const p     = this.preguntas[this.preguntaIdx]
    const btns  = document.querySelectorAll<HTMLButtonElement>('.quiz-option')
    const tiempoAgotado = idx === -1
    btns.forEach((btn, i) => {
      btn.disabled = true
      if (i === p.indiceCorrecta)               btn.classList.add('quiz-option-correct')
      else if (i === idx && !tiempoAgotado)     btn.classList.add('quiz-option-wrong')
    })
    if (acierto && pts) {
      // Actualizar score en HUD sin esperar al re-render de la siguiente pregunta
      const scoreEl = document.getElementById('score-num')
      if (scoreEl) scoreEl.textContent = this.puntuacion.toLocaleString()
      const el = document.createElement('div')
      el.style.cssText = `position:fixed;top:40%;left:50%;transform:translateX(-50%);
        font-size:2.5rem;font-weight:900;color:#059669;pointer-events:none;z-index:9999;
        animation:floatUp 0.9s ease-out forwards;`
      el.textContent = `+${pts}`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 1000)
    }
    if (tiempoAgotado) {
      const fill = document.getElementById('timer-fill')
      if (fill) { fill.style.background = '#f43f5e'; fill.style.width = '0%' }
    }
    setTimeout(() => {
      this.preguntaIdx++
      if (this.vidas <= 0 || this.preguntaIdx >= this.preguntas.length) this.pantallaResultados()
      else this.mostrarPregunta()
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
    this.detenerTimer()
    this.quitarKeyHandler()
    const total      = this.preguntas.length
    const pct        = total > 0 ? Math.round((this.correctas / total) * 100) : 0
    const grado      = this.grado(pct)
    const esRecord   = this.guardarRecord()
    const gradoColor = GRADOS[grado] ?? '#6366f1'

    this.onCompleto?.({
      puntuacion: this.puntuacion, correctas: this.correctas, total,
      porcentaje: pct, grado, esRecord,
    })

    if (pct >= 70) this.confetti()

    const barColor = pct >= 80
      ? 'linear-gradient(90deg,#10b981,#059669)'
      : pct >= 60 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                  : 'linear-gradient(90deg,#f43f5e,#e11d48)'

    this.container.innerHTML = `
      <div class="max-w-md mx-auto text-center py-6 animate-bounce-in">
        <div class="mb-4">
          <div class="text-8xl font-black animate-bounce-in" style="color:${gradoColor};line-height:1.1">${grado}</div>
          ${esRecord ? `
            <div class="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold
              bg-amber-100 text-amber-700 border border-amber-300">
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25
                  L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              NUEVO RÉCORD
            </div>
          ` : ''}
        </div>
        <div class="card-featured mb-5 py-6">
          <p class="text-4xl font-black text-indigo-600 tabular-nums">${this.puntuacion.toLocaleString()}</p>
          <p class="text-sm text-slate-500 mt-1">puntos obtenidos</p>
          ${this.recordGuardado() > 0 && !esRecord ? `
            <p class="text-xs text-slate-400 mt-1">Récord: ${this.recordGuardado().toLocaleString()} pts</p>
          ` : ''}
        </div>
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="card stat-card stat-card-emerald py-5">
            <p class="text-2xl font-bold text-emerald-600">${this.correctas}</p>
            <p class="text-xs text-slate-500 mt-1">Correctas</p>
          </div>
          <div class="card stat-card stat-card-rose py-5">
            <p class="text-2xl font-bold text-rose-600">${total - this.correctas}</p>
            <p class="text-xs text-slate-500 mt-1">Incorrectas</p>
          </div>
          <div class="card stat-card stat-card-indigo py-5">
            <p class="text-2xl font-bold text-indigo-600">${pct}%</p>
            <p class="text-xs text-slate-500 mt-1">Precisión</p>
          </div>
        </div>
        <div class="progress mb-6">
          <div class="h-full rounded-full transition-all duration-1000" style="width:${pct}%;background:${barColor}"></div>
        </div>
        <p class="text-sm text-slate-500 mb-6">${this.mensajeMotivacion(pct)}</p>
        <div class="flex flex-col gap-2.5">
          <button id="btn-reintentar" class="btn-violet w-full py-3">Jugar de nuevo con nuevas preguntas</button>
          <button id="btn-volver-juego" class="btn-secondary w-full">Volver al inicio</button>
        </div>
      </div>
    `
    document.getElementById('btn-reintentar')?.addEventListener('click', () => this.iniciar())
    document.getElementById('btn-volver-juego')?.addEventListener('click', () => this.onVolver?.())
  }

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
    const prev  = parseInt(localStorage.getItem(key) ?? '0')
    if (this.puntuacion > prev) {
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
      el.style.cssText = `position:fixed;width:${size}px;height:${size}px;
        background:${colores[Math.floor(Math.random() * colores.length)]};
        left:${Math.random() * 100}vw;top:-12px;
        border-radius:${Math.random() > 0.4 ? '50%' : '2px'};
        z-index:9999;pointer-events:none;
        opacity:${0.7 + Math.random() * 0.3};
        animation:confettiFall ${1.8 + Math.random() * 1.8}s ease-in ${Math.random() * 0.8}s forwards;`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 4000)
    }
  }

  private esc(t: string): string {
    const d = document.createElement('div'); d.textContent = t; return d.innerHTML
  }
}

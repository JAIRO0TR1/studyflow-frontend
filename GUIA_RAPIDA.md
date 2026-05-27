# 📖 StudyFlow Frontend - Referencia Rápida

## 🚀 Inicio Rápido

```bash
# Instalar
npm install

# Desarrollo
npm run dev

# Build
npm run build

# TypeScript check
npm run lint
```

---

## 📊 Estructura Básica

```
src/
├── models/          → Interfaces TypeScript
├── api/             → Cliente HTTP + servicios
├── controllers/     → Lógica de negocio
├── views/           → Componentes UI
├── router/          → Navegación SPA
├── styles/          → CSS + Tailwind
├── main.ts          → Punto de entrada
└── utils.ts         → Funciones helper
```

---

## 🎯 Usar Controladores

```typescript
import { mazoController } from '@/controllers/MazoController'

// Cargar mazos
const mazos = await mazoController.cargarMazos()

// Crear mazo
const nuevoMazo = await mazoController.crearMazo({
  nombre: 'Mi Mazo',
  descripcion: 'Descripción',
  algoritmo: 'SM2'
})

// Iniciar sesión
import { sesionController } from '@/controllers/SesionController'
await sesionController.iniciarSesion({ mazoId: '123' })

// Registrar respuesta
const resultado = await sesionController.registrarRespuesta(
  'tarjetaId',
  'BIEN'
)
```

---

## 🎨 Crear una Vista

```typescript
import type { Mazo } from '@/models'

export class MiView {
  private container: HTMLElement

  constructor(containerId: string) {
    const element = document.getElementById(containerId)
    if (!element) throw new Error('Container not found')
    this.container = element
  }

  renderizar(datos: Mazo[]): void {
    this.container.innerHTML = `
      <div class="card">
        ${datos.map(d => `<p>${d.nombre}</p>`).join('')}
      </div>
    `
    this.attachEventListeners()
  }

  private attachEventListeners(): void {
    // Event delegation
  }
}
```

---

## 🌐 Llamadas API

```typescript
import { mazoApi } from '@/api'

// GET
const mazos = await mazoApi.obtenerTodos()

// POST
const nuevoMazo = await mazoApi.crear({ nombre: 'Mi Mazo' })

// PUT
const mazoActualizado = await mazoApi.actualizar(id, datos)

// DELETE
await mazoApi.eliminar(id)
```

---

## 🛣️ Navegar

```typescript
import { router } from '@/router/router'

// Navegar a una ruta
router.navegar('inicio')    // 'inicio', 'sesion', 'dashboard', 'gemini'

// Obtener ruta actual
const ruta = router.obtenerRutaActual()

// Registrar callback para una ruta
router.enRuta('sesion', () => {
  console.log('Navegó a sesión')
})
```

---

## 🎨 Tailwind CSS

```html
<!-- Botones -->
<button class="btn-primary">Primario</button>
<button class="btn-secondary">Secundario</button>
<button class="btn-danger">Peligro</button>

<!-- Cards -->
<div class="card">Contenido</div>

<!-- Inputs -->
<input class="input" type="text" />
<label class="label">Etiqueta</label>

<!-- Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <!-- Items -->
</div>

<!-- Colores -->
<div class="text-primary-600">Primary</div>
<div class="bg-success-100">Success</div>
<div class="border-danger-300">Danger</div>
```

---

## 🔧 Variables de Entorno

```bash
# .env.local
VITE_API_URL=http://localhost:8080/api
```

```typescript
// En el código
const apiUrl = import.meta.env.VITE_API_URL
```

---

## 🐛 Debugging

```typescript
// Logs en controladores
console.log('[MazoController] Cargando mazos...')

// Logs en API
console.error('[HttpClient] Error en /endpoint:', error)

// Ver sesión actual
import { sesionController } from '@/controllers/SesionController'
console.log(sesionController.obtenerSesionActiva())
```

---

## 📱 Responsive Breakpoints

```
sm: 640px   → grid-cols-1 sm:grid-cols-2
md: 768px   → md:grid-cols-2
lg: 1024px  → lg:grid-cols-3
xl: 1280px  → xl:grid-cols-4
```

---

## 🎯 Flujo Típico

1. Usuario hace click → evento en vista
2. Vista llama controlador → `mazoController.crearMazo(datos)`
3. Controlador llama API → `mazoApi.crear(datos)`
4. API hace fetch → `POST /api/mazos`
5. Backend responde → JSON
6. API retorna tipado → `Promise<Mazo>`
7. Controlador procesa → transforma si necesario
8. Vista recibe datos → renderiza

---

## 🔐 Autenticación

```typescript
// Guardar token
localStorage.setItem('authToken', token)

// HttpClient lo añade automáticamente
// Authorization: Bearer {token}

// Limpiar token
localStorage.removeItem('authToken')
```

---

## 📦 Tipos Comunes

```typescript
// Mazo
interface Mazo {
  id: string
  nombre: string
  tarjetas: Tarjeta[]
  total_tarjetas: number
}

// Tarjeta
interface Tarjeta {
  id: string
  frente: string
  reverso: string
  tipo: 'TEXTO' | 'CODIGO'
}

// Sesión
interface SesionActiva {
  sesionId: string
  tarjetaActual: Tarjeta
  totalTarjetas: number
}
```

---

## ⌨️ Atajos Útiles

```typescript
// Generar ID
import { generarId } from '@/utils'
const id = generarId()

// Formatear fecha
import { formatearFecha } from '@/utils'
console.log(formatearFecha(new Date()))

// Truncar texto
import { truncarTexto } from '@/utils'
const texto = truncarTexto('texto largo', 50)

// Validar email
import { validarEmail } from '@/utils'
if (validarEmail(email)) { ... }

// Delay
import { delay } from '@/utils'
await delay(1000)
```

---

## 🚨 Manejo de Errores

```typescript
try {
  const resultado = await mazoController.crearMazo(datos)
  // Éxito
} catch (error) {
  console.error(error)
  // Mostrar mensaje al usuario
  alert('Error al crear mazo')
}
```

---

## 📊 Modelo de Datos

```
Usuario
  └─ Mazo (1..*)
      ├─ Tarjeta (1..*)
      │   ├─ frente: string
      │   ├─ reverso: string
      │   └─ etiquetas: string[]
      └─ Sesion (1..*)
          └─ RegistroRespuesta (1..*)
              ├─ tarjeta
              ├─ calificación
              └─ timestamp
```

---

## 🎯 Próximas Mejoras

```typescript
// TODO: Agregar formularios de creación
// TODO: Edición inline de tarjetas
// TODO: Buscar y filtrar mazos
// TODO: Guardar borradores locales
// TODO: Notificaciones push
// TODO: Offline support con IndexedDB
// TODO: Tests unitarios con Vitest
```

---

## 📞 Contacto/Soporte

- Revisar comentarios en código
- Leer PROYECTO_FRONTEND_RESUMEN.md
- Leer README_FRONTEND.md
- Check ENTREGA_FINAL.md

---

**¡Listo para desarrollar!** 🚀

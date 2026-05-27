# 📚 STUDYFLOW
## Sistema de Estudio con Tarjetas Inteligentes
### Informe de Proyecto de Grado — Patrones de Software · 2026

---

# 1. Descripción General del Proyecto

StudyFlow es una aplicación web full-stack que permite a los estudiantes crear, organizar y repasar tarjetas de estudio digitales. El sistema aplica un algoritmo de repetición espaciada (SM-2) que prioriza automáticamente las tarjetas que más se le olvidan al usuario. Adicionalmente, integra inteligencia artificial mediante la API de Gemini para analizar el contenido de cada mazo, detectar vacíos temáticos y generar automáticamente las tarjetas faltantes, sin intervención manual del estudiante.

El frontend está desarrollado en **TypeScript con Tailwind CSS** y se despliega en **Vercel**. El backend está construido con **Spring Boot + Maven** (Java 17) y expone una **REST API** que consume tanto el frontend como la API de Gemini. La arquitectura global sigue el patrón **MVC (Modelo-Vista-Controlador)** de forma estricta en ambas capas.

## 1.1 Problema que Resuelve

Los estudiantes dedican tiempo repasando contenido que ya dominan y descuidan temas donde tienen debilidades reales. Peor aún, muchas veces ni siquiera saben qué temas les faltan cubrir en un mazo. StudyFlow resuelve ambos problemas: el algoritmo SM-2 optimiza el orden de repaso según el rendimiento histórico, y la IA de Gemini detecta y completa los vacíos temáticos de forma automática.

## 1.2 Público Objetivo

- Estudiantes universitarios con múltiples materias y poco tiempo.
- Personas preparando exámenes de certificación o idiomas.
- Docentes que deseen crear materiales de repaso interactivos y completos.

---

# 2. Funcionalidades Principales

## 2.1 Gestión de Mazos

El usuario crea mazos temáticos (ej: "Parcial de Patrones", "Vocabulario Inglés B2"). Cada mazo se puede editar, duplicar, exportar o eliminar de forma independiente.

## 2.2 Creación de Tarjetas

Cada tarjeta tiene un frente (pregunta o concepto) y un reverso (respuesta o definición). Las tarjetas admiten texto enriquecido, fragmentos de código y etiquetas para búsqueda y filtrado.

## 2.3 Modo de Estudio con Volteo

Durante una sesión, la tarjeta aparece mostrando solo el frente. El estudiante intenta recordar la respuesta y luego la voltea para verificar. Se autocalifica con: **Fácil**, **Bien**, **Difícil** o **No la supe**. Esta calificación alimenta el algoritmo de repetición espaciada.

## 2.4 Algoritmo de Repetición Espaciada (SM-2)

Inspirado en el algoritmo SM-2 (base de Anki y Duolingo), el sistema calcula el intervalo óptimo de reaparición de cada tarjeta según el historial de respuestas. Tarjetas fáciles reaparecen con intervalos crecientes (1 → 3 → 7 → 14 días); tarjetas difíciles reaparecen al día siguiente.

## 2.5 Análisis e Inteligencia Artificial (Gemini)

Esta es la funcionalidad diferenciadora del sistema. El usuario puede solicitar un análisis inteligente de cualquier mazo con un clic. El backend envía el contenido completo del mazo a la API de Gemini, que:

1. **Analiza** los conceptos cubiertos por las tarjetas existentes.
2. **Detecta** temas relacionados que no están cubiertos en el mazo.
3. **Genera** un conjunto de tarjetas nuevas (frente + reverso) para cubrir esos vacíos temáticos.
4. **Retorna** las tarjetas sugeridas al frontend para que el usuario las revise y apruebe antes de añadirlas al mazo.

La IA no actúa como chatbot en ningún momento. Su rol es exclusivamente funcional: completar el conocimiento del mazo de forma automática.

## 2.6 Panel de Progreso y Estadísticas

Un dashboard visual muestra: tarjetas dominadas, tarjetas pendientes para hoy, racha de días consecutivos estudiados, porcentaje de aciertos por mazo y gráfica de actividad de los últimos 30 días.

## 2.7 Exportación e Importación

Los mazos se exportan en formato JSON para respaldo o compartir con compañeros. La importación parsea el archivo, recrea las tarjetas y las registra en el repositorio.

---

# 3. Arquitectura del Sistema

## 3.1 Arquitectura General MVC Full-Stack

StudyFlow aplica el patrón **MVC de forma estricta en ambas capas**:

| Capa MVC | Responsabilidad | Tecnología |
|---|---|---|
| **Modelo** | Entidades de dominio, repositorios JPA, lógica de negocio | Spring Boot, JPA/Hibernate, PostgreSQL |
| **Vista** | Interfaz de usuario, componentes TypeScript, renderizado | TypeScript, Tailwind CSS, Vite, Vercel |
| **Controlador** | Recibe peticiones HTTP, delega a servicios, retorna respuestas JSON | Spring MVC `@RestController` |

El frontend es una **SPA (Single Page Application)** que se comunica con el backend exclusivamente mediante **REST API (JSON)**. El backend no genera ninguna vista HTML; su única responsabilidad es exponer endpoints y coordinar la lógica de negocio.

```
┌─────────────────────────────────────┐     REST/JSON     ┌──────────────────────────────────────┐
│         FRONTEND (Vercel)           │ ◄────────────────► │         BACKEND (Spring Boot)        │
│                                     │                    │                                      │
│  Vista: Componentes TypeScript/     │                    │  Controlador: @RestController        │
│         Tailwind CSS                │                    │  Modelo: Entidades JPA + Servicios   │
│                                     │                    │  Repositorio: Spring Data JPA        │
└─────────────────────────────────────┘                    └──────────────┬───────────────────────┘
                                                                          │
                                                                          │ HTTPS
                                                                          ▼
                                                              ┌───────────────────────┐
                                                              │   Gemini API (Google) │
                                                              │   Análisis + Generación│
                                                              │   de tarjetas faltantes│
                                                              └───────────────────────┘
```

## 3.2 Capas del Backend (Spring Boot)

| Capa | Responsabilidad | Clases / Componentes Clave |
|---|---|---|
| **Controller** | Recibe peticiones HTTP REST, valida entrada, delega a Service | `MazoController`, `TarjetaController`, `SesionController`, `GeminiController` |
| **Service** | Lógica de negocio: gestionar sesiones, calcular intervalos SM-2, orquestar llamadas a Gemini | `MazoService`, `SesionService`, `ProgresoService`, `GeminiService` |
| **Model / Domain** | Entidades JPA: Mazo, Tarjeta, Sesion, RegistroRespuesta, Usuario | `Mazo`, `Tarjeta`, `Sesion`, `RegistroRespuesta` |
| **Repository** | Acceso a datos mediante Spring Data JPA | `MazoRepository`, `TarjetaRepository`, `SesionRepository` |
| **Patterns** | Fábricas, estrategias, comandos y decoradores que dan flexibilidad al dominio | `TarjetaFactory`, `AlgoritmoStrategy`, `CommandManager`, `GeminiAnalysisFacade` |
| **Infrastructure** | Configuración de base de datos, cliente HTTP para Gemini, serialización JSON | `GeminiHttpClient`, `AppConfig`, `CorsConfig` |

## 3.3 Estructura de Paquetes Backend

```
co.studyflow/
├── controller/
│   ├── MazoController.java          → CRUD de mazos
│   ├── TarjetaController.java       → CRUD de tarjetas
│   ├── SesionController.java        → Gestión de sesiones de estudio
│   └── GeminiController.java        → Endpoint para análisis IA del mazo
│
├── service/
│   ├── MazoService.java
│   ├── TarjetaService.java
│   ├── SesionService.java
│   ├── ProgresoService.java
│   └── GeminiService.java           → Orquesta llamada a API Gemini + parseo de respuesta
│
├── model/
│   ├── Mazo.java
│   ├── Tarjeta.java                 → Clase base (Factory Method)
│   ├── TarjetaTexto.java
│   ├── TarjetaCodigo.java
│   ├── Sesion.java
│   └── RegistroRespuesta.java
│
├── repository/
│   ├── MazoRepository.java
│   ├── TarjetaRepository.java
│   └── SesionRepository.java
│
├── patterns/
│   ├── factory/
│   │   ├── TarjetaFactory.java      → Factory Method
│   │   └── ExportadorFactory.java   → Abstract Factory
│   ├── strategy/
│   │   ├── AlgoritmoRepeticion.java → Interface Strategy
│   │   ├── SM2Strategy.java
│   │   └── LeitnerStrategy.java
│   ├── command/
│   │   ├── Command.java             → Interface Command
│   │   ├── CrearTarjetaCommand.java
│   │   ├── EditarTarjetaCommand.java
│   │   └── CommandManager.java      → Undo/Redo stack
│   ├── observer/
│   │   ├── ProgresoObserver.java
│   │   └── RachaObserver.java
│   ├── decorator/
│   │   ├── TarjetaDecorator.java
│   │   └── ConCodigoDecorator.java
│   ├── builder/
│   │   └── MazoBuilder.java
│   ├── composite/
│   │   └── ColeccionMazos.java
│   └── facade/
│       └── GeminiAnalysisFacade.java → Facade que oculta complejidad de integración Gemini
│
└── infrastructure/
    ├── GeminiHttpClient.java        → Cliente HTTP para API de Gemini
    ├── JsonExportador.java
    ├── CSVExportador.java
    └── config/
        ├── AppConfig.java
        └── CorsConfig.java
```

## 3.4 Estructura del Frontend (TypeScript + Tailwind)

```
studyflow-frontend/
├── src/
│   ├── models/                      → Interfaces TypeScript (Modelo en MVC frontend)
│   │   ├── Mazo.ts
│   │   ├── Tarjeta.ts
│   │   ├── Sesion.ts
│   │   └── Progreso.ts
│   │
│   ├── controllers/                 → Lógica de negocio del cliente (Controlador en MVC frontend)
│   │   ├── MazoController.ts        → Llama a la API REST, transforma datos
│   │   ├── SesionController.ts
│   │   ├── ProgresoController.ts
│   │   └── GeminiController.ts      → Solicita análisis IA, maneja respuesta
│   │
│   ├── views/                       → Componentes de UI (Vista en MVC frontend)
│   │   ├── MazoView.ts              → Renderiza lista de mazos
│   │   ├── TarjetaView.ts           → Renderiza tarjeta con animación de volteo
│   │   ├── SesionView.ts            → Pantalla de sesión de estudio
│   │   ├── DashboardView.ts         → Panel de estadísticas
│   │   └── GeminiView.ts            → Panel de revisión de tarjetas generadas por IA
│   │
│   ├── api/                         → Capa de comunicación con el backend REST
│   │   ├── mazoApi.ts
│   │   ├── tarjetaApi.ts
│   │   ├── sesionApi.ts
│   │   └── geminiApi.ts
│   │
│   ├── router/
│   │   └── router.ts                → Enrutamiento SPA
│   │
│   └── main.ts                      → Punto de entrada
│
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── vercel.json
```

---

# 4. Patrones de Diseño Aplicados

| Patrón | Tipo | Capa | Dónde se aplica | Por qué se usa |
|---|---|---|---|---|
| **Factory Method** | Creacional | Backend | `TarjetaFactory` | Crea distintos tipos de tarjeta (TarjetaTexto, TarjetaCodigo) sin que el cliente conozca las clases concretas. |
| **Abstract Factory** | Creacional | Backend | `ExportadorFactory` | Genera familias de exportadores compatibles: `JsonExportador`, `CSVExportador`. Permite agregar nuevos formatos sin modificar el cliente. |
| **Builder** | Creacional | Backend | `MazoBuilder` | Construye mazos con atributos opcionales (nombre, descripción, etiquetas, algoritmo) de forma legible y segura. |
| **Singleton** | Creacional | Backend | `CommandManager` | El gestor de comandos Undo/Redo existe como única instancia por sesión de usuario para mantener el historial consistente. |
| **Composite** | Estructural | Backend | `ColeccionMazos` | Permite tratar un mazo individual y una colección de mazos de forma uniforme al iterar, exportar o analizar con IA. |
| **Decorator** | Estructural | Backend | `TarjetaDecorator` | Añade funcionalidades a tarjetas en tiempo de ejecución (con código, con pista) sin modificar la clase base `Tarjeta`. |
| **Facade** | Estructural | Backend | `GeminiAnalysisFacade` | Oculta la complejidad de la integración con Gemini: construcción del prompt, llamada HTTP, parseo de respuesta y mapeo a objetos `Tarjeta`. El servicio solo llama un método `analizarYCompletar(mazo)`. |
| **Observer** | Comportamiento | Backend | `ProgresoObserver`, `RachaObserver` | Cuando el usuario responde una tarjeta, el panel de estadísticas y la racha se actualizan automáticamente sin acoplamiento directo. |
| **Strategy** | Comportamiento | Backend | `AlgoritmoRepeticion` | Permite intercambiar el algoritmo de repaso (SM-2, Leitner, Aleatorio) en tiempo de ejecución sin modificar `SesionService`. |
| **Command** | Comportamiento | Backend | `CrearTarjetaCommand`, `EditarTarjetaCommand` | Cada acción del editor es un Command con soporte completo de Undo/Redo mediante un stack en `CommandManager`. |
| **Template Method** | Comportamiento | Backend | `SesionEstudio` | Define el esqueleto de una sesión (cargar tarjetas → mostrar → evaluar → guardar). Las subclases varían pasos específicos según el tipo de sesión. |
| **MVC** | Arquitectural | Full-Stack | Toda la aplicación | Separa responsabilidades de forma estricta: Modelo (datos + lógica), Vista (UI TypeScript), Controlador (REST endpoints + controllers TS). |

---

# 5. Integración de Inteligencia Artificial con Gemini

## 5.1 Diseño de la Integración

La integración de Gemini no es un chatbot. Es una funcionalidad acotada y determinista que se activa cuando el usuario solicita "Completar mazo con IA". El flujo es el siguiente:

```
Usuario hace clic en "Analizar Mazo"
        │
        ▼
GeminiController (REST) recibe POST /api/mazos/{id}/analizar
        │
        ▼
GeminiService extrae el contenido del mazo (temas cubiertos)
        │
        ▼
GeminiAnalysisFacade construye el prompt estructurado
        │
        ▼
GeminiHttpClient envía petición a la API de Gemini (gemini-pro)
        │
        ▼
Gemini devuelve JSON con tarjetas sugeridas {frente, reverso}[]
        │
        ▼
GeminiAnalysisFacade parsea la respuesta y mapea a objetos Tarjeta
        │
        ▼
Frontend recibe las tarjetas y las muestra en GeminiView para revisión
        │
        ▼
Usuario aprueba o descarta cada tarjeta individualmente
        │
        ▼
Las tarjetas aprobadas se añaden al mazo vía POST /api/tarjetas
```

## 5.2 Diseño del Prompt

El prompt enviado a Gemini es estructurado y determinista. No es una conversación abierta:

```
Eres un asistente académico especializado en identificar vacíos temáticos.

Dado el siguiente mazo de estudio con el tema "{nombreMazo}":

TARJETAS EXISTENTES:
{lista de frentes y reversos de todas las tarjetas}

Tu tarea:
1. Identificar qué conceptos importantes del tema "{nombreMazo}" NO están cubiertos.
2. Generar exactamente {N} tarjetas nuevas para cubrir esos vacíos.
3. Responder ÚNICAMENTE con un array JSON válido con el siguiente formato:
[
  { "frente": "pregunta o concepto", "reverso": "respuesta o definición" }
]
Sin texto adicional. Sin explicaciones. Solo el JSON.
```

## 5.3 Patrones Aplicados en la Integración IA

- **Facade (`GeminiAnalysisFacade`):** Oculta toda la complejidad de la integración. El servicio llama un solo método y recibe objetos `Tarjeta` listos para usar.
- **Strategy (`AlgoritmoRepeticion`):** Las tarjetas generadas por Gemini pasan por el mismo algoritmo SM-2 que las manuales. La IA no tiene trato especial en el dominio.
- **Command (`CrearTarjetaCommand`):** Aprobar una tarjeta generada por IA crea un `CrearTarjetaCommand`, lo que permite deshacerlo si el usuario se arrepiente.

---

# 6. Endpoints REST API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/mazos` | Listar todos los mazos del usuario |
| `POST` | `/api/mazos` | Crear nuevo mazo |
| `GET` | `/api/mazos/{id}` | Obtener mazo con sus tarjetas |
| `PUT` | `/api/mazos/{id}` | Editar mazo |
| `DELETE` | `/api/mazos/{id}` | Eliminar mazo |
| `POST` | `/api/mazos/{id}/exportar` | Exportar mazo en JSON o CSV |
| **`POST`** | **`/api/mazos/{id}/analizar`** | **Enviar mazo a Gemini y recibir tarjetas sugeridas** |
| `GET` | `/api/tarjetas/{mazoId}` | Listar tarjetas de un mazo |
| `POST` | `/api/tarjetas` | Crear nueva tarjeta |
| `PUT` | `/api/tarjetas/{id}` | Editar tarjeta |
| `DELETE` | `/api/tarjetas/{id}` | Eliminar tarjeta |
| `POST` | `/api/sesiones/iniciar` | Iniciar sesión de estudio para un mazo |
| `POST` | `/api/sesiones/{id}/responder` | Registrar respuesta a una tarjeta |
| `GET` | `/api/progreso/{mazoId}` | Obtener estadísticas del mazo |

---

# 7. Casos de Uso Principales

## CU-01: Crear un nuevo mazo de estudio

**Precondición:** El usuario tiene la aplicación abierta.  
**Flujo principal:** El estudiante hace clic en "Nuevo Mazo", ingresa nombre y descripción. El frontend envía `POST /api/mazos`. El backend usa `MazoBuilder` para construir el mazo y lo persiste. El Observer notifica al Dashboard para actualizar el conteo de mazos.  
**Flujo alternativo:** Si el nombre ya existe, el backend retorna `409 Conflict` y el frontend muestra un mensaje de error sin cerrar el formulario.

## CU-02: Agregar tarjetas al mazo

**Precondición:** Existe al menos un mazo creado.  
**Flujo principal:** El usuario selecciona un mazo y hace clic en "Agregar Tarjeta". Escribe frente y reverso. Si agrega código, `TarjetaDecorator` aplica el decorador correspondiente. Cada acción de agregar encola un `CrearTarjetaCommand` en `CommandManager`, habilitando Undo.  
**Flujo alternativo:** El usuario deshace la acción. `CommandManager` revierte el último comando y la tarjeta desaparece de la vista.

## CU-03: Iniciar una sesión de estudio

**Precondición:** El mazo tiene al menos una tarjeta con fecha de repaso vencida o nueva.  
**Flujo principal:** El usuario presiona "Estudiar Ahora". `SesionService` consulta `SM2Strategy` para determinar qué tarjetas corresponden hoy. Las tarjetas se presentan de a una. El estudiante se autocalifica. Al finalizar, `ProgresoService` actualiza el historial y los Observers notifican al Dashboard.  
**Flujo alternativo:** Si no hay tarjetas pendientes para hoy, el sistema muestra "Ya estudiaste todo por hoy" con la fecha de la próxima sesión.

## CU-04: Analizar mazo con Inteligencia Artificial

**Precondición:** El mazo tiene al menos 3 tarjetas para que Gemini tenga contexto suficiente.  
**Flujo principal:** El usuario hace clic en "Completar con IA". El frontend llama `POST /api/mazos/{id}/analizar`. `GeminiAnalysisFacade` construye el prompt con el contenido del mazo, llama a la API de Gemini y parsea la respuesta. El frontend muestra las tarjetas sugeridas en `GeminiView`. El usuario revisa cada una y aprueba o descarta individualmente. Las aprobadas se añaden al mazo como `CrearTarjetaCommand`.  
**Flujo alternativo:** Si la API de Gemini no responde o retorna un formato inválido, el backend lanza una excepción controlada y el frontend muestra "No fue posible analizar el mazo en este momento. Intenta de nuevo."

## CU-05: Ver estadísticas de progreso

**Precondición:** El usuario ha completado al menos una sesión de estudio.  
**Flujo principal:** El usuario accede al Dashboard. El frontend llama `GET /api/progreso/{mazoId}`. Se visualiza: racha actual, porcentaje de tarjetas dominadas, gráfica de actividad de los últimos 30 días y estimado de días para dominar el mazo.  
**Flujo alternativo:** Sin sesiones previas, el Dashboard muestra un estado vacío con el mensaje "Completa tu primera sesión para ver tu progreso".

## CU-06: Exportar e importar mazos

**Precondición:** Existe al menos un mazo con tarjetas.  
**Flujo principal:** El usuario selecciona un mazo y elige "Exportar". `ExportadorFactory` instancia el exportador según el formato elegido (JSON o CSV) y el archivo se descarga desde el navegador. Para importar, el usuario carga el archivo y el sistema parsea el contenido, recrea las tarjetas con `TarjetaFactory` y las registra.  
**Flujo alternativo:** Si el archivo importado tiene un formato inválido, el backend retorna `400 Bad Request` con detalle del error.

---

# 8. Tecnologías y Herramientas

## Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Java | 17 LTS | Lenguaje principal. Toda la lógica de negocio, patrones de diseño y servicios. |
| Spring Boot | 3.x | Framework MVC. `@RestController`, `@Service`, `@Repository`, configuración automática. |
| Spring Data JPA | 3.x | Repositorios de acceso a datos. Consultas con derivación de nombre y JPQL. |
| Maven | 3.8+ | Gestión de dependencias y ciclo de vida del proyecto. |
| PostgreSQL | 15+ | Base de datos relacional para persistir mazos, tarjetas y historial de sesiones. |
| Gson / Jackson | Última | Serialización/deserialización JSON para la REST API y para parsear respuestas de Gemini. |
| JUnit 5 | 5.9+ | Pruebas unitarias de servicios, factories, strategies y la lógica de integración con Gemini. |
| Gemini API (Google) | gemini-pro | Análisis de mazos y generación de tarjetas faltantes mediante prompts estructurados. |

## Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| TypeScript | 5.x | Lenguaje principal del frontend. Tipado estricto de modelos, controladores y vistas. |
| Tailwind CSS | 3.x | Utilidades de estilo. Diseño responsivo y consistente sin CSS personalizado. |
| Vite | 5.x | Bundler y servidor de desarrollo. Compilación rápida del proyecto TypeScript. |
| Vercel | — | Deploy automático del frontend en cada push a `main`. |
| Fetch API | — | Comunicación HTTP con el backend REST. Nativa del navegador, sin dependencias extra. |

---

# 9. Cronograma de Desarrollo

| Semana | Fase | Entregables |
|---|---|---|
| 1 – 2 | Análisis y Diseño | Diagrama de clases, diagrama de casos de uso, definición y justificación de los 12 patrones. Diseño de la REST API (contratos de endpoints). |
| 3 – 4 | Dominio y Patrones Creacionales | Entidades JPA: `Mazo`, `Tarjeta`, `Sesion`. Implementación de `Factory Method`, `Abstract Factory`, `Builder`. Configuración de Spring Boot + PostgreSQL. |
| 5 – 6 | Patrones Estructurales | `Composite` para colecciones de mazos. `Decorator` para tipos de tarjeta enriquecidos. `Facade` para la integración con Gemini (`GeminiAnalysisFacade`). |
| 7 – 8 | Patrones de Comportamiento | `Strategy` (SM-2 y Leitner). `Command` con Undo/Redo. `Observer` para actualización del dashboard. `Template Method` para el flujo de sesión. |
| 9 | Integración Gemini | `GeminiHttpClient`, diseño del prompt, parseo de respuesta JSON, endpoint `POST /analizar`, pruebas de integración IA. |
| 10 – 11 | Frontend TypeScript + Tailwind | Vistas MVC del cliente: `MazoView`, `SesionView`, `DashboardView`, `GeminiView`. Controladores TypeScript. Conexión con la REST API. |
| 12 | Pruebas | JUnit 5 para servicios y factories. Pruebas de integración de la REST API. Pruebas del flujo de análisis IA. Corrección de errores. |
| 13 | Documentación y Entrega | Javadoc completo, documentación de la API REST, manual de usuario, diagrama de clases final y preparación de la presentación. |

---

# 10. Justificación de los Patrones

Cada patrón en StudyFlow resuelve un problema concreto del sistema. No hay aplicación forzada.

**Factory Method** — Las tarjetas pueden ser de distintos tipos (texto, código). Sin este patrón, el código cliente necesitaría condicionales para instanciar cada tipo. Con Factory Method, el cliente solo conoce la interfaz `Tarjeta` y la fábrica decide qué clase concreta crear.

**Abstract Factory** — Se necesitan familias de exportadores donde JSON y CSV producen archivos en formatos completamente distintos. Abstract Factory garantiza que el cliente pueda solicitar un exportador sin acoplarse a ninguna implementación concreta, y permite agregar `ExportadorPDF` en el futuro sin tocar el cliente.

**Builder** — Un mazo tiene múltiples atributos opcionales (descripción, etiquetas, configuración de algoritmo). Sin Builder, el constructor tendría múltiples variantes o muchos parámetros nulos. Builder permite construirlo paso a paso de forma legible.

**Singleton** — `CommandManager` gestiona el historial Undo/Redo de la sesión activa. Si existieran múltiples instancias, el historial se fragmentaría y Undo produciría resultados inconsistentes.

**Composite** — Cuando se exporta o se analiza con IA, el sistema puede recibir un mazo individual o un grupo de mazos. Composite permite tratarlos con la misma interfaz sin preguntar si es uno o muchos.

**Decorator** — Una tarjeta de código necesita syntax highlighting; una con pista necesita un campo extra. En lugar de crear subclases para cada combinación, Decorator añade estas funcionalidades de forma dinámica y composable.

**Facade** — La integración con Gemini involucra: construir el prompt, hacer la llamada HTTP, manejar errores de red, parsear el JSON de respuesta y mapearlo a objetos `Tarjeta`. Sin Facade, `GeminiService` quedaría acoplado a todos estos detalles. `GeminiAnalysisFacade` encapsula toda esta complejidad en un único método `analizarYCompletar(Mazo)`.

**Observer** — Al finalizar una sesión, múltiples componentes deben actualizarse: racha de días, porcentaje de dominio y gráfica de actividad. Sin Observer, `SesionService` tendría que conocer y llamar directamente cada componente. Con Observer, solo lanza un evento y cada componente reacciona de forma independiente.

**Strategy** — El algoritmo SM-2 es intercambiable por Leitner o repaso aleatorio sin modificar `SesionService`. Si aparece un algoritmo mejor, basta con implementar la interfaz `AlgoritmoRepeticion` y conectarlo.

**Command** — Un editor sin Undo genera frustración. Command encapsula cada operación (crear, editar, eliminar tarjeta) como un objeto, habilitando un stack de Undo/Redo limpio. Además, las tarjetas aprobadas de la IA también pasan por Command, haciendo que su adición sea también reversible.

**Template Method** — Una sesión de estudio siempre sigue el mismo esqueleto: cargar tarjetas → mostrar → evaluar → guardar. Pero una sesión de repaso rápido y una sesión completa difieren en cómo se cargan y evalúan las tarjetas. Template Method define el esqueleto en la clase base y deja que las subclases varíen los pasos específicos.

**MVC** — Separa responsabilidades de forma que la UI (TypeScript/Tailwind) puede cambiar completamente sin tocar la lógica de negocio (Spring Boot), y la lógica de negocio puede modificarse sin afectar la UI. El Controller actúa como árbitro que coordina ambas capas mediante contratos REST bien definidos.

---

# 11. Conclusión

StudyFlow es una aplicación web full-stack que resuelve un problema real: estudiar de forma eficiente para parciales y exposiciones. Su arquitectura MVC estricta, separada en un backend Spring Boot y un frontend TypeScript/Tailwind desplegado en Vercel, sirve como vehículo académico ideal para demostrar el dominio de los doce patrones de diseño más importantes, aplicados en un contexto natural y justificado.

La integración de inteligencia artificial mediante Gemini no es un añadido cosmético: es una funcionalidad central que cierra el ciclo del aprendizaje, detectando y completando los vacíos temáticos que el estudiante no sabía que tenía. Esta integración está diseñada con el patrón Facade para mantener el código limpio, y con Command para que incluso las tarjetas generadas por IA sean reversibles.

La combinación de SM-2 (Strategy), Undo/Redo (Command), actualización automática del progreso (Observer), tipos de tarjeta extensibles (Factory + Decorator) y análisis inteligente de contenido (Facade + Gemini) convierte a StudyFlow en un proyecto técnicamente completo, con IA funcional y útil en la vida real de cualquier estudiante.

---
*— Fin del Informe —*

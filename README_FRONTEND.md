# Frontend StudyFlow

Interfaz web de StudyFlow - Sistema de Estudio con Tarjetas Inteligentes y IA.

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Clonar el repositorio
git clone <repo-url>

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Ver preview de la build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── models/              # Interfaces TypeScript
│   ├── Mazo.ts
│   ├── Tarjeta.ts
│   ├── Sesion.ts
│   ├── Progreso.ts
│   ├── Gemini.ts
│   └── Usuario.ts
│
├── controllers/         # Lógica de negocio del cliente
│   ├── MazoController.ts
│   ├── SesionController.ts
│   ├── ProgresoController.ts
│   └── GeminiController.ts
│
├── views/              # Componentes de UI
│   ├── MazoListView.ts
│   ├── TarjetaView.ts
│   ├── SesionView.ts
│   ├── DashboardView.ts
│   └── GeminiView.ts
│
├── api/                # Capa de comunicación REST
│   ├── HttpClient.ts
│   ├── mazoApi.ts
│   ├── tarjetaApi.ts
│   ├── sesionApi.ts
│   ├── progresoApi.ts
│   └── geminiApi.ts
│
├── router/             # Enrutamiento SPA
│   └── router.ts
│
├── styles/             # Estilos globales
│   └── main.css
│
└── main.ts             # Punto de entrada
```

## 🏗️ Arquitectura MVC

El frontend sigue el patrón MVC estricto:

- **Modelos**: Interfaces TypeScript (`models/`)
- **Vistas**: Componentes de UI renderizados con Tailwind CSS (`views/`)
- **Controladores**: Lógica de negocio del cliente que orquesta API calls (`controllers/`)

## 🌐 Variables de Entorno

Copia `.env.example` a `.env.local`:

```bash
VITE_API_URL=http://localhost:8080/api
```

## 📦 Dependencias

- **TypeScript**: Tipado estricto
- **Tailwind CSS**: Estilos utilitarios
- **Vite**: Bundler y dev server
- **Fetch API**: Cliente HTTP nativo

## ✨ Características Principales

- ✅ Gestión completa de mazos (crear, editar, duplicar, exportar, importar)
- 📖 Sesiones de estudio interactivas con tarjetas de volteo
- 🎯 Algoritmo SM-2 de repetición espaciada
- 🤖 Integración con IA de Gemini para análisis de mazos
- 📊 Dashboard con estadísticas y progreso
- 💾 Exportación e importación de mazos en JSON/CSV

## 🚀 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Deploy automático en cada push a `main`

```bash
# Build para Vercel
npm run build
```

## 📝 Notas de Desarrollo

- Los controladores manejan toda la lógica de negocio
- Las vistas son componentes vanilla TypeScript sin dependencias
- La comunicación con el backend es 100% REST/JSON
- El router es una SPA simple sin dependencias

## 🔧 Desarrollo

```bash
# Validar tipos TypeScript
npm run lint

# Watch mode (ya incluido en npm run dev)
npm run dev

# Build de producción
npm run build
```

## 📜 Licencia

MIT

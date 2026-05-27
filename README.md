# StudyFlow — Frontend

TypeScript · Vite · Tailwind CSS · Vercel

## Despliegue en Vercel (recomendado)

### 1. Conectar repositorio
1. Ir a [vercel.com](https://vercel.com) → New Project → Import Git Repository
2. Seleccionar este repositorio (`studyflow-frontend`)
3. Framework Preset: **Vite** (se detecta automáticamente)

### 2. Variables de entorno en Vercel
En Settings → Environment Variables:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://tu-proyecto.up.railway.app/api` |

> Reemplaza la URL con la URL real de tu servicio Railway.

### 3. Deploy
Vercel desplegará automáticamente en cada push a `main`.

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend local

# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:5173

# Build de producción
npm run build
```

## Arquitectura

El frontend sigue el patrón **MVC**:
- `src/models/` — Interfaces TypeScript (tipos de datos)
- `src/controllers/` — Lógica de negocio del cliente, llama a la API
- `src/views/` — Componentes de renderizado HTML
- `src/api/` — Capa de comunicación HTTP con el backend

## Usuario demo

La aplicación usa un usuario demo fijo (`demo-user-001`) sin autenticación, que se crea automáticamente en el backend al iniciar. Esto simplifica el flujo para demostración académica.
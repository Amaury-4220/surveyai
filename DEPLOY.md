# 🚀 SurveyAI — Instrucciones de Deploy en Netlify

## Estructura del proyecto

```
surveyai/
├── index.html          ← Entrada HTML
├── package.json        ← Dependencias npm
├── vite.config.js      ← Config de Vite (bundler)
├── netlify.toml        ← Config de Netlify
├── public/
│   └── favicon.svg     ← Ícono del sitio
└── src/
    ├── main.jsx        ← Punto de entrada React
    └── App.jsx         ← Toda la aplicación (SurveyAI.jsx renombrado)
```

---

## OPCIÓN A — Deploy arrastrando carpeta (más fácil, 2 minutos)

### Paso 1 — Instala Node.js
Descarga desde https://nodejs.org (versión LTS)

### Paso 2 — Abre la terminal en la carpeta del proyecto
```bash
cd surveyai
```

### Paso 3 — Instala dependencias
```bash
npm install
```

### Paso 4 — Construye el proyecto
```bash
npm run build
```
Esto genera una carpeta `/dist` con los archivos estáticos.

### Paso 5 — Sube a Netlify
1. Ve a https://app.netlify.com
2. Crea cuenta gratis (con email o GitHub)
3. En el panel, haz clic en **"Add new site"** → **"Deploy manually"**
4. **Arrastra la carpeta `dist`** al área de drop
5. ✅ ¡Listo! Netlify te da una URL tipo `https://nombre-random.netlify.app`

---

## OPCIÓN B — Deploy con GitHub (recomendado para actualizaciones)

### Paso 1 — Sube el proyecto a GitHub
```bash
git init
git add .
git commit -m "feat: SurveyAI initial deploy"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/surveyai.git
git push -u origin main
```

### Paso 2 — Conecta Netlify con GitHub
1. https://app.netlify.com → "Add new site" → "Import an existing project"
2. Selecciona **GitHub** → autoriza → elige el repo `surveyai`
3. Configuración de build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Clic en **"Deploy site"**

**Ventaja:** Cada vez que hagas `git push`, Netlify re-despliega automáticamente.

---

## ¿Qué pasa con el backend (main.py)?

El frontend (Netlify) es solo la interfaz visual.
Para que las respuestas se guarden en base de datos, el backend FastAPI necesita un servidor aparte.

### Backend gratis en Render.com

1. Ve a https://render.com → crea cuenta gratis
2. "New Web Service" → conecta tu repo de GitHub (sube `main.py` y `requirements.txt`)
3. Configura:
   - **Runtime:** Python 3.11
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Render te da una URL tipo `https://surveyai-api.onrender.com`
5. Actualiza en `App.jsx` la URL del fetch:
   ```js
   // Línea del AIGenerator — cambiar:
   fetch('/api/v1/respuestas/registrar', ...)
   // Por:
   fetch('https://surveyai-api.onrender.com/api/v1/respuestas/registrar', ...)
   ```

### Base de datos gratis en Supabase

1. Ve a https://supabase.com → crea proyecto gratis
2. Ve a "SQL Editor" → pega el contenido de `schema.sql` → ejecuta
3. Copia la `DATABASE_URL` de Settings → Database
4. En Render, agrega variable de entorno:
   ```
   DATABASE_URL=postgresql://...tu-url-de-supabase...
   ```

---

## requirements.txt (para el backend en Render)

```
fastapi==0.111.0
uvicorn==0.30.1
databases[asyncpg]==0.9.0
python-jose[cryptography]==3.3.0
pydantic-settings==2.3.4
asyncpg==0.29.0
```

---

## Resumen de URLs cuando esté todo listo

| Servicio | URL | Gratis |
|---|---|---|
| Frontend | https://tu-app.netlify.app | ✅ Siempre gratis |
| Backend API | https://tu-api.onrender.com | ✅ 750h/mes gratis |
| Base de datos | Supabase | ✅ 500MB gratis |

---

## ¿Problemas?

- **"Module not found"** → ejecuta `npm install` de nuevo
- **Página en blanco en Netlify** → verifica que `netlify.toml` esté en la raíz
- **CORS error** → en `main.py` agrega:
  ```python
  from fastapi.middleware.cors import CORSMiddleware
  app.add_middleware(CORSMiddleware, allow_origins=["https://tu-app.netlify.app"],
    allow_methods=["*"], allow_headers=["*"])
  ```

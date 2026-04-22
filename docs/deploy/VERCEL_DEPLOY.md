# Vercel Deployment

La app está desplegada en Vercel como sitio estático (SPA Angular).

## URL de producción

Configurada en el dashboard de Vercel → Domains.

## Cómo funciona

El build de Vercel ejecuta el script `vercel-build` definido en `package.json`:

```bash
node scripts/set-env.js && ng build --configuration production
```

1. `set-env.js` lee las variables de entorno de Vercel y genera los ficheros:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
2. `ng build --configuration production` compila la app con los ficheros generados.

El fichero `vercel.json` en la raíz del proyecto configura:
- El comando de build
- El directorio de salida (`dist/monchito-game-library/browser`)
- El routing SPA (fallback a `index.html` para rutas no estáticas)

## Variables de entorno

Las siguientes variables deben estar configuradas en **Vercel → Settings → Environment Variables**:

| Variable | Descripción | Origen |
|---|---|---|
| `SUPABASE_URL` | URL del proyecto de Supabase | Manual |
| `SUPABASE_ANON_KEY` | Clave anónima pública de Supabase | Manual |
| `RAWG_API_KEY` | API key de RAWG (rawg.io/apidocs) | Manual |
| `SENTRY_DSN` | DSN del proyecto Sentry (opcional — fallback hardcodeado en `set-env.js`) | Manual |
| `SENTRY_AUTH_TOKEN` | Token para subida de source maps a Sentry | Integración Sentry ↔ Vercel |
| `SENTRY_ORG` | Slug de la organización en Sentry (`espinilleitor`) | Integración Sentry ↔ Vercel |
| `SENTRY_PROJECT` | Slug del proyecto en Sentry (`mochito-game-library`) | Integración Sentry ↔ Vercel |

> **Nota:** La `SUPABASE_ANON_KEY` está diseñada para ser pública — la seguridad real la gestiona Row Level Security (RLS) en Supabase.

> **Nota:** Las variables `SENTRY_AUTH_TOKEN`, `SENTRY_ORG` y `SENTRY_PROJECT` las genera automáticamente la integración Sentry instalada en Vercel (Settings → Integrations → Sentry). No hace falta crearlas a mano.

Ver [OBSERVABILITY.md](./OBSERVABILITY.md) para el detalle completo de la configuración de observabilidad.

## Auto-deploy

Cada push a la rama `master` dispara un nuevo deployment de producción automáticamente.

## Primer deploy manual

Si Vercel no despliega automáticamente:

1. Dashboard → Deployments → **Create Deployment**
2. Introducir `master` como referencia de rama
3. Click **Deploy**

## Ficheros implicados

| Fichero | Propósito |
|---|---|
| `vercel.json` | Configuración de build y routing para Vercel |
| `scripts/set-env.js` | Genera los ficheros de entorno a partir de las env vars |
| `src/environments/environment.ts` | Generado en build (ignorado en git) |
| `src/environments/environment.prod.ts` | Generado en build (ignorado en git) |
| `src/environments/environment.example.ts` | Plantilla de ejemplo (commiteado) |

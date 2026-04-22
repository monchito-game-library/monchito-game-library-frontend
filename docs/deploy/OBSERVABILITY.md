# Observabilidad — Sentry + Better Stack

Monitorización de errores en producción y uptime de la app.

---

## Sentry — Error tracking

### Qué captura

- Errores JavaScript no manejados en producción (vía `SentryErrorHandler`).
- Trazas de navegación entre rutas (vía `TraceService` + `browserTracingIntegration`).
- Sesiones de usuario, tasa de crashes y adopción por deploy (Release Health).
- Solo activo en producción — nunca en desarrollo local.

### Configuración técnica

| Fichero | Qué hace |
|---|---|
| `src/main.ts` | Llama a `Sentry.init()` con DSN, release y tracing si `environment.sentry.enabled` es `true` |
| `src/app/app.config.ts` | Registra `ErrorHandler`, `TraceService` y `APP_INITIALIZER` condicionados al mismo flag |
| `angular.json` | Source maps hidden en producción (`sourceMap: { scripts: true, hidden: true }`) |
| `scripts/set-env.js` | Inyecta `SENTRY_DSN` y `VERCEL_GIT_COMMIT_SHA` (como `release`) durante el build de Vercel |

### Dashboard

- **Organización:** `espinilleitor`
- **Proyecto:** `mochito-game-library`
- **Issues** → errores capturados agrupados por tipo con stack trace legible.
- **Performance** → trazas de navegación, tiempo de carga por ruta.
- **Releases** → cada deploy aparece identificado por su commit SHA; muestra tasa de crashes, sesiones activas y adopción por versión.

### Cómo verificar que funciona

Tras un deploy, abrir la app en producción y ejecutar en la consola del browser:

```js
throw new Error("Sentry test");
```

El error debe aparecer en Sentry → Issues en unos segundos.

### Source maps

La integración Sentry ↔ Vercel (instalada en Vercel → Settings → Integrations) sube automáticamente los source maps en cada deploy y los borra del bundle final. Esto hace que los stack traces en Sentry muestren el código TypeScript original en lugar del bundle minificado.

---

## Better Stack — Uptime monitoring

Monitor HTTP externo que comprueba periódicamente que la app en Vercel responde correctamente y envía alertas por email si cae.

### Configuración

Gestionado íntegramente desde el panel de Better Stack. No requiere cambios en el código del proyecto.

- **Monitor:** HTTP hacia la URL de producción.
- **Intervalo:** cada minuto.
- **Alerta:** email al propietario.

### Dashboard

Accesible desde betterstack.com → Uptime. Muestra el historial de uptime y los incidentes registrados.

# Lighthouse — Auditoría de rendimiento y accesibilidad

Análisis generado con `npm run lighthouse` contra `http://localhost:4200` el 2026-04-12.

---

## Scores por página

| Página                  | Performance | Accessibility | Best Practices | SEO |
|-------------------------|-------------|---------------|----------------|-----|
| `/auth/login`           | 93          | 100           | 100            | 63  |
| `/auth/register`        | 100         | 100           | 100            | 63  |
| `/auth/forgot-password` | 100         | 100           | 100            | 63  |
| `/games`                | 100         | 100           | 100            | 63  |
| `/games/sold`           | 100         | 100           | 100            | 63  |
| `/games/add`            | 95          | 100           | 100            | 63  |
| `/wishlist`             | 95          | 100           | 100            | 63  |
| `/orders`               | 95          | 100           | 100            | 63  |
| `/settings`             | 95          | 100           | 100            | 63  |

---

## Audits pendientes

### SEO — `is-crawlable` (todas las páginas, score 0)
Lighthouse penaliza que `public/robots.txt` tenga `Disallow: /`. Es el comportamiento **correcto** para una app privada que requiere login. No se corregirá.

### Performance — CLS / Layout Shifts (games/add, orders, settings, wishlist)
CLS de ~0.138 detectado en páginas protegidas. Es un **falso positivo**: Lighthouse corre sin sesión y ve la pantalla de login en lugar del contenido real, lo que genera el shift. No es un problema real para el usuario autenticado.

### Performance — Unused JavaScript / FCP lento (auth/login)
El bundle de Angular en modo desarrollo es significativamente más pesado que en producción. Estos valores no son representativos del rendimiento real en Vercel.

### Performance — Network dependency tree (auth/login, auth/register)
Cadena de requests en la carga inicial. Relacionado con el coste de arranque de Angular + Supabase en dev mode.

---

## Historial de mejoras aplicadas

| Fecha      | Mejora                                                  | Impacto                          |
|------------|---------------------------------------------------------|----------------------------------|
| 2026-04-12 | `aria-label` en todos los `mat-icon-button`             | Accessibility 93 → **100**       |
| 2026-04-12 | `<meta name="description">` en `index.html`             | SEO (meta description)           |
| 2026-04-12 | `public/robots.txt` válido                              | SEO (robots válido)              |
| 2026-04-12 | `font-display: swap` en Material Icons                  | Performance (render blocking)    |
| 2026-04-12 | Providers movidos a rutas lazy-loaded                   | Bundle 285 KB → **67 KB** (-76%) |
| 2026-04-21 | `NgOptimizedImage` `fill` mode + `IMAGE_LOADER` passthrough en todas las imágenes RAWG | Elimina warnings NG02952/NG02960 |
| 2026-04-21 | `priority` + `<link rel="preconnect">` para RAWG CDN y Supabase Storage | Elimina warnings NG02955/NG02956 (LCP) |
| 2026-04-21 | Eliminado "Ajustes" de la barra de navegación inferior  | Reduce redundancia de navegación |
| 2026-04-21 | Corregido doble pipe `\| transloco` en `confirm-dialog` | Traducciones rotas en diálogos de confirmación |

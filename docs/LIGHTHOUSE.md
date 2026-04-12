# Lighthouse — Mejoras detectadas

Análisis generado con `npm run lighthouse` contra https://project-hohsa.vercel.app el 2026-04-11.

---

## Problemas globales (afectan a todas las páginas)

### Accesibilidad — `button-name`
Los botones no tienen nombre accesible. Habitualmente son botones de icono de Angular Material (`mat-icon-button`) sin `aria-label`.
**Solución:** añadir `[attr.aria-label]="'...' | transloco"` en todos los `mat-icon-button`.

### SEO — `meta-description`
Ninguna página tiene meta description.
**Solución:** añadir `<meta name="description" content="...">` en el `<head>` del `index.html`, o gestionar dinámicamente con `Meta` service de Angular por ruta.

### SEO — `robots.txt` inválido (20 errores)
El fichero `robots.txt` tiene errores de sintaxis que Lighthouse penaliza.
**Solución:** revisar y corregir el `public/robots.txt`.

---

## Problemas específicos

### Performance — `unused-javascript` (solo `/auth/login`)
Se detectan ~57 KiB de JavaScript no utilizado en la carga inicial del login.
**Solución:** revisar el lazy loading de módulos y asegurarse de que el chunk inicial sea mínimo.

### Performance — `font-display` (solo `/auth/login`)
Ahorro estimado de 120 ms si se usa `font-display: swap` en las fuentes cargadas.
**Solución:** añadir `font-display: swap` en la declaración `@font-face` o en el link de Google Fonts.

### Performance — CLS / Layout Shifts (0.138 en `/games/add`, `/orders`, `/settings`, `/wishlist`)
Se produce un desplazamiento de layout (Cumulative Layout Shift) durante la carga.
**Solución:** identificar el elemento que se desplaza (abrir el report HTML y ver "Layout shift culprits") y reservar espacio con dimensiones fijas o `min-height`.

---

## Resumen de scores por página

| Página               | Performance | Accessibility | Best Practices | SEO |
|----------------------|-------------|---------------|----------------|-----|
| `/auth/login`        | 93          | 93            | 100            | 82  |
| `/auth/register`     | 100         | 93            | 100            | 82  |
| `/auth/forgot-password` | 100      | 100           | 100            | 82  |
| `/games`             | 100         | 93            | 100            | 82  |
| `/games/sold`        | 100         | 93            | 100            | 82  |
| `/games/add`         | 95          | 93            | 100            | 82  |
| `/wishlist`          | 95          | 93            | 100            | 82  |
| `/orders`            | 95          | 93            | 100            | 82  |
| `/settings`          | 95          | 93            | 100            | 82  |

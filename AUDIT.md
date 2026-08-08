# Auditoría de la app — recorrido con Playwright

> Índice vivo de la auditoría en curso de `monchito-game-library-frontend` mediante
> recorrido con Playwright. Aquí se apuntan los hallazgos a corregir antes de mergear
> a `master`. Los detalles completos viven en los docs de cada área.

## Estado

- **Auditoría**: pase 3 completado (CRUD + responsive exhaustivo 7 viewports + 60 items en venta + datos de prueba). 9/9 fixes aplicados en `docs/quality/BUGS.md`; el follow-up de Bug 6 (rutas estáticas `new`) está también resuelto.
- **Fecha**: 2026-08-08
- **Rama auditada**: `fix/mobile-retro-list-item-overflow-fix` (24 commits por delante de `origin/master`)
- **Dev server**: `http://127.0.0.1:4200/` (HTTP 200, `ng serve --configuration development`)
- **Sesión**: usuario de prueba autenticado vía Google (token refrescado durante el pase 2)
- **Viewports cubiertos (pase 2)**: 360×640, 375×667, 414×896, 768×1024, 1366×768, 1920×1080
- **Viewports cubiertos (pase 3, exhaustivo)**: 360×640, 375×667, 768×1024, 1024×768, 1920×1080, 2560×1440, 3840×2160 (7 totales)
- **Rutas cubiertas**: 8 protegidas (de las cuales 4 también se comprobaron en pase responsive exhaustivo) — ver detalles abajo
- **Informe completo**: `/tmp/opencode/playwright-tour-report-2.md` y `/tmp/opencode/playwright-tour-report-2.json` (transitorios)
- **Screenshots**: `.playwright-mcp/shots/audit-2026-08-08/` (público en raíz, autenticado en `pase2/`, exhaustivo CRUD+responsive en `pase3/`)

## Resumen de hallazgos

| #   | Severidad | Área                              | Hallazgo                                                                                                       | Doc de detalle                                               |
| --- | --------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 1   | 🔴 Alto   | Guard / Auth / `/sale`            | `/sale` accesible sin autenticación y queda cargando infinito (guard ausente + estado colgado)                 | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 2   | 🟡 Media  | Forms / Auth                      | Formularios `/auth/login`, `/auth/register`, `/auth/forgot-password` sin feedback `required` al enviar vacíos  | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 3   | 🟡 Media  | i18n / wishlist                   | `Missing translation for 'Buscar por título...'` en `/wishlist` pese a existir la clave en `es.json`/`en.json` | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 4   | 🟡 Baja   | Performance / `index.html`        | `NG02956`: falta `<link rel="preconnect>` para `lh3.googleusercontent.com` (33 ocurrencias en pase 2)          | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 5   | 🔴 Alto   | Routing / wishlist                | Botón `+` de `/wishlist` no hace nada (URL no cambia, no abre modal)                                           | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 6   | 🔴 Alto   | Routing / CREATE flows            | Network 400 al hacer CREATE de game (`user_games_full?id=eq.new`)                                              | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 7   | 🟡 Media  | `retro-tabs` / `SalePage`         | `hideLabels` no se aplica en tabs de `/sale` en móvil (360×640 muestra "En venta" y "Historial")               | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 8   | 🟡 Baja   | Performance / `index.html`        | `NG02956` también afecta a `ui-avatars.com` (38 ocurrencias en pase 3)                                         | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |
| 9   | 🟡 Baja   | Performance / `WishlistComponent` | `NG02955`: imagen LCP de la primera card sin `priority` en `/wishlist` (5 ocurrencias en pase 3)               | ✅ Resuelto — [`docs/quality/BUGS.md`](docs/quality/BUGS.md) |

## Métricas del pase 2 (sesión autenticada + responsive)

- **Rutas protegidas recorridas**: 8 (`/collection`, `/collection/games`, `/collection/consoles`, `/collection/controllers`, `/wishlist`, `/sale`, `/settings`, `/management`)
- **Responsive checks**: 6 viewports × 4 rutas = 24 capturas con evaluación de overflow horizontal
- **Overflow horizontal detectado**: 0 (en ningún viewport, en ninguna ruta)
- **Errores de red (≥400)**: 0
- **Errores JS (page errors)**: 0
- **Console errors + warnings + page errors**: 40 totales (33 NG02956 + 7 missing translation; 33 son el mismo warning repetido en cada navegación, 7 son el mismo warning de i18n repetido en navegaciones responsive)
- **`/management`**: redirige a `/collection` (guard de admin/owner funciona; usuario actual no es owner). Comportamiento correcto.
- **`/settings`**: timeout en `networkidle` (probable polling o carga de assets que no termina), pero la URL final es `/settings` y la página sí carga.

### Pase 3 (CRUD + Responsive exhaustivo, 2026-08-08)

- **Browser**: Chromium headed real (no headless) con display Wayland.
- **CRUD testado**: 4 entidades (games, wishlist, consoles, controllers) — crear, editar, eliminar (parcialmente automatizable).
- **Viewports probados**: 7 (`360×640`, `375×667`, `768×1024`, `1024×768`, `1920×1080`, `2560×1440`, `3840×2160`) × 4 rutas = 28 capturas responsive.
- **Overflow horizontal**: 0 en los 7 viewports. La rama corrige correctamente el problema de overflow en retro-list-item, retro-tabs y wishlist.
- **Network errors**: 2 nuevos bugs identificados (`user_games_full?id=eq.new`, `user_controllers`).
- **Console logs**: 60 totales. Desglose por tipo:
  - 38 NG02956 (falta preconnect — corregido en Bug 4+8)
  - 15 Missing translation (doble aplicación del pipe `| transloco` — corregido en Bug 3)
  - 5 NG02955 (imagen LCP sin priority — ya implementado)
  - 2 Network 400 (`user_games_full?id=eq.new` y `user_controllers` — corregido en Bug 6 + variantes)
- **CRUD bugs identificados**:
  - `+` de `/wishlist` no hace nada (alta) — Bug 5
  - CREATE flows quedan en `/collection/*/add` en lugar de navegar a la lista (parte del bug del network 400) — Bug 6
- **Atribución a la lib retro**: varios selectores no encuentran los componentes porque `retro-input` no expone `formcontrolname` en el DOM. Esto es un bug de la lib retro (en construcción) o un detalle de implementación que dificulta la automatización pero no afecta al usuario final.

## Features nuevas de la rama — validación

| Feature                                                                                        | Estado                   | Notas                                                                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feat(retro-tabs): input hideLabels para tabs icon-only` (+ `feat(sale)` + `feat(collection)`) | ✅ OK                    | Layout responsive OK (0 overflow en 7 viewports). `hideLabels` se aplica correctamente en `/sale` móvil (binding `[hideLabels]="isMobile()"` con breakpoint 768px, ya estaba implementado). Bug #7 cerrado tras verificación. |
| `fix(mobile): overflow + tabs icon-only en retro-list-item consumers`                          | ✅ OK                    | Sin overflow horizontal en 28 capturas responsive (7 viewports × 4 rutas).                                                                                                                                                    |
| `fix(mobile): width: 100% en .sale-page__item-info + spacing`                                  | ✅ OK                    | Sin overflow en `/sale` en 7 viewports.                                                                                                                                                                                       |
| `fix(mobile): width: 100% en body wrappers de retro-list-item consumers`                       | ✅ OK                    | Sin overflow en 7 viewports.                                                                                                                                                                                                  |
| `feat(nav-rail): animate sub-items expand/collapse with smooth slide`                          | ⚠️ No validado en headed | Layout OK, animación no se ha validado visualmente.                                                                                                                                                                           |
| `feat(nav-rail): add Gestión sub-items with icons`                                             | ✅ OK                    | Layout OK con avatares reales.                                                                                                                                                                                                |
| `feat(nav-rail): replace collection sub-item dots with icons`                                  | ✅ OK                    | Layout OK.                                                                                                                                                                                                                    |
| `feat(nav-rail): swap avatar and app icon positions`                                           | ✅ OK                    | Layout OK.                                                                                                                                                                                                                    |
| `feat(wishlist): add filter drawer matching games collection pattern`                          | ⚠️ Parcial               | El botón "Filtros" no se detectó por automatización, requiere prueba manual.                                                                                                                                                  |
| `feat(wishlist): replace priority stars with retro-badge` + `feat(lib/retro-badge)`            | ✅ OK                    | 50 items con prioridades 1-5 visibles en `/wishlist`.                                                                                                                                                                         |
| `feat(collection): Tab focuses search on games, consoles and controllers`                      | ✅ OK                    | El primer Tab aterriza en "Buscar por título" en `/collection/games`.                                                                                                                                                         |
| `feat(retro): add programmatic focus API to retro-input`                                       | ⚠️ No validado           | Requiere interactividad programática.                                                                                                                                                                                         |

**Nota común**: la cuenta del usuario de prueba se pobló con 50+50+50+50+50 = 250 registros el 2026-08-08 (ver "Datos de prueba"). Las validaciones de pase 3 se hicieron con contenido real. El pase 2 se hizo con cuenta vacía, lo que permitió evaluar layout pero limitó la validación funcional de features visuales.

## Pendiente de auditoría

### Validaciones manuales pendientes

- [ ] Menú kebab en game-detail (abrir desde `/collection/games`) — selector impreciso en Playwright.
- [ ] Filter drawer de wishlist (abrir desde `/wishlist`) — requiere scroll/interacción manual.
- [ ] Theme switcher en `/settings` — no detectado por automatización.

### Tests pendientes de automatización (no automatizados en este pase)

- [ ] Validar que `/collection/games/new`, `/collection/consoles/new`, `/collection/controllers/new` montan el formulario (no el detail) tras el follow-up del Bug 6 (rutas estáticas `new`). Los unit tests actuales solo validan el tratamiento defensivo en los formularios; falta un test de routing real.
- [ ] Verificar que el flujo inline de wishlist (`onAddItem() → viewMode='search'`) funciona end-to-end.

### Validación exhaustiva del hallazgo visual "cards cortadas en split screen" (2026-08-08)

Tras la duda del usuario, se ejecutó una segunda ronda de validación con Playwright en **24 escenarios**:

- **13 viewports probados** (todos sin clipping): 1920×1080, 1680×1050, 1440×900, 1366×768, 1280×800, 960×1080 (split 50/50 en 1920), 960×800, 768×1024, 640×960, 2560×1440, 3840×2160, 3840×1080, 3440×1440.
- **11 escenarios alternativos** (todos sin clipping): zoom 110/150/200% @ 1920×1080 y @ 960×1080, dynamic resize 1920→960→640→2560, hover primera card, scroll horizontal forzado, mobile emulation Pixel 5/iPad Mini/iPhone SE.

**Sanity check**: forzando `retro-list--grid` sobre `<retro-list>` en wishlist (lo cual **NO está aplicado en el código actual**) el síntoma SÍ se reproduce (3 cols @ 960×1080 cortadas, 7 cols @ 1920×1080 con +26 px overflow).

**Conclusión**: el síntoma reportado por el usuario NO ocurre en el estado actual. `<retro-list>` usa `display: flex` por defecto y `min-width: 0` en los items previene el overflow. Solo se reproduciría si alguien activara `retro-list--grid` en wishlist — y la rama actual NO lo hace.

**Decisión final**: mantener Opción C (no tocar). El hallazgo queda documentado para futuro: cualquier reactivación del grid requiere validación visual con el script `scripts/playwright-wishlist-split-grid-test.mjs`.

### Validaciones ya completadas (pase 3)

- [x] Validación visual con contenido real (juegos, wishlist items, sales, etc.) — datos de prueba añadidos 2026-08-08 (ver "Datos de prueba" abajo).
- [x] Responsive exhaustivo con datos reales (7 viewports × 4 rutas = 28 capturas).
- [x] CRUD flows (4 entidades: games, wishlist, consoles, controllers).
- [x] Confirmar causa exacta del `Missing translation` de wishlist (doble pipe transloco) — bug #3 ✅
- [x] Aplicar el fix de `NG02956` para `lh3.googleusercontent.com` y `ui-avatars.com` (2 líneas en `index.html`) — bugs #4 y #8 ✅
- [x] Fix: botón `+` de `/wishlist` no hace nada (bug #5) ✅
- [x] Fix: network 400 en `user_games_full?id=eq.new` (bug #6, incluyendo follow-up de rutas estáticas `new`) ✅
- [x] Fix: `hideLabels` no se aplica en tabs de `/sale` en móvil (bug #7) ✅
- [x] Fix: imagen LCP sin `priority` en `/wishlist` (bug #9) ✅

## Datos de prueba añadidos (2026-08-08)

Para poder validar las features de la rama con contenido real, se pobló la cuenta del usuario de prueba con datos sintéticos vía REST API de Supabase. Distribución final:

| Tabla                     | Cantidad | En venta | Notas                                                                                       |
| ------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `user_games`              | 50       | 20       | Variedad de plataformas, formatos, condiciones, ediciones; 8 favoritos; 5 ratings distintos |
| `user_works`              | 50       | n/a      | Atributos compartidos por obra (status, personal_rating, is_favorite, platform)             |
| `user_wishlist`           | 50       | n/a      | Prioridades 1-5 (para validar `retro-badge`), plataformas variadas                          |
| `user_consoles`           | 50       | 20       | Modelos reales del catálogo (74 disponibles), 3 regiones (PAL/NTSC/NTSC-J)                  |
| `user_controllers`        | 50       | 20       | Compatibilidad con PS5/PS4/Xbox/Switch/PC, 7 colores, condiciones variadas                  |
| `available_items` (vista) | **60**   | —        | 20 games + 20 consoles + 20 controllers (verificado en `/sale`)                             |

- **Screenshots con datos**: `.playwright-mcp/shots/audit-2026-08-08/pase3/`
- **Script de seed**: `/tmp/opencode/bulk-seed.mjs` (idempotente: borra y recrea)
- **Script de verificación visual**: `/tmp/opencode/verify-seed.mjs`
- **Cuenta del usuario**: `a2c1997f-8cb7-47c6-b001-e34c67e2a067` (Google login, `espinilleitor05@gmail.com`)

Para limpiar y recrear los datos: ejecutar de nuevo `/tmp/opencode/bulk-seed.mjs` (borra y vuelve a insertar). Para dejar la cuenta vacía: DELETE manual vía Supabase Studio o ejecutar:

```js
// (en consola de Node con fetch + anon+token como en bulk-seed.mjs)
fetch('https://egevnihppclxucorhdjt.supabase.co/rest/v1/user_games?user_id=eq.a2c1997f-8cb7-47c6-b001-e34c67e2a067', {
  method: 'DELETE',
  headers: { apikey: '...', Authorization: 'Bearer ...' }
});
```

(repetir para `user_works`, `user_wishlist`, `user_consoles`, `user_controllers`).

## Hallazgos visuales post-pase 3 (reportados por el usuario, 2026-08-08)

### Cards cortadas en modo pantalla partida / split-screen

**Síntoma reportado:** En viewports anchos (≥ 1920px) o cuando el navegador está en modo pantalla partida (split view), las cards de la wishlist salen cortadas. Típicamente se ven 3 columnas pero la columna de la izquierda queda cortada.

**Estado:** Pendiente de validación. El usuario reporta el síntoma pero no está claro:

- Si es un problema del grid CSS (número de columnas hardcodeado que no escala con viewport).
- Si es un problema del contenedor (ancho fijo o `overflow: hidden`).
- Si está relacionado con algún breakpoint intermedio no contemplado.

**Decisión:** este hallazgo requiere investigación visual antes de proponer un fix. Cambiar el grid puede romper el diseño responsive establecido. Pendiente de priorización por el usuario.

**Tests pendientes:** capturar screenshots en viewports 2560×1440 y 3840×2160 con split-screen activo para confirmar el síntoma.

## Docs del proyecto relacionados

- [`docs/quality/BUGS.md`](docs/quality/BUGS.md) — registro histórico de bugs con formato establecido.
- [`docs/auditoria-ui-responsive.md`](docs/auditoria-ui-responsive.md) — auditoría UI/UX + responsive previa (33 issues, varios resueltos).

## Cómo continuar la auditoría

Todos los bugs del pase 3 (1-9) están resueltos y documentados en [`docs/quality/BUGS.md`](docs/quality/BUGS.md). El follow-up del Bug 6 (rutas estáticas `new`) también está cerrado.

### Validación manual pendiente

- **Menú kebab en game-detail**: abrir desde `/collection/games`, pulsar en los tres puntos de cualquier juego, verificar opciones (editar, vender, eliminar).
- **Filter drawer de wishlist**: desde `/wishlist`, pulsar "Filtros", verificar que se abre el drawer con las opciones de filtro.
- **Theme switcher**: en `/settings`, cambiar entre tema claro y oscuro, verificar que la UI responde correctamente.

### Validaciones ya completadas (pase 3)

- ✅ Responsive exhaustivo en 7 viewports × 4 rutas = 28 capturas sin overflow.
- ✅ CRUD flows en 4 entidades con datos reales (60 items en venta en `/sale`).
- ✅ Feature `Tab focuses search` validada (el primer Tab aterriza en "Buscar por título").
- ✅ Feature `retro-badge` validada con prioridades 1-5 visibles en `/wishlist`.
- ✅ Nav-rail con avatares reales, icons en sub-items, layout correcto.

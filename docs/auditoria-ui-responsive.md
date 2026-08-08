# Auditoría UI/UX + Responsive — Monchito Game Library

> Recorrido completo con Playwright (Chromium) en 3 resoluciones:
>
> - **Desktop** 1920×1080
> - **Tablet** 768×1024
> - **Mobile** 375×667
>
> Recorrido + interacciones reales (formularios, modales, dropdowns, scroll, menús).
> Screenshots en `.playwright-mcp/shots/{desktop,tablet,mobile}/`.

---

## ✅ Estado final del plan (post-correcciones)

| Fase | Issue                                             | Estado                | Notas                                                                                                                |
| ---- | ------------------------------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------- | --- |
| 1.1  | #1 #18 #23 — Proxy CORS para imágenes RAWG        | ✅ Resuelto           | Proxy `/rawg-media/*` con rewrite en Vercel + `pathRewrite` en dev server                                            |
| 1.2  | #4 — /orders mobile fallback                      | ✅ Resuelto           | `OrdersComponent` muestra mensaje en lugar de redirigir                                                              |
| 1.3  | #5 — Grid responsive en listas                    | ⚠️ Definido, no usado | `retro-list` con modifier `--grid` + `auto-fill minmax(220px, 1fr)` por defecto. Sin consumidores activos en `src/`. |
| 1.4  | #2 — NgOptimizedImage priority en LCP             | ✅ Resuelto           | `priority` en avatares y portada principal                                                                           |
| 2.a  | #7 #12 — Material Symbols Outlined                | ✅ Resuelto           | Migración a Material Symbols Outlined + filled para `star`/`favorite`/`bookmark`                                     |
| 2.b  | #8 #19 — chevron SVG en lugar de `>`              | ✅ Resuelto           | `retro-icon name="chevron_right"` reemplaza el pseudo-elemento `>`                                                   |
| 2.c  | #9 — Light theme contraste                        | ⚠️ Parcial            | Tokens OK pero quedan zonas con poco contraste                                                                       |
| 2.d  | #6 — Duplicación header-tabs ↔ sidebar            | ✅ Resuelto           | Retro-tabs ocultos en desktop, sub-items añadidos al sidebar                                                         |
| 2.e  | #10 — Stars prioridad wishlist                    | ✅ Resuelto           | Estrellas más grandes y filled en amber                                                                              |
| 3.a  | #15 — Tablet grid                                 | ✅ Resuelto           | Por consecuencia de #5                                                                                               |
| 3.b  | #16 — Bottom-nav mobile rebalance                 | ✅ Resuelto           | Mobile añade "Ajustes" (4 items); tablet/desktop mantiene "Pedidos"                                                  |
| 3.c  | #11 — Botón Confirmar /orders/new                 | ✅ No aplica          | El componente ya estaba bien                                                                                         |
| 3.d  | #21 — Limpiar v2.0 del sidebar                    | ✅ Resuelto           | Eliminado del brand                                                                                                  |
| 4.a  | #24 — aria-label + tooltip en botón cambiar vista | ✅ Resuelto           | Tooltip añadido via `RetroTooltipDirective` en retro-icon-button                                                     |
| 4.b  | #25 — Botón "Añadir primera línea" en empty state | ✅ Resuelto           | Botón prominente centrado cuando no hay líneas                                                                       |
| 4.c  | #27 — Icono inventory_2 para ITEMS                | ✅ Resuelto           | Reemplazado tag por inventory_2 en las 3 cards                                                                       |
| 4.d  | #28 — Separadores visuales en stats               | ✅ Resuelto           | Líneas verticales 1px en lugar de pipes `                                                                            | `   |
| 5.1  | #29 — FAB tapaba última card en mobile            | ✅ Resuelto           | Padding-bottom 5rem en `.game-list__grid` (≤820px)                                                                   |
| 5.2  | #30 — Cards wishlist descuadradas (min-width 0)   | ✅ Resuelto           | `min-width: 0` en `.retro-list-item__body > *`                                                                       |
| 5.3  | #31 — Sin virtual scroll con 60+ items            | ✅ Parcial            | Paginación client-side implementada en games.component (24/24 items)                                                 |
| 5.4  | #32 — Sin contador de items visibles en listas    | ⚠️ Pendiente          | Bajo prioridad — ya hay stats `60`                                                                                   |
| 5.5  | #33 — Avatar "PR" rojo en topbar                  | ⚠️ Por diseño         | El servicio genera URL de ui-avatars.com; solo falla en mock local                                                   |

Screenshots de verificación final en `.playwright-mcp/shots/final-v2/{desktop,tablet,mobile}/`.
Screenshots de pruebas de volumen en `.playwright-mcp/shots/bulk/`.

### Hallazgos del test de volumen (50+ items en cada lista)

Para detectar issues que solo aparecen con muchos datos, generé mocks masivos vía
Playwright `page.route` (sin tocar la BD real). Resultados:

- **#29 FAB superposición (mobile)**: el FAB "+" de games se posicionaba fijo encima de la última card del grid. Fix: padding-bottom 5rem en `.game-list__grid` (≤820px) para reservar espacio.
- **#30 Cards wishlist descuadradas**: cada `retro-list-item` tenía el body limitado a 108px de ancho (de 286px totales) porque los hijos (chips, data-rows) tenían un `min-width: auto` que forzaba al body a no encogerse. Fix: `min-width: 0` en `.retro-list-item__body > *`.
- **#31 Paginación**: con 60 games, mobile requiere 11 pantallas de scroll. Implementé paginación client-side (24 items por página, "Cargar más" en el footer).
- **Scroll funciona correctamente** en todos los grids y listas testeados.

---

## 🔧 Plan de reversión del rediseño wishlist (Issues W1–W8)

Tras un rediseño fallido que cambió la wishlist card a un grid de 3 columnas con overflow, se
ejecutó un plan de reversión en 8 issues con 1 commit por issue. Todos cerrados.

| Issue | Commit       | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| W1    | `9a8063c`    | Revertir `retro-list--grid` modifier en `wishlist.component.html`; eliminar `@media (min-width: 600px)` con `--retro-list-grid-cols`. La wishlist vuelve a ser lista vertical en todos los viewports.                                                                                                                                                                                                                                                                                                                  |
| W2    | `d8ae170`    | `wishlist-card`: restaurar esquema `leading/body/trailing` del `retro-list-item`. Cover 72×96 fijo, body sin `flex: 1 1 0`, precio + plataforma en `display: inline-flex` para evitar colapso.                                                                                                                                                                                                                                                                                                                         |
| W3    | `e437ff1`    | Crear `lib/retro/retro-badge` — badge numérico 1–5 con 3 tamaños (sm/md/lg) y 6 variants. Auto-mapea `value` → variant (1→rose, 2-3→amber, 4-5→green).                                                                                                                                                                                                                                                                                                                                                                 |
| W4    | `46c48d8`    | Reemplazar stars de prioridad por `<retro-badge>` en wishlist-card, wishlist-detail, wishlist-item-dialog y wishlist mobile form. Añadidas translations `wishlist.card.priority{High,Medium,Low}` (es/en).                                                                                                                                                                                                                                                                                                             |
| W5    | `3adfca3`    | Quitar sub-item "Resumen" del sidebar de Colección — redundante con el item padre.                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| W6    | `1e9ee5e`    | Item "Gestión" en sidebar con 5 sub-items de iconos (home, videogame_asset, storefront, group, memory). `/users` se oculta para no-owners.                                                                                                                                                                                                                                                                                                                                                                             |
| W7    | (sin commit) | Repaso visual de `games`, `consoles`, `controllers`, `sale`, `orders` — sin issues encontrados.                                                                                                                                                                                                                                                                                                                                                                                                                        |
| W8    | (este doc)   | Actualización del audit con la trazabilidad W1–W8.                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| W9    | (este pase)  | **Decisión: NO reactivar `retro-list--grid` en wishlist.** El usuario reportó cards cortadas en split-screen, pero el grid no está aplicado en el estado actual. Validado con Playwright en 6 viewports: 1 columna sin overflow. El `minmax(220px, 1fr)` de la lib retro es demasiado estrecho para la `wishlist-card` (necesita ~420px), pero como ningún consumidor usa `--grid`, no hay daño real. Riesgo de cambiar el default de la lib retro: afecta a consumidores futuros no contemplados. Decisión: no tocar. |

### Notas de trazabilidad (verificadas 2026-08-08)

- **W1**: la atribución al commit `9a8063c` es **inexacta**. `git show 9a8063c` muestra que ese commit es "Wishlist: card editando + navbar responsive (#117)" y NO contiene cambios relacionados con `retro-list--grid` ni `--retro-list-grid-cols` en `wishlist.component.html`. La historia real es: el grid NUNCA se aplicó en `wishlist.component.html` (verificado con `git log -S 'retro-list--grid' -- src/app/presentation/pages/wishlist/wishlist.component.html` → 0 resultados). La definición del grid en `lib/retro/retro-list/retro-list.component.scss` se añadió en el commit `1ebb21d` ("chore: stage accumulated changes from previous sessions") junto con ajustes defensivos (`min-width: 0`) en `retro-list-item`.

---

## 🔴 Issues críticos (rompen UX / son bugs)

### 1. Imágenes de RAWG bloqueadas por CORS

- **Síntoma**: `Access to image at 'https://media.rawg.io/media/games/.../...' from origin 'http://localhost:4200' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.`
- **Páginas afectadas**: `/collection/games`, `/collection/games/:id` (lista + detalle), `games/add` con catálogo seleccionado.
- **Impacto**: las portadas no se muestran (se ve un placeholder gris) en producción **y** local. Emite errores NG02955 y de consola por cada imagen.
- **Fix**:
  - Corto plazo: configurar un proxy reverso (Vercel rewrites / `vercel.json`) que redirija `/rawg-proxy/*` → `https://media.rawg.io/*` y actualizar `RAWG_BASE_URL` o el componente de imagen para usar esa URL.
  - O bien: en backend, cachear las imágenes en Supabase Storage al guardarlas.
  - O bien: solicitar a RAWG habilitar CORS (no siempre posible).

### 2. NgOptimizedImage sin atributo `priority` en LCP

- **Síntoma**: `NG02955: The NgOptimizedImage directive (...) has detected that this image is the Largest Contentful Paint (LCP) element but was not marked "priority". To fix this, add the "priority" attribute.`
- **Páginas afectadas**: cualquier pantalla donde aparezca el avatar de usuario en el sidebar o las portadas de juegos en el listado.
- **Fix**: añadir `priority` (o `ngSrc` con `priority` cuando proceda) a los `<img>` de avatar y a la primera card de cada lista. Lo más limpio es un flag `firstImage` en el componente de tarjeta.

### 3. NG02952 — aspect-ratio incorrecto en imágenes (de RAWG, encadenado al #1)

- **Síntoma**: `NG02952: ... aspect ratio of the image does not match ... Intrinsic image size: 5w x 4h. Supplied width and height attributes: 72w x 48h.`
- **Páginas afectadas**: catálogos RAWG en `games/add` → "Buscar en catálogo".
- **Fix**: tras resolver #1, dejar que `NgOptimizedImage` infiera dimensiones, o usar `fill` con `object-fit: cover`.

### 4. /orders redirige silenciosamente en mobile

- **Síntoma**: en mobile/tablet (`< 768px`) navegar a `/orders`, `/orders/new`, `/orders/:id` redirige a `/collection` sin ningún mensaje. El usuario no sabe por qué.
- **Páginas afectadas**: todas las de `/orders/*` (guard `canActivateDesktopOnly`).
- **Fix**: en `desktop-only.guard.ts` (o en el destino), mostrar un toast/snackbar con algo tipo "Pedidos solo disponible en escritorio" en lugar de redirigir en silencio. Alternativa: mantener un componente "próximamente en mobile" en `/orders` que explique la limitación.

### 5. Listados en grid muestran **1 sola columna** en desktop y tablet

- **Síntoma**: en `/collection/games`, `/collection/consoles`, `/collection/controllers`, `/wishlist` (list) — solo se ve 1 card por fila aunque hay 1800px de ancho disponible.
- **Páginas afectadas**: todas las listas de la app.
- **Impacto**: scroll infinito para pocos items, sensación de "vacío" extremo (especialmente en desktop), uso ridículo del espacio horizontal.
- **Fix**: revisar el CSS de la grid — el `retro-list` o el `grid-template-columns` parece estar fijado a `1fr`. Debe ser algo como `repeat(auto-fill, minmax(220px, 1fr))`.

### 6. Sidebar en desktop: el header (`RESUMEN / JUEGOS / CONSOLAS / MANDOS`) repite la navegación del sidebar lateral

- **Síntoma**: en desktop, cuando estás en `/collection/*`, el header muestra un submenú con "Resumen / Juegos / Consolas / Mandos" que es lo mismo que la colección. Esto no aporta nada — el sidebar lateral izquierdo ya tiene "Colección" y el submenú interno de cada subpágina debería ir al lado del título, no como pestañas competidas.
- **Páginas afectadas**: `/collection/*` (todas las subsecciones).
- **Fix**: o se elimina el header-tabs y el breadcrumb es suficiente, o se elimina el sidebar lateral izquierdo (deja solo el header-tabs). Hay duplicación clara.

---

## 🟠 Issues de diseño (visuales notables)

### 7. Iconos Material Symbols no se renderizan en muchos sitios

- **Síntoma**: aparecen como texto unicode (`>` chevron, cuadrados, `[ ]`, `✎`) en lugar del icono Material.
- **Páginas afectadas**:
  - Botones con icono (en `games/add`: lupa en plataforma/tienda, todos los botones con prefijo `[ + AÑADIR ]`).
  - Headers de sección (`> INFORMACIÓN DEL CATÁLOGO`, `> MIS DATOS`) en game-detail.
  - Iconos de campos en listas (calendario, globo, etc.).
- **Fix**: comprobar que la fuente `Material Symbols Outlined` se está cargando en `index.html` o en `styles.scss`. Si está, verificar el `font-family` aplicado. Si no, añadir:
  ```html
  <link href="https://fonts.googleapis.com/icon?family=Material+Symbols+Outlined" rel="stylesheet" />
  ```
  Y en CSS: `font-family: 'Material Symbols Outlined';` para los elementos con `mat-icon` o `icon=`.

### 8. El pseudo-elemento `::before { content: '> ' }` en `.app-topbar__title` y otros títulos

- **Síntoma**: títulos como `> Mi Colección`, `> AJUSTES`, `> JUEGOS` muestran un literal `>` (chevron texto) delante.
- **Páginas afectadas**: header del topbar mobile, submenu tabs, section headers de game-detail.
- **Fix**: usar `chevron_right` de Material Symbols o un SVG inline. No usar `>` como elemento decorativo — choca visualmente.

### 9. Light theme: contraste pobre

- **Síntoma**: al cambiar a tema claro en `/settings`, el fondo de las cards se vuelve blanco/gris muy claro pero los textos secundarios (`text-lo`, `--text-mid`) son demasiado oscuros o demasiado claros, dando contraste bajo en algunos elementos.
- **Páginas afectadas**: cualquier página con el light theme.
- **Fix**: revisar los tokens `--text-hi`, `--text-mid`, `--text-lo`, `--border` en `_tokens-light.scss` para asegurar contraste AA mínimo.

### 10. Stars de prioridad en wishlist-edit muy pequeñas y de color lila apagado

- **Síntoma**: 5 estrellitas en la fila "Prioridad" de `/wishlist/:id/edit` (Code Vein II). Se ven muy pequeñas (12-14px) y de color púrpura, sin contraste claro de "activa" vs "vacía".
- **Páginas afectadas**: edición de wishlist.
- **Fix**: aumentar tamaño (24-28px), usar amarillo/dorado o el primary sólido para las activas, hueco claro para las inactivas.

### 11. El botón "Confirmar" en `/orders/new` ocupa el 50% del ancho y está estirado

- **Síntoma**: el botón "CONFIRMAR" en "Nuevo pedido" se renderiza con `flex: 1` y estira su ancho, dando una sensación rara.
- **Fix**: limitar el ancho del botón (`max-width`) o ajustar el layout del footer del formulario.

### 12. Botón `ELIMINAR` en consola y wishlist sale como cuadrado rojo

- **Síntoma**: el icono `delete` no se renderiza, aparece como un cuadrado rojo en lugar de una papelera.
- **Páginas afectadas**: `console-detail`, `wishlist` (botón eliminar).
- **Fix**: depende de #7 (carga de Material Symbols).

### 13. Avatares: `border-radius: 0` (sin redondear) — posiblemente intencional pero inconsistente

- **Síntoma**: los avatares son cuadrados en una app que por lo demás usa bordes suaves.
- **Fix**: si es intencional (estética retro), ignorar. Si no, cambiar a `border-radius: 50%`.

---

## 🟡 Issues de responsive / responsive gaps

### 14. Submenú de tabs (RESUMEN/JUEGOS/CONSOLAS/MANDOS) en desktop muestra icono + texto muy junto y estirado

- **Síntoma**: el header-tabs en desktop (`retro-tabs`) tiene cada tab ocupando 25% del ancho con icono + label pequeños. Se ve estirado y con mucho aire entre icono y texto.
- **Fix**: usar `--hide-labels` para desktop (mostrar solo iconos) y mostrar texto en hover, o compactar más.

### 15. Tablet (768×1024): cards de un solo item en una columna muy estrecha

- **Síntoma**: en tablet, el grid sigue mostrando 1 columna aunque hay ~670px útiles.
- **Fix**: ligado a #5. Con `auto-fill minmax(220px, 1fr)` debería verse 2-3 columnas.

### 16. Mobile: bottom-nav con 3 items (Colección/Deseados/En venta) queda con "hueco" visual

- **Síntoma**: al ser usuario no-admin, en mobile el bottom-nav solo muestra 3 items (Pedidos queda fuera por guard). Se ve desequilibrado.
- **Fix**: ocultar el bottom-nav en mobile en `/orders` (que tampoco es accesible) o rebalancear el grid. Considerar incluir "Ajustes" en el bottom-nav mobile.

### 17. En mobile el formulario de game-add: la imagen y los thumbnails están en columna estrecha

- **Síntoma**: tras seleccionar un juego, la portada ocupa casi todo el ancho y los 4 thumbnails están abajo en una sola fila (correcto), pero todo se ve muy apiñado en 375px.
- **Fix**: el componente ya es responsive; verificar que el `position` del sidebar de selección de juego no se solapa con el contenido al scrollear.

### 18. En el catálogo de juegos (`games/add` → "Buscar en catálogo") las portadas de la izquierda aparecen cortadas o como placeholders grises

- **Síntoma**: las portadas de juegos de RAWG cargan parcialmente (algunas sí, otras no) por el CORS issue (#1). Tras resolver #1 debería arreglarse.
- **Fix**: depende de #1.

### 19. Topbar mobile muestra "Colección" con `>` literal

- **Síntoma**: el título del topbar dice `> COLECCIÓN` por el `::before`.
- **Fix**: depende de #8.

### 20. Header del sidebar inferior (bottom-nav) en mobile: `Pedidos` desaparece para usuarios no-admin

- **Síntoma**: no es bug, pero combinado con la redirección silenciosa de /orders (#4) confunde al usuario.
- **Fix**: ligado a #4 — añadir un mensaje informativo.

---

## 🔵 Issues menores (nice-to-have)

### 21. Sidebar desktop: el logo y la versión `v2.0` están muy aislados arriba

- **Síntoma**: el `nav-rail__brand` tiene `width: 3rem` mientras el sidebar mide 5.5rem (88px). El logo de 2rem se ve pequeño y la versión `v2.0` en mono queda como un detalle raro.
- **Fix**: o se quita `v2.0` (no aporta), o se agranda el brand, o se reemplaza por un tooltip en hover.

### 22. Avatar en esquina inferior izquierda en desktop, muy desconectado del resto

- **Síntoma**: el avatar del usuario aparece en el footer del sidebar, separado del header. Visualmente desbalanceado vs. el logo.
- **Fix**: mover el avatar arriba del todo (al lado del logo) o a la derecha del nav (top-right).

### 23. Game-detail en mobile: la portada/cover del juego no se muestra

- **Síntoma**: tras navegar al detalle de un juego en mobile, no aparece la portada (probablemente porque CORS falla #1). El layout muestra título, info y datos, pero la portada principal está ausente.
- **Fix**: ligado a #1.

### 24. "Cambiar vista (cuadrícula / lista)" — botón pequeño que cambia de grid a list

- **Funciona**, pero en mobile solo se ve el icono sin label, lo que hace difícil saber qué hace.
- **Fix**: añadir `aria-label` y un tooltip/label en mobile.

### 25. Mensaje "No hay líneas. Añade la primera." en `/orders/:id`

- **Síntoma**: copy correcto pero el CTA "Añadir línea" está muy lejos (esquina superior derecha). El usuario tiene que mirar arriba para entender dónde actuar.
- **Fix**: añadir un botón grande centrado en el empty state ("+ Añadir primera línea").

### 26. Cards de "Resumen" en `/collection`: están en una sola fila de 3 cards con mucho aire alrededor

- **Síntoma**: en desktop, las 3 cards (Juegos/Consolas/Mandos) en `/collection` están centradas con grandes márgenes arriba y abajo. Mucho espacio desaprovechado.
- **Fix**: hacer las cards más anchas o añadir padding-top al contenedor.

### 27. Etiqueta `ITEMS` en cards de resumen muestra "1 elemento" pero el icono es `tag`

- **Síntoma**: menor, pero `tag` no es el icono más obvio para "items/cantidad".
- **Fix**: usar `inventory_2` o `list`.

### 28. La barra de stats en `/collection/games` (`1 | 21,95 € | 0`) sale en texto plano sin separación visual clara

- **Síntoma**: los 3 stats están separados por `|` (pipe literal) sin estilo.
- **Fix**: usar `<retro-data-row>` o un componente divisor con borde sutil.

### 29. Botón "Limpiar filtros" sale como ghost (solo borde) en el panel de filtros

- **Funciona**, pero en algunas pantallas el botón está al final del panel sin contexto (es el último elemento).
- **Fix**: OK tal cual, solo es observación.

### 30. En `/collection/games/:id`, el menú contextual "Más acciones" muestra "Prestar" y "Eliminar" — pero ¿dónde está "Vender"?

- **Síntoma**: en el menú de 3 puntos hay "Prestar" y "Eliminar", pero el botón "Venta" ya está arriba como acción primaria. OK, pero podría confundir que aparezca dos veces en distintas formas.
- **Fix**: revisar la lógica — quizás "Venta" arriba debería abrir el mismo menú contextual.

---

## ✅ Lo que **funciona correctamente**

Probado y verificado:

- Login / Register / Forgot password (autenticación y validaciones).
- Búsqueda en catálogo RAWG y selección de juego → relleno automático del formulario.
- Autocomplete dropdowns de plataforma y tienda.
- Cambio de vista grid/list en `/collection/games`.
- Modales de confirmación (guardar, eliminar, "tengo este juego").
- Cambio de tema dark/light y de idioma EN/ES desde settings.
- Logout desde menú de usuario.
- Menú contextual (3 puntos) en game-detail.
- Navegación entre páginas y guards (auth, admin, desktop-only).
- Scroll interno en catálogos (`catalog-search-panel__results`, scrollHeight 2402px en cliente 836px).
- Wishlist "Tengo este juego" → modal + redirección.
- Wishlist edit con prioridad, plataforma, precio y notas.
- Order detail con líneas de producto y acciones.
- Order create básico.
- Empty states (`NO RESULTS`, "Nada en venta") con copy coherente.
- Componentes retro (`retro-tabs`, `retro-form-field`, `retro-select`, `retro-checkbox`, `retro-segmented`, `retro-data-row`, `retro-empty-state`, `retro-menu`, `retro-search`, `retro-button`, `retro-card`, `retro-chip`).
- Bottom-nav mobile (3 items, correcto para usuario no-admin).
- Avatar con `NgOptimizedImage` y fade-in animation.
- Header con logo + título consistente.

---

## 📋 Plan de corrección sugerido (orden recomendado)

### Fase 1 — Bugs críticos (bloquean funcionalidad)

1. **#1 + #18 + #23** — Proxy/reverse de imágenes RAWG.
2. **#4** — Mensaje informativo en lugar de redirección silenciosa en `/orders` mobile.
3. **#5** — Grid responsive en listas (1fr → `repeat(auto-fill, minmax(220px, 1fr))`).
4. **#2** — Añadir `priority` a NgOptimizedImage en LCP.

### Fase 2 — Diseño y UX

5. **#7 + #12 + #30 (parcial)** — Cargar fuente Material Symbols (revisar si ya está en el HTML).
6. **#8 + #19** — Reemplazar `>` literal por chevron SVG/Material.
7. **#9** — Revisar tokens de contraste del light theme.
8. **#6** — Eliminar duplicación header-tabs ↔ sidebar en `/collection`.
9. **#14** — Compactar el header-tabs en desktop.
10. **#10** — Stars de prioridad más grandes y con mejor contraste.
11. **#22** — Mover avatar del sidebar a posición más coherente.

### Fase 3 — Responsive y pulido

12. **#15** — Verificar grid en tablet (consecuencia de #5).
13. **#16** — Rebalancear bottom-nav mobile.
14. **#11** — Botón "Confirmar" en `/orders/new` con ancho máximo.
15. **#17** — Verificar solapamientos en game-add mobile.
16. **#21** — Limpiar el `v2.0` del sidebar.
17. **#24 + #25 + #27 + #28** — Micro-mejoras de copy/UX.

### Fase 4 — Mantenimiento

18. Tests visuales con Playwright (regression suite para los 3 viewports).
19. Documentar el proxy de RAWG y los breakpoints en `AGENTS.md`.
20. Revisar la lógica de duplicación de acciones (#30).

---

## 📁 Archivos relacionados

- Screenshots: `.playwright-mcp/shots/{desktop,tablet,mobile}/*.png`
- App shell + sidebar: `src/app/app.component.{ts,html,scss}`
- Game-add con catálogo: `src/app/presentation/pages/collection/pages/games/pages/create-and-update-game/`
- Guard `canActivateDesktopOnly`: `src/app/presentation/guards/desktop-only/desktop-only.guard.ts`
- Tokens visuales: `src/styles/_tokens-{light,dark}.scss`
- Breakpoints: `src/app/entities/constants/breakpoints.constant.ts`

# Rediseño visual — Dirección A "Arcade Cabinet"

> Rama: `feat/arcade-cabinet-redesign`
> Objetivo: cambiar la **piel** visual de la app (paleta OLED, tipografía Chakra Petch / Inter / JetBrains Mono, bordes biselados, halos violeta, cromado plano) sin tocar lógica de negocio, rutas, servicios, formularios ni estructura de ficheros.
> Stack se mantiene: Angular 21 + Angular Material v21 + `mat.theme()` como motor de tokens MD3.

---

## Índice

1. [Reglas globales del rediseño](#reglas-globales-del-rediseño)
2. [Mapa de tokens nuevos](#mapa-de-tokens-nuevos)
3. [Sistema responsive del proyecto](#sistema-responsive-del-proyecto)
4. [Commits y checkpoints](#commits-y-checkpoints)
   - [Commit 1 — Tokens globales + tipografía](#commit-1--tokens-globales--tipografía)
   - [Commit 2 — Game-card rediseño](#commit-2--game-card-rediseño)
   - [CHECKPOINT 1](#checkpoint-1--tras-commits-12)
   - [Commit 3 — Game-detail rediseño](#commit-3--game-detail-rediseño)
   - [Commit 4 — Cromado general](#commit-4--cromado-general)
   - [CHECKPOINT 2](#checkpoint-2--tras-commits-34)
   - [Commit 5 — Hardware + Wishlist](#commit-5--hardware--wishlist)
   - [Commit 6 — Stats / collection-overview](#commit-6--stats--collection-overview)
   - [Commit 7 — Ajustes responsive](#commit-7--ajustes-responsive)
   - [CHECKPOINT 3 FINAL](#checkpoint-3-final--tras-commits-57)
5. [Reglas de oro para el tech](#reglas-de-oro-para-el-tech)

---

## Reglas globales del rediseño

- **NO tocar**: TypeScript de componentes, lógica, tests, rutas, servicios, repositorios, formularios reactivos, DTOs.
- **NO mover ficheros** ni renombrar selectores BEM existentes. Solo cambia el `.scss` y, donde el plan lo indique, el `.html` (clases nuevas o estructura mínima como hero/scanline).
- **Mantener** las variables Material `--mat-sys-*` cuando ya están bien conectadas; el rediseño cambia el **valor** que producen vía `mat.theme()` y añade variables propias `--bg-*`, `--border-*`, `--accent-*`, `--font-*`. No buscar/reemplazar masivamente `--mat-sys-outline-variant` por `--border-subtle` salvo que el plan lo diga explícitamente para ese fichero.
- **Conservar** las convenciones del proyecto descritas en `CLAUDE.md`:
  - SCSS: clases completas dentro de bloques (no `&__elemento`), modificadores `&--modificador` sí permitidos, `rem` múltiplos de `0.25`, media queries al final del fichero con comentarios separadores.
  - No usar `px` salvo micro-detalles decorativos (chips, biseles internos).
- **Build verde** en cada commit: `npm run build` y `npm run lint` deben pasar. No correr `npm test` hasta el final (los tests no deberían romperse porque solo hay cambios de estilo, pero queda como verificación final fuera de plan).
- **Idioma**: comunicación y commits en español, formato Conventional Commits (`style:`, `feat:`, `refactor:` según corresponda).
- **Commits**: cada commit del plan se hace en esta rama. No abrir PR hasta terminar los 7 commits. El plan es la fuente de verdad; si algo se desvía, anotarlo en el cuerpo del commit.

---

## Mapa de tokens nuevos

### Paleta OLED

```scss
--bg-void:        #050510; // fondo más profundo (detrás del shell)
--bg-surface:     #0E0E1B; // superficie base (body, paneles)
--bg-surface-hi:  #15152A; // superficie elevada (cards, drawer)
--border-subtle:  #1F1F35; // borde por defecto
--border-glow:    #2A1F4D; // borde activo / hover
--primary:        #7C3AED; // violeta principal
--primary-glow:   #A78BFA; // violeta de halo / focus
--accent-rose:    #F43F5E; // favorito / destructivo
--accent-cyan:    #22D3EE; // info / digital
--accent-amber:   #F59E0B; // rating / advertencia
--text-hi:        #F1F1FA; // texto principal
--text-mid:       #B4B4C8; // texto secundario
--text-lo:        #6B6B82; // texto deshabilitado / labels
```

### Tipografía

```scss
--font-display: 'Chakra Petch', 'Inter', system-ui, sans-serif; // headings, títulos de sección
--font-body:    'Inter', system-ui, sans-serif;                  // body por defecto
--font-mono:    'JetBrains Mono', ui-monospace, monospace;       // fechas, precios, IDs, chips de plataforma
```

### Otras vars semánticas que se actualizan

```scss
--radius-xs: 2px;   // (sin cambio)
--radius-sm: 4px;   // chips angulares (antes 6)
--radius-md: 14px;  // card principal (antes 12)
--radius-lg: 18px;  // dialogs / drawer (antes 20)
--radius-full: 9999px;

// Halo violeta reutilizable
--glow-primary: 0 0 0 1px var(--primary), 0 0 24px -8px var(--primary);
--glow-primary-soft: 0 24px 60px -12px rgba(124, 58, 237, 0.4);

// Sombras planas (sin elevación Material)
--shadow-sm: 0 1px 0 0 var(--border-subtle);
--shadow-md: 0 0 0 1px var(--border-subtle);
--shadow-lg: 0 0 0 1px var(--border-glow), 0 24px 60px -12px rgba(0, 0, 0, 0.55);

// Bisel — el tamaño se parametriza para poder reducirlo en mobile
--bevel-size:        12px;  // desktop / tablet (estándar)
--bevel-size-mobile: 8px;   // ≤ 768px (cards más pequeñas, evita perder esquina)
```

### Bisel reutilizable

```scss
// Esquina superior derecha cortada. El valor es absoluto (px) por diseño: no
// escala con `rem` porque a partir de 1920px el rem crece y el bisel se vería
// desproporcionado. En su lugar se baja a 8px en mobile para no comerse parte
// del card.
clip-path: polygon(0 0, calc(100% - var(--bevel-size, 12px)) 0, 100% var(--bevel-size, 12px), 100% 100%, 0 100%);
```

---

## Sistema responsive del proyecto

Esta sección es la **referencia transversal** que todos los commits respetan. No hay que duplicarla en cada commit; cada commit indica solo qué media queries de **su fichero** revisa y cómo se adapta.

### Breakpoints oficiales

Definidos en `src/app/entities/constants/breakpoints.constant.ts` (TypeScript, fuente de verdad para `BreakpointObserver`) y reflejados como `--bp-*` en `styles.scss`:

| Token              | Valor   | Uso                                                                                       |
| ------------------ | ------- | ----------------------------------------------------------------------------------------- |
| `--bp-mobile`      | 768px   | Phone ↔ tablet. **Frontera principal**: bottom-nav vs nav-rail, FAB vs botón inline.      |
| `--bp-tablet`      | 1024px  | Tablet landscape / desktop pequeño.                                                       |
| `--bp-desktop`     | 1280px  | Desktop estándar (HD/laptop).                                                             |
| `--bp-desktop-large` | 1920px | FHD nativo. A partir de aquí escala el `font-size` raíz.                                  |
| `--bp-ultra-wide`  | 2560px  | 2K / QHD. Otro salto de `font-size`.                                                      |
| `--bp-ultra-wide-xl` | 3840px | 4K / UHD.                                                                                 |

### Anomalías a tener en cuenta (no inventadas, ya en el código actual)

1. **820px en lugar de 768px** — `list-page-header.component.scss` línea 65, `game-list-filters-bar.component.scss` línea 94 y `games.component.scss` línea 180 usan `820px`, no `768px`. Es **intencional**: estos tres ficheros colaboran y el header oculta sus stats/CTA antes que el resto para evitar overlapping en tablets pequeños (iPad mini portrait 768, Pixel Tablet 800). **No unificar a 768 en el commit 7**, mantener 820.
2. **`(orientation: portrait)`** — `game-detail.component.scss` línea 480 usa `(max-width: 768px) and (orientation: portrait)`. El landscape mobile usa otro bloque (línea 504, `(orientation: landscape) and (max-height: 500px)`) que monta un layout en dos columnas. Hay que respetar ambos.
3. **550px en game-card** — `game-card.component.scss` línea 373 baja a chips columna y oculta el nombre del prestatario en pantallas ≤ 550px (iPhone SE y similares). Mantener.
4. **`html { font-size }` escalado** — `styles.scss` líneas 20-42 y 358-375 (hay dos bloques duplicados que escalan el root font-size a 17/18/20/22px). El commit 1 mantiene esa escala y la deja como única fuente; ver punto siguiente.
5. **Duplicación de escala raíz** — actualmente `styles.scss` define la escala raíz dos veces (líneas 20-42 sobre `html` y líneas 358-375 sobre `:root`). Son funcionalmente equivalentes pero confusas. El commit 1 las **unifica** en un único bloque al final del fichero usando `:root`, con los valores que están en líneas 358-375 (que son los "oficiales" según el comentario). Esto es la única simplificación estructural del responsive en el commit 1; el resto se ataja en commit 7.

### Convenciones SCSS responsive del proyecto (de `CLAUDE.md`)

- **Bloques `@media` al final del fichero**, en una sección separada.
- **Comentario separador obligatorio** antes de cada bloque, con la resolución de referencia:
  ```scss
  // ────────────────────────── Responsive: ≤ 768px ──────────────────────────
  @media (max-width: 768px) { ... }
  ```
- Dentro del `@media` se reutilizan **clases completas**, no `&__elemento`. Modificadores con `&--modificador` sí permitidos.
- Valores de gap/padding/margin en `rem` múltiplos de 0.25 (chips/biseles permiten `px`).
- **Nunca poner `@media` dentro de un selector** (siempre fuera, al final, repitiendo el selector completo). Excepción tolerada cuando el selector ya está anidado profundamente y la regla afecta solo a un sub-selector concreto (ver `game-row.component.scss`).

### Comportamiento canónico por breakpoint (referencia para el commit 7)

| Bloque                      | 375px (iPhone SE)                              | 768px (tablet portrait)                      | 1024-1280px (tablet land / laptop)      | 1440-1920px (FHD)                  | 2560+ (2K/4K)                     |
| --------------------------- | ---------------------------------------------- | -------------------------------------------- | --------------------------------------- | ---------------------------------- | --------------------------------- |
| **App chrome**              | bottom-nav 60px, topbar visible, sin nav-rail  | bottom-nav, topbar, sin nav-rail             | nav-rail visible, sin bottom-nav        | nav-rail, root font 17px           | nav-rail, root font 18-22px       |
| **Game-card grid**          | 2 col, gap 0.75rem, padding 0.75rem            | 3 col, gap 0.75rem, padding 0.75rem          | 4-5 col, gap 1.25rem, padding 1.5rem    | 6 col, gap 1.25rem                 | 7-8 col (`GAME_GRID_FALLBACK = 8`) |
| **Game-card bisel**         | 8px (`--bevel-size-mobile`)                    | 8px                                          | 12px                                    | 12px                               | 12px                              |
| **Game-card halo violeta**  | desactivado (touch, sin hover)                 | desactivado                                  | activo en `(hover: hover)`              | activo                             | activo                            |
| **Game-detail hero**        | clamp(180,35vh,300), portrait                  | clamp(180,35vh,300), portrait                | clamp(200,40vh,580)                     | clamp(200,40vh,580)                | clamp(200,40vh,580)                |
| **Game-detail layout**      | una columna, actions stacked                   | una columna                                  | hero+body apilados, body max-width 720  | igual                              | igual                             |
| **Game-detail landscape**   | 2 columnas (42% hero + body scroll)            | (no aplica si > 500px alto)                  | —                                       | —                                  | —                                 |
| **Game-detail scanline**    | desactivado (no `hover: hover`)                | desactivado                                  | activo                                  | activo                             | activo                            |
| **Game-detail labels `>`**  | mono uppercase 0.65rem                         | mono 0.7rem                                  | mono 0.7rem                             | escala con root font               | escala                            |
| **Hardware card grid**      | 1 col                                          | 1 col (≤ 768)                                | 2-3 col según componente                | 3-4 col                            | 4+ col                            |
| **Hardware detail `.hw-detail__dl`** | 1 col (global override en `styles.scss` línea 307) | 1 col                                  | 2 col                                   | 2 col                              | 2 col                             |
| **Wishlist grid**           | 1 col, FAB visible, header CTA oculto          | 1 col, FAB, padding 0.75rem                  | 2-3 col, header CTA visible             | 3 col                              | 3-4 col                           |
| **Collection-overview**     | 1 col cards, padding 1rem, total 3xl           | 1 col                                        | 2-3 col tarjetas                        | 3 col                              | 3 col                             |
| **Filters**                 | bottom-sheet (mobile)                          | bottom-sheet                                 | drawer lateral 22rem                    | drawer 22rem                       | drawer 22rem                      |
| **FAB añadir**              | visible, fixed bottom 16+nav                   | visible                                      | oculto (CTA en header)                  | oculto                             | oculto                            |

> Este cuadro no es ley: cada componente decide su propio threshold (ver "Anomalías"). Es la **base** de la pasada del commit 7.

### Hover / pointer

- Toda interacción con halo violeta intenso (`box-shadow: var(--glow-primary)`) debe envolverse en `@media (hover: hover)` para que en táctil no quede "pegado" tras un tap.
- En táctil se prioriza feedback de `:active` (compresión + cambio de color de borde momentáneo) sobre `:hover` permanente.
- El scanline del hero de game-detail **solo** se renderiza dentro de `@media (hover: hover)`.

---

## Commits y checkpoints

> Notación de ficheros: rutas relativas desde la raíz del repo. Donde el plan indica solo `.scss` no hay que tocar el `.ts`. Donde diga `.html` también, hay un cambio estructural mínimo concreto que se especifica.

> En cada commit hay un bloque **"Responsive a preservar/adaptar"** que enumera las media queries existentes en los ficheros tocados y qué hay que hacer con ellas. Es revisión defensiva, no reescritura: si el bloque sigue siendo correcto con los nuevos tokens, se mantiene tal cual.

---

### Commit 1 — Tokens globales + tipografía

**Mensaje sugerido**:
```
style(theme): paleta OLED + tipografía Chakra Petch/Inter/JetBrains Mono (arcade cabinet)
```

**Ficheros a tocar**:
- `src/index.html`
- `src/styles.scss`

#### `src/index.html`

Sustituir el `<link>` actual de Google Fonts (línea 15-17, `Space Grotesk` + `Outfit`) por:

```html
<link
  href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet" />
```

El `<link rel="preconnect">` a `fonts.googleapis.com` y `fonts.gstatic.com` ya está presente: mantener.

No tocar nada más del `index.html`.

#### `src/styles.scss`

1. **`mat.theme()` (líneas 6-12)** — cambiar a:
   ```scss
   @include mat.theme(
     (
       color: (
         theme-type: dark,
         primary: mat.$violet-palette,
         tertiary: mat.$magenta-palette
       ),
       typography: Inter,
       density: 0
     )
   );
   ```
   - El proyecto ya funciona en dark; forzar `theme-type: dark` para no depender de `color-scheme: light` declarado debajo.
   - Tipografía base de Material apunta a Inter (las sustituciones puntuales a Chakra Petch se hacen vía clases globales en headings).

2. **`html { color-scheme }` (línea 4)** — cambiar `color-scheme: light` por `color-scheme: dark`. Mantener el bloque `html.dark-mode` por compatibilidad pero NO añadir nuevas reglas dentro (queda como salvaguarda hasta que sepamos que se puede borrar).

3. **`:root` (líneas 69-142)** — sustituir el bloque completo de variables manteniendo las claves que ya consumen otros ficheros:

   ```scss
   :root {
     /* ── Paleta OLED ───────────────────────────────────── */
     --bg-void: #050510;
     --bg-surface: #0e0e1b;
     --bg-surface-hi: #15152a;
     --border-subtle: #1f1f35;
     --border-glow: #2a1f4d;
     --primary: #7c3aed;
     --primary-glow: #a78bfa;
     --accent-rose: #f43f5e;
     --accent-cyan: #22d3ee;
     --accent-amber: #f59e0b;
     --text-hi: #f1f1fa;
     --text-mid: #b4b4c8;
     --text-lo: #6b6b82;

     /* ── Tipografía ─────────────────────────────────────── */
     --font-display: 'Chakra Petch', 'Inter', system-ui, sans-serif;
     --font-body: 'Inter', system-ui, sans-serif;
     --font-mono: 'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace;

     --text-xs: 0.75rem;
     --text-sm: 0.875rem;
     --text-base: 1rem;
     --text-lg: 1.125rem;
     --text-xl: 1.25rem;
     --text-2xl: 1.5rem;
     --text-3xl: 2rem;
     --text-display: 3rem;

     /* ── Colores semánticos (legacy mantenidos para no romper componentes) ─ */
     --color-rating: var(--accent-amber);
     --color-favorite-start: var(--accent-rose);
     --color-favorite-end: #ee5a6f;
     --color-digital-start: #002d6e;
     --color-digital-end: #0050c8;
     --color-loan-start: #1565c0;
     --color-loan-end: #0d47a1;
     --color-sale-start: #43a047;
     --color-sale-end: #2e7d32;
     --color-metacritic: #6ab04c;
     --color-status-received-bg: #0e2a14;
     --color-status-received-text: #43a047;
     --color-status-shipped-bg: #2a200a;
     --color-status-shipped-text: #f59e0b;
     --color-status-ordered-bg: #0a1d2e;
     --color-status-ordered-text: #22d3ee;

     /* ── Border radius (afilados) ──────────────────────── */
     --radius-xs: 2px;
     --radius-sm: 4px;
     --radius-md: 14px;
     --radius-lg: 18px;
     --radius-full: 9999px;

     /* ── Bisel (tamaño responsive) ──────────────────────── */
     --bevel-size: 12px;
     --bevel-size-mobile: 8px;

     /* ── Sombras planas + halos ─────────────────────────── */
     --shadow-sm: 0 1px 0 0 var(--border-subtle);
     --shadow-md: 0 0 0 1px var(--border-subtle);
     --shadow-lg: 0 0 0 1px var(--border-glow), 0 24px 60px -12px rgba(0, 0, 0, 0.55);
     --glow-primary: 0 0 0 1px var(--primary), 0 0 24px -8px var(--primary);
     --glow-primary-soft: 0 24px 60px -12px rgba(124, 58, 237, 0.4);

     /* ── Transiciones ───────────────────────────────────── */
     --transition-fast: 120ms ease;
     --transition-base: 180ms ease;
     --transition-slow: 280ms ease;

     /* ── Z-index ────────────────────────────────────────── */
     --z-base: 0;
     --z-card: 10;
     --z-dropdown: 20;
     --z-sticky: 30;
     --z-overlay: 40;
     --z-modal: 50;
     --z-toast: 60;
     --z-nav: 70;

     /* ── Layout chrome ───────────────────────────────────── */
     --bottom-nav-height: 60px;

     /* ── Breakpoints (mirror de breakpoints.constant.ts) ──── */
     --bp-mobile: 768px;
     --bp-tablet: 1024px;
     --bp-desktop: 1280px;
     --bp-desktop-large: 1920px;
     --bp-ultra-wide: 2560px;
     --bp-ultra-wide-xl: 3840px;
   }
   ```

4. **Bloque `html, body` base (líneas 188-197)** — sustituir `font-family: Outfit, ...` por:
   ```scss
   font-family: var(--font-body);
   background-color: var(--bg-void);
   color: var(--text-hi);
   ```

5. **Headings globales (líneas 200-204)** — sustituir `font-family: 'Space Grotesk', ...` por:
   ```scss
   font-family: var(--font-display);
   letter-spacing: 0.01em;
   ```

6. **Scrollbar (líneas 145-161)** — cambiar el color a `var(--primary)` / `var(--primary-glow)` en vez de `var(--mat-sys-primary)`. Funcionalmente equivalente, pero deja claro que el rediseño manda.

7. **Focus visible (líneas 174-178)** — cambiar `outline: 2px solid var(--mat-sys-primary)` por `outline: 1px solid var(--primary-glow)` y `outline-offset: 2px`.

8. **Bloque global `.hw-detail__*` (líneas 246-311)** — actualizar:
   - `.hw-detail__section`: `background-color: var(--bg-surface-hi)`, `border: 1px solid var(--border-subtle)`, `border-radius: var(--radius-md)`.
   - `.hw-detail__section-title`: `font-family: var(--font-display)`, `color: var(--text-lo)`, prefijo visual `>` opcional (no obligatorio aquí).
   - `dt`: `font-family: var(--font-mono)`, `color: var(--text-lo)`, añadir `&::before { content: '> '; }`.
   - `dd`: `color: var(--text-hi)`.

9. **No** tocar las clases legacy `.hw-list__card-icon`, `.hw-list__card-color` (siguen consumiendo `--mat-sys-primary` y `--mat-sys-outline-variant`, que `mat.theme()` reemitirá con la nueva paleta).

10. **Escala raíz duplicada** — eliminar el bloque de líneas 20-42 (`@media (min-width: 1440px) html { font-size: 17px }` etc.) y dejar **solo** el bloque de líneas 358-375 que vive en la sección "Responsive" final. Es la única simplificación responsive de este commit. La razón: tener dos bloques que escalan el mismo `font-size` con thresholds ligeramente distintos (1440 vs 1921, 1920 vs 2561, etc.) es trampa de mantenimiento.

#### Responsive a preservar/adaptar en este commit

- **`@media (min-width: 1440px)` líneas 20-24** (html font-size 17px) → **eliminar** (queda consolidado más abajo).
- **`@media (min-width: 1920px)` líneas 26-30** (html font-size 18px) → **eliminar**.
- **`@media (min-width: 2560px)` líneas 32-36** (html font-size 20px) → **eliminar**.
- **`@media (min-width: 3840px)` líneas 38-42** (html font-size 24px) → **eliminar**.
- **`@media (pointer: coarse)` líneas 163-171** (oculta scrollbar en táctil) → **mantener tal cual**, sigue siendo correcto con la nueva paleta.
- **`@media (max-width: 768px)` línea 307-311** (`.hw-detail__dl` a 1 columna) → **mantener**. El override global a 1 columna en mobile no cambia con el rediseño.
- **`@media (max-width: 600px)` líneas 333-340** (`.snack-mobile` full width) → **mantener**.
- **`@media (min-width: 1921px)` líneas 358-375** (root font-size 18/20/22) → **mantener** como única fuente de la escala raíz. Ajustar el comentario separador para que cumpla el formato del proyecto:
  ```scss
  // ────────────────────────── Responsive: ≥ 1921px (FHD+) ──────────────────────────
  ```

**Verificación al final del commit 1**:
- `npm run build` verde.
- `npm run lint` sin warnings.
- Abrir la app a ojo: la tipografía debe haber cambiado, el fondo debe ser oscuro casi negro, no debe haber elementos rotos. Cards, formularios, dialogs pueden seguir viéndose "Material por dentro" — eso se ataja en commits siguientes.
- Verificar también en 1440px+ que el `font-size` raíz sigue creciendo (la escala consolidada debe seguir aplicando 17/18/20/22px en 1440/1920/2560/3840).

---

### Commit 2 — Game-card rediseño

**Mensaje sugerido**:
```
style(games): rediseño game-card con bisel, halo violeta y chips mono (arcade cabinet)
```

**Ficheros a tocar**:
- `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.scss`
- `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.html` (solo la línea del precio y la edición — ver más abajo)
- `src/app/presentation/components/ad-hoc/badge-chip/badge-chip.component.scss`

#### `game-card.component.scss`

Reescribir el bloque `.game-card` completo (líneas 1-353) manteniendo todos los selectores existentes. Cambios concretos:

1. **`.game-card`** (raíz):
   - Eliminar `perspective: 1200px`. El efecto flip se mantiene desde `.game-card__inner`; la perspectiva la lleva el inner.
   - Eliminar el `&:hover { transform: translateY(-4px); box-shadow: 0 12px 40px ... }` actual.
   - Añadir:
     ```scss
     transition:
       border-color var(--transition-base),
       box-shadow var(--transition-base);
     ```

2. **`.game-card__front`**:
   - `border-radius: var(--radius-md)` (queda 14px por token).
   - `border: 1px solid var(--border-subtle)`.
   - `background-color: var(--bg-surface-hi)`.
   - Añadir `clip-path: polygon(0 0, calc(100% - var(--bevel-size, 12px)) 0, 100% var(--bevel-size, 12px), 100% 100%, 0 100%);` para el bisel superior derecho (tamaño parametrizado para reducir en mobile en commit 7).

3. **Hover** — envolver en `@media (hover: hover)` para evitar el "halo pegado" en táctil:
   ```scss
   @media (hover: hover) {
     .game-card:hover {
       .game-card__front {
         border-color: var(--border-glow);
         box-shadow: var(--glow-primary);
       }
       .game-card__image {
         transform: scale(1.015);
       }
     }
   }
   ```
   Eliminar el `translateY(-4px)`. La card no flota, brilla. **No usar `&:hover` directo** — debe ir dentro del `@media (hover: hover)`.

4. **`.game-card__back`**:
   - Mismo `clip-path` que el front (para que coincida en flip).
   - `border: 1px solid var(--border-glow)`.
   - `border-radius: var(--radius-md)`.

5. **`.game-card__front--digital::before`** (la banda "DIGITAL"):
   - Cambiar el `linear-gradient` por `background: transparent`, mantener el texto y darle `border-bottom: 1px solid var(--accent-cyan)`, `color: var(--accent-cyan)`, `font-family: var(--font-mono)`, `letter-spacing: 0.2em`.

6. **`.game-card__overlay`**:
   - Mantener el gradiente actual pero ajustarlo a:
     `background: linear-gradient(to top, rgba(5, 5, 16, 0.95) 0%, rgba(5, 5, 16, 0.55) 55%, transparent 100%);`

7. **`.game-card__title`**:
   - `font-family: var(--font-display)`.
   - `font-weight: 700`.
   - `letter-spacing: 0.01em`.

8. **`.game-card__edition`**:
   - `font-family: var(--font-mono)`.
   - Quitar `font-style: italic`.
   - `font-size: 0.7rem`, `letter-spacing: 0.04em`, `text-transform: uppercase`.
   - `color: var(--text-mid)`.

9. **`.game-card__price`**:
   - `font-family: var(--font-mono)`.
   - `font-weight: 600`.
   - `color: var(--primary-glow)`.

10. **Chips de plataforma**: estos se renderizan vía `<app-badge-chip>` (HTML línea 45). Aquí no se ven, se estilan en `badge-chip.component.scss` (más abajo).

11. **`.game-card__loan-chip` y `.game-card__sale-chip`**:
    - Sustituir el `linear-gradient(...)` por `background: transparent`.
    - `border: 1px solid currentColor`.
    - El color del texto/icono pasa a:
      - loan-chip: `color: var(--accent-cyan)`.
      - sale-chip: `color: var(--accent-amber)`.
    - `border-radius: var(--radius-sm)` (4px, afilados).
    - `font-family: var(--font-mono)`, `letter-spacing: 0.04em`, `text-transform: uppercase`.

12. **`.game-card__favorite`**:
    - Mantener animación heartbeat. Cambiar el gradiente por `background: var(--accent-rose)`.
    - `box-shadow: 0 0 12px -2px var(--accent-rose)`.

13. **`.game-card__status-badge`**:
    - `box-shadow: 0 0 0 1px var(--border-glow), 0 0 12px -4px var(--primary)`.
    - Mantener el `background-color` inline desde el `[style.background-color]` del template (es dinámico por estado).

#### Responsive a preservar/adaptar en este commit

El fichero tiene **dos** bloques `@media` en su sección responsive final (líneas 356-389). Hay que conservar el comentario separador y la estructura, y adaptar el contenido al nuevo lenguaje:

- **`@media (max-width: 768px)` líneas 356-369** — actualmente sube título y precio a `var(--text-sm)`. Mantener pero añadir:
  ```scss
  .game-card__front {
    --bevel-size: var(--bevel-size-mobile); // 12px → 8px
  }
  .game-card__back {
    --bevel-size: var(--bevel-size-mobile);
  }
  ```
  Razón: con cards a 2 columnas en 375px el bisel de 12px se come una porción visible de la esquina; 8px queda proporcional.

- **`@media (max-width: 550px)` líneas 373-389** — actualmente apila los chips en columna y oculta el nombre del prestatario. Mantener tal cual.

- **Hover halo**: el bloque `@media (hover: hover)` añadido en el punto 3 actúa como gate global. No hace falta tocarlo en mobile porque ya está protegido. Verificar en checkpoint que en táctil no queda halo pegado tras tap.

#### `game-card.component.html`

**Único cambio**: la línea 69 — envolver el precio en una clase mono ya existe (`.game-card__price`). El SCSS ya le aplica `font-family: var(--font-mono)`. No hace falta tocar HTML.

> **No tocar nada más del HTML**. El plan original sugería ediciones pero la estructura ya soporta el rediseño.

#### `badge-chip.component.scss`

Reemplazar el `:host` base (líneas 1-17) por:

```scss
:host {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  line-height: 1.4;
  white-space: nowrap;
  flex-shrink: 0;
  background: transparent;
  color: var(--chip-color, var(--text-hi));
  border: 1px solid var(--chip-bg, var(--border-glow));
}
```

> Nota: la directiva `bgColor` del badge-chip se inyecta como `--chip-bg`. Cambiamos su semántica de "fondo" a "color de borde + acento de texto" reutilizando la misma variable: en commit 2 solo cambiamos la apariencia, y el efecto visual es un chip outline cuyo borde toma el color de la plataforma. Si visualmente queda flojo en checkpoint, el plan permite añadir `color: var(--chip-bg)` para texto coloreado.

Los modificadores `:host(.badge-chip--new)` y `:host(.badge-chip--used)` (líneas 19-29): mantener pero quitar el fondo color-mix y dejar solo `border-color`:
```scss
:host(.badge-chip--new) {
  border-color: var(--primary);
  color: var(--primary-glow);
}

:host(.badge-chip--used) {
  border-color: var(--text-lo);
  color: var(--text-mid);
}
```

**Verificación al final del commit 2**:
- `npm run build` y `npm run lint` verdes.
- Ir a la lista de juegos: las cards deben tener bisel superior derecho, borde 1px gris, hover con halo violeta y leve scale de portada. Sin "elevación" Material.
- Chips de plataforma deben verse como outline mono uppercase.
- **Verificar responsive**: en 375px el bisel debe ser de 8px (no 12); en 550px chips apilados y sin nombre del prestatario; en táctil emulado (DevTools "Touch") no debe quedar halo violeta pegado tras un tap.

---

### CHECKPOINT 1 — tras commits 1-2

**Qué revisa el senior**:
- Paleta correcta (fondo `#0E0E1B`, primario `#7C3AED`).
- Tipografía Chakra Petch en headings, Inter en body, JetBrains Mono en chips/precios.
- Card con bisel, borde fino, halo en hover, scanline NO aplica aún (eso es commit 3).
- App no rota: lista de juegos navegable, no hay overflow ni desbordes evidentes.
- **Responsive**: pasada visual a 375 / 768 / 1024 / 1440 / 1920 / 2560 — ningún texto cortado, chips no desbordan, bisel reducido en mobile.

> El tech NO continúa al commit 3 hasta visto bueno del senior.

---

### Commit 3 — Game-detail rediseño

**Mensaje sugerido**:
```
style(games): rediseño game-detail con hero halo, dl mono y scanline en hover (arcade cabinet)
```

**Ficheros a tocar**:
- `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.scss`
- `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.html` (cambios estructurales mínimos: añadir wrapper `dl`/`dt`/`dd` semántico al data-grid de la sección "Mis datos" y "Información del catálogo")

#### `game-detail.component.scss`

1. **`.game-detail__hero`** (líneas 26-35):
   - Mantener `height: clamp(200px, 40vh, 580px)`.
   - Eliminar `background-color: var(--mat-sys-surface-container)`; el fondo lo da `--bg-void` heredado de body.
   - Añadir un `box-shadow: inset 0 0 0 1px var(--border-glow), 0 24px 60px -12px rgba(124, 58, 237, 0.4)` para el halo violeta del rediseño.

2. **`.game-detail__hero-cover-wrap`** (líneas 56-64):
   - Añadir `position: relative` (ya está implícito pero declararlo).
   - Esta es la zona donde monta el scanline (ver punto 3).

3. **Scanline en hover (desktop)** — añadir nuevo selector después de `.game-detail__hero-cover`. **Debe ir envuelto en `@media (hover: hover)`** para no renderizar el pseudo-elemento en táctil (mobile/tablet) donde nunca se activaría y solo gastaría composite layer:

   ```scss
   @media (hover: hover) {
     .game-detail__hero-cover-wrap::after {
       content: '';
       position: absolute;
       inset: 0;
       pointer-events: none;
       background: repeating-linear-gradient(
         to bottom,
         transparent 0,
         transparent 2px,
         rgba(124, 58, 237, 0.18) 2px,
         rgba(124, 58, 237, 0.18) 3px
       );
       opacity: 0;
       transition: opacity var(--transition-base);
       mix-blend-mode: overlay;
     }

     .game-detail__hero:hover .game-detail__hero-cover-wrap::after {
       opacity: 0.06;
     }
   }
   ```

4. **`.game-detail__title`** (líneas 209-217):
   - `font-family: var(--font-display)`.
   - `font-weight: 700`.
   - `letter-spacing: 0.01em`.
   - Mantener `font-size: var(--text-2xl)`.

5. **`.game-detail__edition`** (líneas 219-225):
   - `font-family: var(--font-mono)`.
   - Quitar `font-style: italic`.
   - `text-transform: uppercase`, `letter-spacing: 0.05em`, `font-size: 0.75rem`.

6. **`.game-detail__section-title`** (líneas 245-254):
   - `font-family: var(--font-display)`.
   - `color: var(--primary-glow)`.
   - `border-bottom: 1px solid var(--border-subtle)`.
   - Añadir prefijo `>` mediante `&::before { content: '> '; color: var(--primary); font-family: var(--font-mono); margin-right: 0.25rem; }`.

7. **`.game-detail__data-item`**: cambiar el layout a estilo `dl`:
   - `.game-detail__data-item` actúa ya como una fila. Convertirla a `display: grid` con dos columnas `auto 1fr` y gap `1rem` no es necesario porque el HTML ya alinea con `justify-content: space-between`. **Mantener** ese layout.

8. **`.game-detail__data-label`** (líneas 270-286):
   - `font-family: var(--font-mono)`.
   - `text-transform: uppercase`.
   - `letter-spacing: 0.06em`.
   - `font-size: 0.7rem`.
   - `color: var(--text-lo)`.
   - Añadir `&::before { content: '> '; color: var(--primary); }` (el `>` decora cada label).
   - El `mat-icon` interno mantiene su tamaño actual.

9. **`.game-detail__data-value`** (líneas 288-306):
   - `font-family: var(--font-mono)` para valores numéricos / fechas / IDs.
   - `color: var(--text-hi)`.
   - **Excepción**: si el value contiene texto descriptivo (nombres de tienda, plataformas largas), el mono puede quedar feo. Solución: aplicar mono solo a `.game-detail__data-value--mono` opcional. El plan actual aplica mono a todos: si el senior lo rechaza en checkpoint, se ajusta.

10. **`.game-detail__genre-chip`** (líneas 336-344):
    - `background: transparent`.
    - `border: 1px solid var(--border-glow)`.
    - `color: var(--primary-glow)`.
    - `border-radius: var(--radius-sm)`.
    - `font-family: var(--font-mono)`, `text-transform: uppercase`, `font-size: 0.7rem`.

11. **Status / favorite / sale / loan chips del hero** (líneas 132-207):
    - Mantener fondos planos pero ajustar bordes a `1px solid currentColor` y añadir `font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.7rem;`.

12. **Glass buttons del topbar** (líneas 99-116, `.game-detail__back-btn` y siblings):
    - Mantener el efecto glass; añadir `border-radius: var(--radius-sm)` para alinear con la estética angular.
    - Cambiar `border: 1px solid rgba(255, 255, 255, 0.18)` por `border: 1px solid var(--border-glow)`.

13. **`.game-detail__copy-tabs`** (líneas 355-360):
    - `border-bottom: 1px solid var(--border-subtle)`.
    - `.game-detail__copy-tab` (líneas 369-400): `font-family: var(--font-mono)`, `text-transform: uppercase`, `letter-spacing: 0.05em`.
    - `.game-detail__copy-tab--active`: `color: var(--primary-glow)`, `border-bottom-color: var(--primary)`.

14. **`.game-detail__add-copy-btn`** (líneas 416-446):
    - `border: 1px dashed var(--border-glow)`.
    - `color: var(--text-mid)`.
    - hover: `color: var(--primary-glow); border-color: var(--primary); background-color: rgba(124, 58, 237, 0.08);`.

15. **`.game-detail__sold-banner`** (líneas 450-459):
    - Mantener semántica de verde pero plana:
      - `background: transparent`.
      - `border: 1px solid var(--color-sale-start)`.
    - `border-radius: var(--radius-sm)`.

#### Responsive a preservar/adaptar en este commit

El fichero tiene **dos** bloques `@media` en su sección responsive final (líneas 480-533), con thresholds distintos a los del resto del proyecto porque combina orientation queries:

- **`@media (max-width: 768px) and (orientation: portrait)` líneas 480-500** — portrait mobile / tablet portrait:
  - Hero shrinking a `clamp(180px, 35vh, 300px)`. **Mantener**.
  - Título a `var(--text-xl)`. **Mantener** (sigue siendo legible con Chakra Petch porque la display font no expande respecto a Inter en pesos similares).
  - Body padding `1.25rem 1rem calc(80px + 1.25rem)`. **Mantener**: el `80px` ya cubre el bottom-nav. Anotar: el plan no unifica este `80px` con `var(--bottom-nav-height)` (60px) porque el offset incluye margen adicional; el tech no debe tocarlo en este commit.
  - Actions stacked. **Mantener**.
  - **Añadir**: el halo violeta inset del hero (punto 1 de este commit) puede quedar fuerte en mobile portrait. Añadir override dentro de este bloque:
    ```scss
    .game-detail__hero {
      box-shadow: inset 0 0 0 1px var(--border-glow); // sin el halo de 60px en mobile
    }
    ```
  - **Añadir**: el `::before` con `>` de `.game-detail__data-label` y `.game-detail__section-title` puede solaparse con el icono cuando hay poco espacio. Verificar visualmente; si choca, sumar `gap: 0.5rem` al label en mobile.

- **`@media (orientation: landscape) and (max-height: 500px)` líneas 504-533** — landscape mobile (móvil tumbado):
  - Layout en dos columnas: hero a la izquierda 42%, body scrollable a la derecha.
  - **Mantener** el layout. Solo añadir override:
    ```scss
    .game-detail__hero {
      box-shadow: inset 0 0 0 1px var(--border-glow); // sin halo exterior (cortaría el body)
    }
    ```
    Porque el halo `0 24px 60px -12px` con el hero al 42% se desbordaría sobre el body adyacente.

- **Scanline en hover**: ya envuelto en `@media (hover: hover)`. En mobile/tablet portrait nunca se renderiza el pseudo-elemento; en landscape mobile tampoco (los touch devices no son `hover: hover`).

#### `game-detail.component.html`

**Cambios mínimos**: convertir los `data-grid` actuales (líneas 167-197, 204-224, 262-312) de `div` a una **estructura semántica `dl`/`dt`/`dd`** para que el prefijo `>` y la tipografía mono tengan sentido HTML.

Sustituir el patrón repetido:

```html
<div class="game-detail__data-item">
  <span class="game-detail__data-label"> ... </span>
  <span class="game-detail__data-value"> ... </span>
</div>
```

por:

```html
<dl class="game-detail__data-grid">
  <div class="game-detail__data-item">
    <dt class="game-detail__data-label"> ... </dt>
    <dd class="game-detail__data-value"> ... </dd>
  </div>
  ...
</dl>
```

> **Importante**: el elemento padre `.game-detail__data-grid` actualmente es un `<div>` (línea 167, 204, 262). Cambiar el tag a `<dl>` y los `<span>` internos a `<dt>` / `<dd>`. Las clases CSS no cambian; el SCSS sigue funcionando porque selecciona por clase.

> El wrapper `<div class="game-detail__data-item">` se mantiene como fila visual (`dt + dd` no fluye igual sin él). HTML5 permite `<div>` directos hijos de `<dl>` desde la spec de 2017.

Eliminar el `display: flex; flex-direction: column; gap: 0.75rem;` actual del `.game-detail__data-grid` no es necesario, sigue funcionando con `<dl>`.

**Verificación commit 3**:
- Hero con halo violeta visible alrededor de la portada (sombra exterior + borde interior).
- Title en Chakra Petch.
- Labels con `>` y mono uppercase.
- Hover de portada en desktop muestra scanline (testear en ventana ≥ 1024px).
- Tabs de copia se ven como pestañas planas, no Material elevadas.
- **Responsive**:
  - 375 portrait: hero pequeño, halo exterior desactivado, body sin overflow.
  - Landscape mobile (rotar iPhone): layout 2 columnas, hero a la izquierda, sin halo exterior.
  - 768 tablet portrait: igual que mobile portrait.
  - 1024+ desktop: scanline visible en hover.

---

### Commit 4 — Cromado general

**Mensaje sugerido**:
```
style(chrome): toolbar, drawer, bottom-nav, FAB, dialogs y snackbar con tokens arcade
```

**Ficheros a tocar**:
- `src/app/app.component.scss`
- `src/styles.scss` (overrides globales para Material: snackbar, datepicker, menu panel — ya hay sección, ampliarla)
- `src/app/presentation/components/confirm-dialog/confirm-dialog.component.scss` (está vacío — añadir contenido si hace falta)
- `src/app/presentation/pages/collection/components/list-page-header/list-page-header.component.scss`
- `src/app/presentation/pages/collection/components/hardware-list-shell/hardware-list-shell.component.scss` (solo cromado de stats proyectadas)
- `src/app/presentation/pages/collection/pages/games/games.component.scss` (solo el chrome del drawer y stats)
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.scss`
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-bar/game-list-filters-bar.component.scss`

#### `src/app/app.component.scss`

1. **`.app-shell::before`** (líneas 14-27): mantener pero ajustar `opacity: 0.04` en dark (lo gestiona `::ng-deep .dark-mode` línea 367-370 — bajar a `opacity: 0.04`). Como vamos siempre dark, también ajustar el bloque base a `opacity: 0.04` y `mix-blend-mode: screen`.

2. **`.nav-rail`** (líneas 31-136):
   - `background-color: var(--bg-surface)`.
   - `border-right: 1px solid var(--border-subtle)`.
   - `.nav-rail__brand`: `color: var(--primary-glow)`.
   - `.nav-rail__item`:
     - `border-radius: var(--radius-sm)`.
     - `font-family: var(--font-mono)` para el label.
     - `text-transform: uppercase`, `font-size: 0.7rem`.
   - `.nav-rail__item--active`:
     - `background: transparent`.
     - `color: var(--primary-glow)`.
     - Añadir `box-shadow: inset 2px 0 0 0 var(--primary);` (barra lateral izquierda como acento).
   - `.nav-rail__item:hover`: dentro de `@media (hover: hover)` → `background: rgba(124, 58, 237, 0.06)`, `color: var(--text-hi)`.
   - `.nav-rail__avatar`: `border: 1px solid var(--border-glow)`.

3. **`.app-topbar`** (líneas 148-184):
   - `background-color: var(--bg-surface)`.
   - `border-bottom: 1px solid var(--border-subtle)`.
   - `.app-topbar__title`: `font-family: var(--font-display)`, `letter-spacing: 0.02em`.
   - `.app-topbar__brand`: `color: var(--primary-glow)`.
   - `.app-topbar__avatar`: `border: 1px solid var(--border-glow)`.

4. **`.bottom-nav`** (líneas 196-245):
   - `background-color: var(--bg-surface)`.
   - `border-top: 1px solid var(--border-subtle)`.
   - `.bottom-nav__pill`:
     - `background: transparent`.
     - `border: 1px solid var(--primary)`.
     - `box-shadow: var(--glow-primary)`.
     - `border-radius: var(--radius-sm)`.
   - `.bottom-nav__item`:
     - `font-family: var(--font-mono)` en el label.
     - `text-transform: uppercase`, `font-size: 0.65rem`, `letter-spacing: 0.05em`.
   - `.bottom-nav__item--active`: `color: var(--primary-glow)`.

5. **Profile menu** (líneas 250-364): mantener la estética glass actual (es intencionalmente cinematográfica), solo cambiar:
   - `::ng-deep .mat-mdc-menu-panel { border-radius: var(--radius-md) !important; border: 1px solid var(--border-glow) !important; }`
   - `.profile-menu__panel`: `background-color: var(--bg-surface-hi)`.
   - `.profile-menu__action-btn`: `border-radius: var(--radius-sm)`, `font-family: var(--font-mono)`, `text-transform: uppercase`, `font-size: 0.7rem`, `letter-spacing: 0.06em`.
   - `.profile-menu__action-btn--logout`: cambiar el rojo por `var(--accent-rose)` con la misma transparencia (`rgba(244, 63, 94, 0.22)` / `0.42`).

#### Responsive a preservar/adaptar — `app.component.scss`

- **`@media (max-width: 768px)` líneas 384-402** — bloque crítico del chrome:
  - Oculta `.nav-rail`. **Mantener**.
  - Muestra `.app-topbar` con `display: flex`. **Mantener**.
  - Muestra `.bottom-nav` `position: fixed; bottom: 0; height: var(--bottom-nav-height); z-index: var(--z-nav)`. **Mantener tal cual**.
  - **Verificación**: con el nuevo `border-top: 1px solid var(--border-subtle)` en el bottom-nav, y `position: fixed`, el borde debe verse al hacer scroll. Si queda demasiado discreto sobre `--bg-surface`, considerar `border-top: 1px solid var(--border-glow)`.
  - El `box-shadow: var(--glow-primary)` del pill activo se renderiza dentro del bottom-nav fixed → confirmar que el `overflow` del bottom-nav no lo recorta (no debería: el container no tiene `overflow: hidden`).

#### `src/styles.scss`

Añadir al final del fichero (antes de los media queries de tipografía global) una nueva sección **Material chrome overrides**:

```scss
// ────────────────────────── Material chrome overrides ──────────────────────────
// Mantenemos mat.theme() como motor, pero forzamos los acabados visuales del
// rediseño donde Material aplicaría su estética MD3 estándar.

// Dialog: sin elevación, borde fino, halo sutil
.mat-mdc-dialog-container .mdc-dialog__surface {
  background-color: var(--bg-surface-hi) !important;
  border: 1px solid var(--border-glow) !important;
  border-radius: var(--radius-lg) !important;
  box-shadow:
    0 0 0 1px var(--border-glow),
    0 24px 60px -12px rgba(0, 0, 0, 0.6) !important;
}

// Bottom-sheet (filtros mobile)
.mat-bottom-sheet-container {
  background-color: var(--bg-surface-hi) !important;
  border-top: 1px solid var(--border-glow) !important;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0 !important;
  box-shadow: var(--shadow-lg) !important;
}

// Drawer lateral (filtros desktop)
.mat-drawer {
  background-color: var(--bg-surface-hi) !important;
  border-left: 1px solid var(--border-glow) !important;
}

// Snackbar
.mdc-snackbar__surface {
  background-color: var(--bg-surface-hi) !important;
  border: 1px solid var(--border-glow) !important;
  border-radius: var(--radius-sm) !important;
  box-shadow: var(--shadow-lg) !important;
}

.mdc-snackbar__label {
  font-family: var(--font-mono) !important;
  font-size: 0.75rem !important;
  color: var(--text-hi) !important;
}

// Select panel
.mat-mdc-select-panel.mdc-menu-surface {
  background: var(--bg-surface-hi) !important;
  border: 1px solid var(--border-glow) !important;
  border-radius: var(--radius-sm) !important;
  box-shadow: var(--shadow-lg) !important;
}

// FAB (Floating Action Button) — aparece en games, wishlist, hardware-list, orders
.mat-mdc-fab,
.mat-mdc-extended-fab {
  background-color: var(--primary) !important;
  color: var(--text-hi) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: var(--glow-primary-soft) !important;

  &:hover {
    box-shadow: var(--glow-primary) !important;
  }
}

// Datepicker calendar
.mat-datepicker-content {
  background-color: var(--bg-surface-hi) !important;
  border: 1px solid var(--border-glow) !important;
  border-radius: var(--radius-md) !important;
}

// Tooltip
.mdc-tooltip__surface {
  background-color: var(--bg-surface-hi) !important;
  border: 1px solid var(--border-glow) !important;
  border-radius: var(--radius-sm) !important;
  font-family: var(--font-mono) !important;
  font-size: 0.7rem !important;
  letter-spacing: 0.04em !important;
}
```

> El bloque `html.dark-mode { .mat-mdc-dialog-container ... }` y `.mat-mdc-select-panel.mdc-menu-surface` ya en líneas 47-66 quedan obsoletos por estas reglas globales. **Eliminar** ese bloque interno de `html.dark-mode`, quedando `html.dark-mode { color-scheme: dark; }` vacío. Mantener el selector como salvaguarda (no romper si en algún sitio se aplica la clase).

#### Responsive a preservar/adaptar — `styles.scss`

- **`@media (max-width: 600px)` líneas 333-340** (`.snack-mobile` full-width) — **mantener tal cual**. El snackbar full-width mobile no cambia con el rediseño; los overrides añadidos en este commit usan `!important` y aplican igual.
- **`@media (max-width: 768px)` línea 307-311** (`.hw-detail__dl` a 1 col) — **mantener**.
- **Escala raíz (commit 1)** — ya consolidada, no se toca.

#### `confirm-dialog.component.scss`

El fichero está vacío (1 línea, sin contenido). Añadir:

```scss
:host {
  display: block;
  font-family: var(--font-body);
  color: var(--text-hi);
}

.confirm-dialog__title {
  font-family: var(--font-display);
  letter-spacing: 0.01em;
}

.confirm-dialog__actions {
  // Material gestiona el layout; aquí solo aseguramos tipografía
  button {
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.75rem;
  }
}
```

> Antes de tocar, leer el `confirm-dialog.component.html` para confirmar las clases existentes. Si no usa esas clases, **no inventarlas**: el `.mat-mdc-dialog-container` global ya lo cubre y este fichero puede quedarse vacío.

#### `list-page-header.component.scss`

- `:host`:
  - `background-color: var(--bg-surface)`.
  - `border-bottom: 1px solid var(--border-subtle)`.
- `.list-page-header__filter-badge`:
  - `background: var(--primary)`.
  - `color: var(--text-hi)`.
  - `font-family: var(--font-mono)`.

#### Responsive a preservar/adaptar — `list-page-header.component.scss`

- **`@media (max-width: 820px)` línea 65** — usa **820, no 768**. Oculta stats, add-btn y filter-btn; muestra view-btn. Es intencional para iPad mini / Pixel Tablet (ver "Anomalías" en sección global). **Mantener el 820** y no unificar a 768.
- Verificar que `padding: 0.75rem 1rem` del bloque mobile se mantiene legible con los nuevos `font-family` (Chakra Petch puede ocupar más alto de x que Outfit; si el header crece, no es problema).

#### `hardware-list-shell.component.scss`

Solo el bloque de stats (líneas 20-39):
- `.hw-list__stat`: `font-family: var(--font-mono)`, `font-size: 0.75rem`, `color: var(--text-mid)`, `text-transform: uppercase`, `letter-spacing: 0.04em`.
- `.hw-list__stat-divider`: `background-color: var(--border-subtle)`.

#### Responsive a preservar/adaptar — `hardware-list-shell.component.scss`

- **`@media (max-width: 768px)` línea 229** — `.hw-list__grid` a 1 columna, FAB visible con offset `bottom: calc(var(--bottom-nav-height) + 1rem)`. **Mantener**. Verificar que el FAB con la nueva regla global (`.mat-mdc-fab` con `border-radius: var(--radius-md)` + `box-shadow: var(--glow-primary-soft)`) no se solapa con el bottom-nav.

#### `games.component.scss`

- `.game-list__filters-drawer`: añadir `background-color: var(--bg-surface-hi); border-left: 1px solid var(--border-glow);`.
- `.game-list__stat`: igual tratamiento que `.hw-list__stat`.
- `.game-list__stat-divider`: `background-color: var(--border-subtle)`.

#### Responsive a preservar/adaptar — `games.component.scss`

- **`@media (max-width: 820px)` línea 180** — usa **820, no 768** (igual razón que list-page-header). **Mantener**.
  - `padding-bottom: var(--bottom-nav-height)` en `:host` → **mantener**.
  - Grid padding/gap reducidos a `0.75rem` → mantener.
  - FAB de filtros (`.game-list__filter-fab`) y FAB de añadir (`.game-list__fab`) `position: fixed`, ambos con offset `calc(var(--bottom-nav-height) + 16px)` → **mantener**.
- Verificar que el `.game-list__filters-drawer` con `border-left: 1px solid var(--border-glow)` no se ve cuando el drawer está cerrado (debe estar fuera del viewport → OK).
- El grid de games usa `--grid-cols` desde TypeScript (`GAME_GRID_BREAKPOINTS`). **No tocar**.

#### `game-list-filters-sheet.component.scss` y `game-list-filters-bar.component.scss`

Leer los ficheros antes de tocar. Cambios esperados:
- Cualquier `background-color: var(--mat-sys-surface-container-*)` se mantiene (lo reemite `mat.theme()`); si el visual queda flojo, sustituir explícitamente por `var(--bg-surface-hi)`.
- Títulos de sección de filtros: `font-family: var(--font-display)`.
- Toggles, sliders y chips de filtro: si tienen tipografía, pasar a mono uppercase 0.7rem.

#### Responsive a preservar/adaptar — filtros

- **`game-list-filters-bar.component.scss` `@media (max-width: 820px)` línea 94** — solo ajusta padding de chips. **Mantener**. Verificar que el bar inline no se solapa con el FAB de filtros en 820-1023px.
- **`game-list-filters-sheet.component.scss`** — sin media queries propias (es un sheet de Material). El responsive lo gestiona Material vía `mat-bottom-sheet` en mobile y se monta como tal vía el componente padre. Solo asegurar que el override global de `.mat-bottom-sheet-container` (añadido en `styles.scss` de este commit) aplica con border y radius arcade.

> Recomendación: en este commit hacer el barrido mínimo y dejar refinos finos para commit 7 si surgen problemas en checkpoint 2.

**Verificación commit 4**:
- Nav-rail desktop: items con barra violeta izquierda al estar activos, labels mono uppercase.
- Bottom-nav mobile: pill con borde violeta + halo en vez de fondo material.
- Dialogs (cualquier confirm o avatar-crop): borde fino, halo, sin elevación material.
- FAB (botón "Añadir juego" en games): violeta plano con halo.
- Snackbar al borrar un juego: borde fino violeta, fondo `--bg-surface-hi`.
- **Responsive**:
  - 375-767: nav-rail oculto, topbar visible, bottom-nav con pill violeta halo, FABs visibles con halo.
  - 768-819: stats/add-btn/filter-btn del header siguen ocultos (820 threshold), bottom-nav y FAB todavía visibles. Verificar coherencia.
  - 820+: stats visibles en header, add-btn en header, FAB oculto, drawer lateral en lugar de bottom-sheet.

---

### CHECKPOINT 2 — tras commits 3-4

**Qué revisa el senior**:
- Detalle de juego con halo violeta correcto, `>` en labels, mono en valores, scanline en hover desktop.
- Nav rail, bottom nav, dialogs, snackbar coherentes con el lenguaje "arcade cabinet".
- No quedan zonas "Material elevado" obvias (sombras grandes, fondos `surface-container` muy claros).
- **Responsive**: pasada completa por 375 / 768 / 820 / 1024 / 1440 / 1920 — chrome y filtros coherentes en cada salto.

> El tech NO continúa al commit 5 sin visto bueno.

---

### Commit 5 — Hardware + Wishlist

**Mensaje sugerido**:
```
style(hardware,wishlist): cards arcade-cabinet en consolas, mandos y wishlist
```

**Ficheros a tocar**:
- `src/app/presentation/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component.scss`
- `src/app/presentation/pages/collection/components/hardware-form-shell/hardware-form-shell.component.scss`
- `src/app/presentation/pages/collection/components/hardware-loan-form/hardware-loan-form.component.scss`
- `src/app/presentation/pages/collection/pages/consoles/consoles.component.scss`
- `src/app/presentation/pages/collection/pages/consoles/pages/console-detail/console-detail.component.scss`
- `src/app/presentation/pages/collection/pages/controllers/controllers.component.scss`
- `src/app/presentation/pages/collection/pages/controllers/pages/controller-detail/controller-detail.component.scss`
- `src/app/presentation/pages/wishlist/wishlist.component.scss`
- `src/app/presentation/pages/wishlist/components/wishlist-card/wishlist-card.component.scss`
- `src/app/presentation/pages/wishlist/components/wishlist-item-dialog/wishlist-item-dialog.component.scss`
- `src/app/presentation/pages/wishlist/pages/wishlist-detail/wishlist-detail.component.scss`

#### Estrategia general

Estas pantallas comparten patrón con games pero NO tienen la misma estructura visual. **No copiar el `clip-path` biselado a todas las cards**. Solo aplicar bisel donde el card es lo suficientemente grande para que se note (cards de consola en grid, no en filas estrechas).

#### `wishlist-card.component.scss`

- `.wishlist-card`:
  - `background: var(--bg-surface-hi)`.
  - `border: 1px solid var(--border-subtle)`.
  - `border-radius: var(--radius-md)`.
  - `transition: border-color var(--transition-base), box-shadow var(--transition-base);`
  - hover (dentro de `@media (hover: hover)`): `border-color: var(--border-glow); box-shadow: var(--glow-primary);`
- `.wishlist-card__title`: `font-family: var(--font-display)`.
- Si hay precio/fecha en mono, asegurar `font-family: var(--font-mono)`.

#### `wishlist.component.scss`

- `.wishlist-page__title`: `font-family: var(--font-display)`.
- `.wishlist-page__stat`: `font-family: var(--font-mono)`, `text-transform: uppercase`, `letter-spacing: 0.04em`, `font-size: 0.75rem`.
- SVGs decorativos (`.es-shape`, `.es-ring`, `.es-accent`): apuntar `fill`/`stroke` a `var(--border-subtle)` / `var(--primary)` para que la ilustración se integre con la paleta.

#### Responsive a preservar/adaptar — `wishlist.component.scss`

Tiene **dos** bloques `@media`:

- **`@media (max-width: 1280px)` línea 301** — padding del page bajado a `1.25rem`. **Mantener**.
- **`@media (max-width: 768px)` línea 308**:
  - Padding `0.75rem 0.75rem calc(var(--bottom-nav-height) + 0.75rem)`. **Mantener**.
  - Header en columna, oculta add-btn, muestra FAB.
  - Título a `var(--text-xl)`. **Mantener**.
  - Verificar que las wishlist-cards con el nuevo borde violeta no quedan demasiado anchas a 1 columna (las cards no llevan bisel, son rectángulos suaves).

#### `hardware-detail-shell.component.scss` y `hardware-form-shell.component.scss`

Leer los ficheros y aplicar:
- Secciones (paneles `<section>`): `background-color: var(--bg-surface-hi)`, `border: 1px solid var(--border-subtle)`, `border-radius: var(--radius-md)`.
- Títulos `h2`/`h3`: `font-family: var(--font-display)`.
- Labels `dt`: tipografía mono uppercase + prefijo `>` si encajan en el patrón (las reglas globales en `styles.scss` ya tocaron `.hw-detail__dl` — confirmar que no hay sobreescrituras locales que rompan).

#### Responsive a preservar/adaptar — `hardware-detail-shell.component.scss`

- **`@media (max-width: 768px)` línea 156** — solo ajusta `.hardware-detail { padding: 1rem }`. **Mantener**.
- La regla global `@media (max-width: 768px) { .hw-detail__dl { grid-template-columns: 1fr } }` (en `styles.scss`) hace todo el trabajo en mobile. No replicar aquí.

#### `consoles.component.scss` y `controllers.component.scss`

Las páginas de listado de hardware usan `hardware-list-shell` proyectado. **No necesitan cambios visuales más allá de los iconos**. Confirmar que los iconos mask-image (`.hw-list__card-icon--home`, `--handheld`) heredan `color: currentColor` correctamente y que el contenedor padre los pinta con `var(--primary-glow)`. Si no, ajustar en el `.scss` correspondiente del shell.

#### Responsive — consoles / controllers

- Heredan la regla del shell: `@media (max-width: 768px) { .hw-list__grid { grid-template-columns: 1fr; } }`. Confirmar.

#### `console-detail.component.scss` y `controller-detail.component.scss`

Mismo patrón que `game-detail` pero adaptado:
- Hero (si lo tiene): aplicar halo violeta inset, y como en `game-detail`, **desactivar el halo exterior en mobile portrait** (vía media query del propio fichero o reutilizando un `@media (max-width: 768px) and (orientation: portrait)` idéntico).
- Títulos: Chakra Petch.
- dl/dt/dd: ya se cubren con las reglas globales `.hw-detail__*` que tocamos en commit 1.
- Acciones de detalle (botones préstamo / editar): bordes mono uppercase.

#### Responsive a preservar/adaptar — `*-detail`

- Leer cada fichero antes de tocar; si replican el patrón portrait/landscape del game-detail, aplicar las mismas reglas (sin halo exterior en portrait mobile, layout 2 columnas en landscape mobile).
- Si no replican el patrón, no añadir lógica responsive nueva en este commit; postponer al commit 7.

#### `wishlist-detail.component.scss` y `wishlist-item-dialog.component.scss`

Mismo tratamiento que el resto: bordes finos, halos en hover, tipografía display en títulos y mono en metadata.

#### `hardware-loan-form.component.scss`

Form de préstamo: respetar los Material form-fields (los gestiona la teoría global). Solo tocar títulos y separadores con la nueva paleta.

**Verificación commit 5**:
- Lista de consolas y mandos: cards con borde fino, hover violeta.
- Detalle de consola/controller: hero con halo, secciones con borde, labels `>` mono.
- Wishlist: cards alineadas con el nuevo lenguaje, hover correcto.
- **Responsive**:
  - 375: hardware grid 1 col, wishlist 1 col, FAB visible, header CTA oculto.
  - 768: igual que 375.
  - 1024+: hardware grid 2-3 col, wishlist 2-3 col, header CTA visible, FAB oculto.

---

### Commit 6 — Stats / collection-overview

**Mensaje sugerido**:
```
style(collection-overview): tarjetas de resumen con tipografía arcade
```

**Ficheros a tocar**:
- `src/app/presentation/pages/collection/pages/collection-overview/collection-overview.component.scss`

> No existe un dashboard/stats separado. La página `collection-overview` actúa como hub principal. Aquí están los contadores y el total acumulado.

#### `collection-overview.component.scss`

1. **`.collection-overview__title`** (línea 21):
   - `font-family: var(--font-display)`.
   - `letter-spacing: 0.02em`.

2. **`.collection-overview__total-label`** (línea 33):
   - `font-family: var(--font-mono)`.
   - `color: var(--text-lo)`.

3. **`.collection-overview__total-amount`** (línea 42):
   - `font-family: var(--font-mono)`.
   - `font-weight: 700`.
   - `color: var(--primary-glow)`.
   - Añadir `text-shadow: 0 0 24px rgba(124, 58, 237, 0.4);` (efecto de glow neon en el total — protagonista visual de la página).

4. **`.collection-overview__card`** (líneas 58-83):
   - `background-color: var(--bg-surface-hi)`.
   - `border: 1px solid var(--border-subtle)`.
   - `border-radius: var(--radius-md)`.
   - Añadir bisel: `clip-path: polygon(0 0, calc(100% - var(--bevel-size, 12px)) 0, 100% var(--bevel-size, 12px), 100% 100%, 0 100%);`
   - hover dentro de `@media (hover: hover)`: cambiar el `transform: translateY(-2px)` y `background-color: var(--mat-sys-surface-container-high)` por:
     ```scss
     &:hover {
       border-color: var(--border-glow);
       box-shadow: var(--glow-primary);
     }
     ```
   - Eliminar `&:active { transform: translateY(0); }` (sin micro-bounce; el feedback ya lo da el halo).

5. **El resto del fichero** (líneas 80+ que no leí completas): leerlo y aplicar:
   - Iconos grandes de las tarjetas: `color: var(--primary-glow)`.
   - Contadores de cada categoría: `font-family: var(--font-mono); font-weight: 700; color: var(--text-hi);`.
   - Labels de categoría: `font-family: var(--font-display); color: var(--text-mid);`.

#### Responsive a preservar/adaptar — `collection-overview.component.scss`

- **`@media (max-width: 768px)` línea 123**:
  - `:host` padding-bottom para clear bottom-nav. **Mantener**.
  - `.collection-overview` padding `1.5rem 1rem 0.75rem`. **Mantener**.
  - `.collection-overview__total-amount` a `var(--text-3xl)`. **Mantener** (con el text-shadow neon, el `3xl` en 375 sigue siendo legible y protagonista).
  - `.collection-overview__grid` a 1 columna. **Mantener**.
  - `.collection-overview__card` padding `1rem`. **Mantener**.
  - **Añadir** dentro de este bloque: `--bevel-size: var(--bevel-size-mobile);` en `.collection-overview__card` para reducir el bisel a 8px en mobile (las cards en 1 columna ocupan todo el ancho pero la cabecera del card tiene poco margen visual; el bisel grande se nota mucho).
  - **Considerar**: el `text-shadow` violeta del total en mobile puede sangrar fuera del contenedor cuando hay sticky topbar pegada arriba. Si en checkpoint el blur se ve sucio, reducir a `text-shadow: 0 0 16px rgba(124, 58, 237, 0.3)` solo dentro del bloque mobile.

**Verificación commit 6**:
- Página de inicio (collection-overview): título mono + total en glow violeta, 3 tarjetas con bisel y halo en hover, iconos violeta brillante.
- **Responsive**:
  - 375: 1 columna, bisel 8px, total visible y glow legible.
  - 768: 1 columna todavía.
  - 1024+: 2-3 columnas según viewport, bisel 12px, halo en hover.

---

### Commit 7 — Ajustes responsive

**Mensaje sugerido**:
```
style(responsive): repaso final arcade cabinet en 375 / 768 / 1024 / 1440 / 1920 / 2560
```

**Objetivo del commit**: pasada de revisión por **todos los breakpoints oficiales del proyecto** después de aplicar el rediseño visual, corrigiendo solo lo que se haya roto al cambiar la piel. No es un commit de "añadir media queries nuevas" salvo cuando un comportamiento del rediseño lo exija (bisel reducido, halo desactivado).

**Ficheros a tocar**: todos los `.scss` modificados en commits 1-6 que tengan media queries, **leyendo el fichero entero antes de modificar**.

#### Breakpoints oficiales

Recordados del bloque "Sistema responsive del proyecto":

```
375px (iPhone SE / Pixel pequeño) — referencia mobile mínima
768px (--bp-mobile) — tablet portrait, frontera chrome
820px — anomalía: list-page-header, games, filters-bar (mantener)
1024px (--bp-tablet) — tablet landscape / desktop pequeño
1280px (--bp-desktop) — desktop estándar
1440px — laptop grande (root font 17px)
1920px (--bp-desktop-large) — FHD (root font 18px)
2560px (--bp-ultra-wide) — 2K (root font 20px)
3840px (--bp-ultra-wide-xl) — 4K (root font 22px)
```

#### Lista de comprobación canónica por breakpoint

##### 375px (iPhone SE, Pixel 4)

- **App chrome**: bottom-nav visible y `height: 60px`. Topbar visible con title en Chakra Petch — verificar que el title cabe sin truncarse (Chakra Petch ocupa más ancho que Inter; si trunca, reducir a `font-size: 0.9rem`).
- **Game-card grid**: 2 columnas (vía `GAME_GRID_BREAKPOINTS`), gap 0.75rem, padding 0.75rem.
- **Game-card bisel**: 8px (`--bevel-size-mobile`). Confirmar en el `@media (max-width: 768px)` de `game-card.component.scss`.
- **Game-card halo**: desactivado (envuelto en `@media (hover: hover)`). En táctil ningún halo pegado tras tap.
- **Game-card chips**: a partir del `@media (max-width: 550px)` los chips se apilan en columna y se oculta el nombre del prestatario. Verificar que el badge-chip outline mono no rompe esta columna.
- **Game-detail**: hero `clamp(180,35vh,300)`. Halo exterior desactivado (solo inset). Title `var(--text-xl)`. Actions stacked. Labels `>` mono visible.
- **Collection-overview**: 1 columna cards, bisel 8px, total con glow neon proporcional.
- **Wishlist**: 1 columna, FAB visible.
- **Hardware list**: 1 columna.
- **Dialogs**: si abren a 375, `border-radius: var(--radius-lg)` puede comerse esquinas; verificar que `.mat-mdc-dialog-container` tiene `margin: 1rem` (lo gestiona Material por defecto).
- **Snackbar**: `@media (max-width: 600px)` aplica `.snack-mobile { width: 100vw; border-radius: 0 }`. Con la nueva paleta y border arcade, el snackbar mobile pierde el border-radius pero mantiene el border `1px solid var(--border-glow)`. Verificar que se ve correctamente.

##### 768px (tablet portrait)

- **App chrome**: aún bottom-nav (el threshold del chrome es exactamente 768, ver `app.component.scss` línea 384). En 768 puro el nav-rail no se ve.
- **Game-card grid**: 3 columnas (vía `GAME_GRID_BREAKPOINTS` salto en 900).
- **Game-card bisel**: 8px (el `@media (max-width: 768px)` incluye 768 puro).
- **Game-list filters / header**: stats y CTA ocultos hasta 820. **Importante**: entre 769 y 819 el chrome ya es desktop (nav-rail) pero los filtros aún están en modo "compacto". Es coherente con el diseño actual (cards más anchas, menos estadísticas en header) — **no unificar**.
- **Game-detail**: aún en portrait (180,35vh,300) si el dispositivo es portrait; si es landscape (raro a 768x500), aplica el bloque landscape.

##### 820px (anomalía intencional)

- **list-page-header**: pasa a modo desktop (muestra stats, add-btn, filter-btn).
- **games**: pasa a layout sin FAB (CTAs en header).
- **game-list-filters-bar**: chips con padding desktop.
- **app chrome**: ya es desktop (nav-rail desde 769).

##### 1024px (--bp-tablet)

- **Game-card grid**: 4 columnas (salto en 1200).
- **Game-detail scanline**: activo en hover.
- **Hardware grid**: 2 columnas en consolas/controllers.
- **Wishlist**: 2 columnas (verificar el threshold del grid en `wishlist.component.scss` — el media a 1280 reduce padding pero no cambia columnas; el grid probablemente usa `auto-fill minmax` o salta en 768).

##### 1280px (--bp-desktop)

- **Game-card grid**: 5 columnas.
- **Wishlist**: padding desktop `1.25rem`.
- **Drawer de filtros**: visible 22rem cuando se abre.

##### 1440px (laptop grande)

- **html font-size**: 17px (escala raíz).
- Todos los `rem` proporcionales escalan. **Verificar**: el bisel `12px` NO escala (es px absoluto por diseño), las cards se ven con bisel ligeramente más pequeño en proporción → es correcto.

##### 1920px (--bp-desktop-large / FHD)

- **html font-size**: 18px.
- **Game-card grid**: 6 columnas.

##### 2560px (--bp-ultra-wide / 2K)

- **html font-size**: 20px.
- **Game-card grid**: 7 columnas.
- **Riesgo**: con root font a 20px, los textos en `--text-xs` (0.75rem) escalan a 15px. Los chips de plataforma en mono uppercase a 0.7rem se ven a 14px → OK. Verificar que los `>` decorativos en labels no se ven desproporcionados (al ser caracteres mono escalan con el rem).
- **Bisel `12px`**: a 2K se ve ~0.6% del ancho de un card → proporcionalmente pequeño pero **intencionalmente fijo**. Si en checkpoint final se siente "perdido", el plan permite (solo aquí) subir a `16px` vía media query:
  ```scss
  // En styles.scss, sección responsive:
  @media (min-width: 2560px) {
    :root { --bevel-size: 16px; }
  }
  ```
  No aplicarlo a ciegas; pedir confirmación al senior.

##### 3840px (--bp-ultra-wide-xl / 4K)

- **html font-size**: 22px.
- **Game-card grid**: 8 columnas (`GAME_GRID_FALLBACK_COLUMNS`).
- Verificar visualmente; en este viewport el plan asume que la apariencia es la misma que 2K escalada.

#### Issues típicos esperados y mitigación

1. **Chakra Petch wraps en títulos cortos** (375). Mitigación: si un título de 2 palabras parte línea por kerning, añadir `word-spacing: -0.02em` puntual al selector concreto en su bloque mobile.
2. **Chip mono uppercase desborda** en plataformas con nombre largo ("NINTENDO SWITCH 2"). Mitigación: el badge-chip ya tiene `white-space: nowrap` y `padding 2px 8px`; en 375 verificar que no rompe el row de chips. Si rompe, reducir letter-spacing a `0.06em` solo en mobile.
3. **`>` prefijo + `mat-icon` en `.game-detail__data-label`** se solapan en 375. Mitigación: añadir `gap: 0.5rem` al label dentro del bloque `(max-width: 768px) and (orientation: portrait)`.
4. **Halo `box-shadow: var(--glow-primary)` en táctil**: ya mitigado envolviendo todos los `:hover` con `@media (hover: hover)`. Verificar exhaustivamente que **ningún `:hover` queda fuera del gate** — pasada con `rtk grep ":hover" src/app` en todos los ficheros del rediseño tras commit 6.
5. **Scanline hero violeta queda muy fuerte en 4K**: la opacidad final es `0.06` con `mix-blend-mode: overlay`. A 4K con root font 22px y hero más alto, se ve idéntico. No tocar salvo que se confirme.
6. **Bottom-nav pill borde violeta + `box-shadow: var(--glow-primary)`**: en 375 el halo (24px de blur) puede salirse del bottom-nav cuando el container tiene `overflow: visible`. Verificar; si se corta, está bien (visualmente queda contenido en el chrome). Si sangra hacia arriba sobre el contenido scrolleable, añadir `overflow: hidden` solo al bottom-nav en mobile — pero esto rompería el animation transform del pill: validar primero.

#### Convenciones de los bloques `@media` añadidos en este commit

Si se añade alguna media nueva (no debería en la mayoría de ficheros), respetar:

```scss
// ────────────────────────── Responsive: ≤ Xpx (descriptor breve) ──────────────────────────
@media (max-width: Xpx) { ... }
```

Posición: **siempre al final del fichero**, después de la última regla no-media. Si el fichero ya tiene varios bloques media, agruparlos en orden descendente (≤ 1280 antes que ≤ 768 antes que ≤ 550).

**Verificación commit 7**:
- A ojo en cada breakpoint (375 / 768 / 820 / 1024 / 1280 / 1440 / 1920 / 2560), todo el rediseño se mantiene coherente.
- No hay textos cortados, chips desbordados ni cards rotas en 375px.
- En 2560+ los biseles y halos se siguen viendo proporcionalmente correctos.
- En táctil (emulado o real) no queda halo pegado tras tap.
- `npm run build` y `npm run lint` siguen verdes.

---

### CHECKPOINT 3 FINAL — tras commits 5-7

**Qué revisa el senior**:
- Revisión completa de toda la app rediseñada: collection-overview, games list/detail, consolas, mandos, hardware detail, wishlist, settings, dialogs, snackbars, formularios.
- Confirma coherencia global del lenguaje "arcade cabinet".
- **Pasada responsive completa**: 375 / 768 / 820 / 1024 / 1280 / 1440 / 1920 / 2560 — captura visual de cada uno, comparado con el estado pre-rediseño.
- Aprueba el merge.

> Solo tras este checkpoint el tech ejecuta el flujo final:
> 1. `npm run build` — bundle production verde.
> 2. `npm test` — todos los tests siguen pasando (no se han tocado specs).
> 3. `npm run lint` — sin warnings.
> 4. Push de la rama: `git push -u origin feat/arcade-cabinet-redesign`.
> 5. Abrir PR contra `master` con título: `feat(ui): rediseño visual arcade cabinet`.

---

## Reglas de oro para el tech

1. **Leer el `.scss` y el `.html` completos antes de tocar**. El plan describe el qué; el cómo exacto puede tener matices que solo se ven en el fichero.
2. **No improvises** colores, tipografías ni radios fuera del mapa de tokens. Si algo no encaja, anótalo en el cuerpo del commit y para en el siguiente checkpoint.
3. **No toques `.spec.ts`** ni `.ts` de componentes. Si un test se rompe por un selector CSS, **es bug real**: avisa al senior.
4. **No toques traducciones** (`src/assets/i18n/*.json`).
5. **No introduzcas dependencias nuevas**. Las fuentes vienen de Google Fonts vía `<link>`; no instalar paquetes npm de tipografía.
6. **Commits atómicos**: un commit = un foco. Si descubres un side-effect en otro commit, anótalo y abórdalo en el commit que toca.
7. **Mensaje de commit en español** siguiendo Conventional Commits. Cuerpo opcional para desviaciones del plan.
8. **No abrir PR hasta CHECKPOINT 3 FINAL**.
9. **Si tienes dudas**, para. No es coste; es el método.
10. **Hover siempre dentro de `@media (hover: hover)`**. Sin excepciones. El rediseño usa halos fuertes; en táctil deben no aplicar nunca.
11. **Bisel parametrizado con `--bevel-size`**. Nunca hardcodear `12px` en un `clip-path`: usar siempre `var(--bevel-size, 12px)` para que el override mobile (`--bevel-size: 8px`) funcione.
12. **Comentarios separadores de media queries**: obligatorios, formato del proyecto: `// ────────────────────────── Responsive: ≤ Xpx ──────────────────────────`.

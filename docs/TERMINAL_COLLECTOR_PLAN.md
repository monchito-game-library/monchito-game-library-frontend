# Terminal Collector — Plan de implementación

> Rediseño visual integral de Monchito Game Library siguiendo la dirección C "Terminal Collector".
> Rama de trabajo: `feat/terminal-collector-redesign` (creada desde `master`).

---

## Índice

1. [Introducción](#1-introducción)
2. [Sistema responsive y comportamiento PWA](#2-sistema-responsive-y-comportamiento-pwa)
3. [Catálogo de componentes `lib/`](#3-catálogo-de-componentes-lib)
4. [Plan de commits](#4-plan-de-commits)
   - [FASE 0 — Fundación](#fase-0--fundación)
   - [FASE 1 — Core de la colección](#fase-1--core-de-la-colección)
   - [FASE 2 — Chrome y navegación](#fase-2--chrome-y-navegación)
   - [FASE 3 — Hardware, wishlist, collection-overview](#fase-3--hardware-wishlist-collection-overview)
   - [FASE 4 — Responsive PWA](#fase-4--responsive-pwa)
   - [FASE 5 — Material overrides y lib extras](#fase-5--material-overrides-y-lib-extras)
5. [Checkpoints](#5-checkpoints)
6. [Notas operativas](#6-notas-operativas)

---

## 1. Introducción

### 1.1 Concepto

Terminal Collector convierte la app en una "base de datos personal de coleccionista" con estética de IDE/terminal. La identidad visual es **mono, densa, sin ornamentos**: rectángulos puros, bordes 1px, tipografía monoespaciada por defecto, ausencia de sombras decorativas y de transformaciones. El color queda relegado al rol de **señal funcional** (estado, foco, acción), nunca decorativo.

La app sigue siendo una PWA instalable y multi-viewport (375px → 3840px); el rediseño respeta los patrones móviles ya implantados (bottom-nav, bottom-sheet de filtros, FABs, layout landscape de detalle).

### 1.2 Validación con el skill UI/UX Pro Max

Las búsquedas en el skill confirman dos rutas combinables y devuelven la pareja tipográfica recomendada:

| Búsqueda | Resultado relevante | Aplicación |
|---|---|---|
| `style: terminal dark mono brutalism collector` | **Brutalism**: `border-radius: 0`, `transition: 0s`, weights 700+, bordes visibles, sin smooth transitions. **Dark Mode (OLED)**: `#000000` background, contrast 7:1+, sin glow excesivo, WCAG AAA. | Intersección directa con el brief. Adoptamos brutalism estructural + OLED para densidad y batería en móvil instalado. |
| `typography: mono technical database` | **Developer Mono** — heading `JetBrains Mono`, body `IBM Plex Sans`. CSS imports y Tailwind config incluidos. | Confirma exactamente la pareja propuesta. La adoptamos sin cambios. |
| `color: monospace dark OLED minimal` | Paletas dark + acento (verde/oro). | La paleta del brief ya cubre `#4ADE80` (verde) y `#FBBF24` (ámbar); añadimos `--accent-blue` para "DIGITAL" para no abusar de `--primary`. |
| `ux: data grid list collection density` | Bulk actions con checkbox column; no auto-play. | No introducimos bulk-select en este rediseño (fuera de scope) pero respetamos "no auto-animaciones" eliminando `heartbeat` del favorito y `cardIn` del hardware. |

**Anti-patrones que asumimos** (de la guía general del skill): no usar emojis como icono UI, focus ring visible siempre, respetar `prefers-reduced-motion`, contraste ≥ 4.5:1, touch target ≥ 44×44px. Todos quedan recogidos en las reglas de oro (§1.5) y en las specs de cada `lib-*`.

### 1.3 Tipografía

- **Mono (UI por defecto)**: `JetBrains Mono` 400/500/700. Aplica a: labels, datos, chips, botones, navegación, métricas, headers de sección, prompt de command-bar.
- **Sans (sólo títulos de obra)**: `IBM Plex Sans` 500/600. Aplica exclusivamente a: título de juego en card y detail (`game-card__title`, `game-detail__title`), título de hardware en card y detail, título de wishlist. Nombres largos son ilegibles en mono.
- **Material Icons** permanecen como única familia iconográfica. Nada de SVG ad-hoc nuevos salvo los `empty-state` que ya existen.

Reemplazos en `index.html`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=IBM+Plex+Sans:wght@500;600&display=swap"
  rel="stylesheet" />
```

Eliminar los preconnects/links a `Outfit` y `Space+Grotesk`.

### 1.4 Paleta OLED

Tokens en `:root` (sustituyen y amplían los actuales). Light mode queda deshabilitado para el redesign — la app pasa a ser **dark-only**.

```css
:root {
  /* ── Superficies ───────────────────────────── */
  --bg-void:         #000000;  /* canvas raíz */
  --bg-surface:      #0A0A0A;  /* nav-rail, drawers, sheets, cards */
  --bg-surface-hi:   #141414;  /* hover de surface, contenedores apilados */
  --bg-elev:         #1A1A1A;  /* dialogs, menus, popovers */

  /* ── Bordes ────────────────────────────────── */
  --border:          #262626;
  --border-strong:   #404040;  /* divisores destacados */
  --border-active:   #7C3AED;  /* hover sobre interactivos, focus ring */

  /* ── Texto ─────────────────────────────────── */
  --text-hi:         #FAFAFA;  /* títulos y valores */
  --text-mid:        #A3A3A3;  /* body, datos secundarios */
  --text-lo:         #525252;  /* labels uppercase, dt, placeholders */

  /* ── Acento funcional (señalético) ─────────── */
  --primary:         #7C3AED;  /* CTAs primarios, foco */
  --accent-green:    #4ADE80;  /* éxito: paid, sold, owned */
  --accent-amber:    #FBBF24;  /* aviso: pending, in-loan, for-sale */
  --accent-rose:     #F43F5E;  /* error/destructivo: delete */
  --accent-blue:     #60A5FA;  /* info: digital, online, link */
}
```

Sobrescritura de tokens Material (`mat.theme()`) para que los componentes residuales no rompan la paleta:

```scss
html {
  color-scheme: dark;
  @include mat.theme((
    color: (
      primary: mat.$violet-palette,
      theme-type: dark
    ),
    typography: (
      plain-family: 'JetBrains Mono, monospace',
      brand-family: 'IBM Plex Sans, sans-serif'
    ),
    density: -2  /* densidad máxima — terminal style */
  ));
  --mat-sys-surface: var(--bg-void);
  --mat-sys-surface-container: var(--bg-surface);
  --mat-sys-surface-container-high: var(--bg-surface-hi);
  --mat-sys-on-surface: var(--text-hi);
  --mat-sys-on-surface-variant: var(--text-mid);
  --mat-sys-outline-variant: var(--border);
  --mat-sys-outline: var(--border-strong);
  --mat-sys-primary: var(--primary);
  --mat-sys-on-primary: #FFFFFF;
  --mat-sys-error: var(--accent-rose);
}
```

Tokens legacy a **borrar** de `:root`: `--color-favorite-start/end`, `--color-digital-start/end`, `--color-loan-start/end`, `--color-sale-start/end`, `--color-metacritic`, `--color-status-*`, `--shadow-sm/md/lg`. Sustituimos cada uno por el accent funcional que aplique (ver §FASE 0/1).

### 1.5 Reglas de oro (obligadas en todo el redesign)

| # | Regla | Cómo se aplica |
|---|---|---|
| 1 | **`border-radius: 0`** en todo. Excepción tolerada: `2px` sólo si está documentado en el SCSS con un `// reason:`. | El token `--radius-md/lg/full` queda **prohibido** en componentes nuevos. Eliminamos sus usos. Sólo `--radius-xs: 2px` sobrevive y se usa con criterio. |
| 2 | **Sin `box-shadow`** decorativo. Permitido únicamente `box-shadow: 0 0 0 1px var(--border-active)` como focus-ring alternativo a `outline` cuando el elemento no admita outline (chips, dialogs flotantes). | `:focus-visible` global usa `outline`. Eliminamos cualquier `--shadow-*`. |
| 3 | **Hover sólo en `@media (hover: hover)`**, y sólo cambia `border-color` o `color`. Prohibidos `transform`, `box-shadow`, `scale`. | Eliminamos `translateY`, `scale(1.04)`, `heartbeat`, `cardIn`. |
| 4 | **Botones `[ ACCIÓN ]`** en desktop: texto mono uppercase entre corchetes literales como parte del label, `border: 1px solid currentColor`, fondo transparente. Touch target ≥ 44px. | `lib-button` añade los corchetes vía pseudo-elementos `::before/::after` (no entran al DOM como texto seleccionable). En mobile, el componente los oculta y deja icono + label. |
| 5 | **Cards** = rectángulo borde 1px `--border`, fondo `--bg-surface`. Hover (sólo hover-able): `border-color: --border-active`. Sin transform. | `lib-card`. |
| 6 | **Patrón datos `ls -la`**: cada par dato/valor en una fila con `<dt>` mono uppercase 0.7rem `--text-lo` a la izquierda, `<dd>` mono `--text-hi` a la derecha alineado, separador opcional de puntos `······`. | `lib-data-row`. |
| 7 | **Chips** = borde 1px del color del variant, texto mono uppercase 0.7rem, `border-radius: 0`, padding `2px 8px`, sin fondo (excepto state-chip que sí lleva fondo `--bg-surface-hi` para legibilidad en hero). | `lib-chip`. |
| 8 | **Section headers** = `> SECTION_NAME` mono uppercase, borde inferior 1px `--border`, sin tipografía display. | `lib-section-header`. |
| 9 | **Command bar** = prompt mono decorativo `monchito ~/library $` + flags `--filter=X`, sólo desktop ≥ 1024px. Reemplaza el banner emocional. | `lib-command-bar`. |
| 10 | **Focus ring siempre visible**: `outline: 1px solid var(--border-active); outline-offset: 2px`. Sin `border-radius`. | `:focus-visible` global en `styles.scss`. |
| 11 | **Respetar `prefers-reduced-motion`**: las únicas animaciones que sobreviven (fade-in de skeleton, fade-in de route) se anulan en `@media (prefers-reduced-motion: reduce)`. | Bloque global en `styles.scss`. |
| 12 | **Sin emojis** en UI. Sólo `mat-icon`. | Auditoría manual en cada commit. |

---

## 2. Sistema responsive y comportamiento PWA

### 2.1 Breakpoints oficiales (de `breakpoints.constant.ts`)

| Tier | Rango | Token CSS | Patrón clave |
|---|---|---|---|
| Mobile | ≤ 768 | `--bp-mobile` | Bottom-nav, FAB, columna única, sin command-bar, sin corchetes en botones, bottom-sheet de filtros |
| Tablet | 769 – 1024 | `--bp-tablet` | Nav-rail, dos columnas en grids, drawer lateral de filtros, sin command-bar |
| Desktop | 1025 – 1279 | `--bp-desktop` | Command-bar visible, 4 col en grid de juegos, drawer derecho de filtros |
| Desktop large | 1280 – 1919 | — | 5–6 col en grid, command-bar con flags expandidos |
| Ultra-wide | 1920 – 2559 | `--bp-desktop-large` | 7 col en grid, root `font-size: 18px` |
| Ultra-wide XL | ≥ 2560 | `--bp-ultra-wide` / `--bp-ultra-wide-xl` | 8 col en grid, root `font-size: 20px` (24px ≥ 3840) |

Mantenemos las escalas de `font-size` raíz ya implantadas en `styles.scss` (no se tocan).

### 2.2 Comportamiento por viewport para cada elemento

| Elemento | ≤ 768 (mobile PWA) | 769 – 1024 (tablet) | ≥ 1025 (desktop) |
|---|---|---|---|
| Nav principal | `bottom-nav` (height `--bottom-nav-height`, borde superior 1px `--border`, fondo `--bg-surface`, sin pill, item activo color `--primary`, inactivo `--text-lo`) | `nav-rail` (igual que desktop) | `nav-rail` 88px, fondo `--bg-surface`, borde derecho 1px `--border`, ítem activo: borde izquierdo 2px `--primary` + texto `--text-hi`; inactivo `--text-lo` |
| App topbar | Visible; muestra título de página en mono uppercase + avatar | Oculto | Oculto |
| Command bar (`lib-command-bar`) | **Oculto** (no cabe estéticamente) | **Oculto** | Visible bajo topbar/list-header como decoración; usa `path` + `flags` |
| Botones `lib-button` | Sin corchetes literales; sólo icono + label mono uppercase, padding `0.625rem 0.875rem`, borde 1px | Con corchetes parciales en `[label]` (sólo si label corto ≤ 12 chars) | Corchetes completos `[ LABEL ]` con padding `0.5rem 1rem` |
| Game grid | 2 col ≤ 600, 3 col ≤ 900 | 3–4 col según ancho | 4/5/6/7/8 col (ya configurado en `GAME_GRID_BREAKPOINTS`) |
| Game card | Sin hover; borde permanente 1px `--border`; tipografía mono salvo título IBM Plex; sin `transform`, sin `box-shadow`, sin gradient bottom (overlay queda fondo plano `rgba(0,0,0,0.85)`) | Con hover `border-color: --border-active`, todo lo demás igual | Igual que tablet + corchetes en flip-btn |
| Game detail hero | Altura `clamp(180px, 35vh, 300px)`; sin máscara gradient lateral; backdrop `--bg-surface` plano (sin radial); fila chips horizontal scroll | Altura `clamp(220px, 40vh, 420px)` | Altura `clamp(280px, 45vh, 520px)`; body con `max-width: 720px` |
| Game detail landscape mobile | Layout 2-col 42%/58% **se mantiene** (es PWA-crítico); sólo cambia tipo/colores | n/a | n/a |
| Filtros | Bottom-sheet (full-width, swipe-down close); abre desde FAB filtros | Drawer lateral derecho 22rem (ya existente) | Drawer lateral derecho 24rem |
| Filters bar (chips de filtros activos) | Scroll horizontal con `overflow-x: auto`; chips mono uppercase | Scroll horizontal sólo si overflow | Wrap multi-línea, sin scroll |
| List page header | Una fila: stats izq + search central + acciones der; padding `0.5rem 0.75rem` | Padding `0.75rem 1rem`; muestra prompt `$ search:` | Padding `0.75rem 1.5rem`; bajo el header aparece `lib-command-bar` con flags |
| FABs | Visibles (filter + add), borde 1px `--border-active`, fondo `--bg-surface`, ícono `--primary`, sin sombra, sin elevación; cuadrados `48×48` | Ocultos | Ocultos |
| Dialogs (`mat-dialog`) | Width `100vw`, height `auto`, `border-top: 1px solid --border`, fondo `--bg-elev` | Width `min(640px, 90vw)` | Width `min(720px, 70vw)` |
| Snackbar | Full-width (ya existe `snack-mobile` class), borde superior 1px `--border-active` | Bottom-right fixed | Bottom-right fixed |
| `mat-form-field` | Outline filled rectangular sin pill; label `--text-lo` uppercase mono | Igual | Igual |
| `collection-overview__grid` | 1 col | 2 col | 3 col |
| `hw-list__grid` | 1 col | `auto-fill minmax(280px, 1fr)` | igual |
| Wishlist card | Layout horizontal compacto (cover 72×96 + content) | Layout horizontal con `actions` visibles | Igual + hover `border-active` |

### 2.3 Adaptaciones PWA específicas

- **`safe-area-inset`**: el `bottom-nav` añade `padding-bottom: env(safe-area-inset-bottom)` y los FABs ajustan su `bottom` con `calc(var(--bottom-nav-height) + 1rem + env(safe-area-inset-bottom))`.
- **`100dvh` ya en uso**: se mantiene; no cambiar a `100vh`.
- **Touch targets**: `lib-button` mobile = `min-height: 44px`. Iconos `mat-icon-button` que sobrevivan = `48×48`. Verificar en commit 8.
- **Scroll bars ocultas en `pointer: coarse`**: regla ya implantada en `styles.scss`, se preserva.
- **Densidad reducida en mobile**: aunque el theme global usa `density: -2`, los componentes `lib-*` exponen `--lib-gap` y `--lib-padding` que se incrementan en `≤ 768px` (gap `0.75rem → 1rem`, padding `0.5rem → 0.75rem`) para que el tap sea cómodo.

---

## 3. Catálogo de componentes `lib/`

### 3.1 Ubicación y convención

- Carpeta raíz: `src/app/presentation/components/lib/`
- Cada componente: carpeta propia con `*.component.ts | *.component.html | *.component.scss | *.component.spec.ts`
- **Sin Angular Material interno**. CSS puro + tokens nuevos.
- Standalone, `ChangeDetectionStrategy.OnPush`, signal inputs (`input.required<T>()` / `input<T>(default)`).
- Path alias: añadir `@/lib/* → src/app/presentation/components/lib/*` en `tsconfig.json` y `tsconfig.app.json`.
- JSDoc obligatorio en cada `input`/`output`/método público (regla del proyecto).
- Tests: cada componente ≥ 1 spec con `ComponentFixture` que valide render con un input por defecto. Cobertura mínima ya cumple porque son componentes simples.

### 3.2 Componentes

#### 3.2.1 `lib-button`

Selector: `<lib-button>`.

Inputs:
```typescript
readonly label: InputSignal<string> = input.required<string>();
readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined); // Material icon name
readonly variant: InputSignal<'primary' | 'ghost' | 'danger' | 'success'> = input<'primary' | 'ghost' | 'danger' | 'success'>('ghost');
readonly disabled: InputSignal<boolean> = input<boolean>(false);
readonly loading: InputSignal<boolean> = input<boolean>(false);
readonly type: InputSignal<'button' | 'submit' | 'reset'> = input<'button' | 'submit' | 'reset'>('button');
readonly fullWidth: InputSignal<boolean> = input<boolean>(false);
```

Outputs:
```typescript
readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
```

Template HTML (mínimo):
```html
<button
  class="lib-btn"
  [class.lib-btn--primary]="variant() === 'primary'"
  [class.lib-btn--ghost]="variant() === 'ghost'"
  [class.lib-btn--danger]="variant() === 'danger'"
  [class.lib-btn--success]="variant() === 'success'"
  [class.lib-btn--full]="fullWidth()"
  [class.lib-btn--loading]="loading()"
  [type]="type()"
  [disabled]="disabled() || loading()"
  (click)="clicked.emit($event)">
  @if (icon() && !loading()) { <mat-icon class="lib-btn__icon">{{ icon() }}</mat-icon> }
  @if (loading()) { <mat-icon class="lib-btn__icon lib-btn__icon--spin">progress_activity</mat-icon> }
  <span class="lib-btn__label">{{ label() }}</span>
</button>
```

SCSS base:
```scss
.lib-btn {
  --color: var(--text-hi);
  --bg: transparent;
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color); background: var(--bg); color: var(--color);
  font-family: 'JetBrains Mono', monospace; font-weight: 500; font-size: 0.8125rem;
  text-transform: uppercase; letter-spacing: 0.05em;
  cursor: pointer; border-radius: 0; transition: color 120ms linear, border-color 120ms linear;

  &::before, &::after {
    content: ''; display: inline-block; width: 0.4rem; height: 1ch;
    border-color: var(--color); border-style: solid;
  }
  &::before { border-width: 1px 0 1px 1px; margin-right: 0.25rem; } /* "[" */
  &::after  { border-width: 1px 1px 1px 0; margin-left: 0.25rem; }  /* "]" */

  &--primary { --color: var(--primary); }
  &--danger  { --color: var(--accent-rose); }
  &--success { --color: var(--accent-green); }
  &--ghost   { --color: var(--text-mid); }
  &--full    { width: 100%; }

  @media (hover: hover) {
    &:not(:disabled):hover { color: var(--text-hi); border-color: var(--border-active); --color: var(--border-active); }
  }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
  &__icon { font-size: 1rem; width: 1rem; height: 1rem; }
  &__icon--spin { animation: lib-btn-spin 800ms linear infinite; }
}

@keyframes lib-btn-spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .lib-btn {
    padding: 0.625rem 0.875rem; font-size: 0.875rem;
    &::before, &::after { display: none; } /* corchetes ocultos en mobile */
  }
}

@media (prefers-reduced-motion: reduce) {
  .lib-btn__icon--spin { animation: none; }
}
```

Ejemplos de uso:
```html
<!-- CTA primario -->
<lib-button label="GUARDAR" variant="primary" icon="save" (clicked)="onSave()" />
<!-- Destructivo -->
<lib-button label="ELIMINAR" variant="danger" icon="delete" (clicked)="onDelete()" />
<!-- Loading -->
<lib-button label="ENVIANDO" variant="primary" [loading]="saving()" />
```

#### 3.2.2 `lib-card`

Inputs:
```typescript
readonly interactive: InputSignal<boolean> = input<boolean>(false);
readonly padded: InputSignal<boolean> = input<boolean>(true);
readonly variant: InputSignal<'default' | 'accent' | 'muted'> = input<'default' | 'accent' | 'muted'>('default');
```

Outputs:
```typescript
readonly cardClicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
```

Template:
```html
<div
  class="lib-card"
  [class.lib-card--interactive]="interactive()"
  [class.lib-card--padded]="padded()"
  [class.lib-card--accent]="variant() === 'accent'"
  [class.lib-card--muted]="variant() === 'muted'"
  [attr.role]="interactive() ? 'button' : null"
  [attr.tabindex]="interactive() ? 0 : null"
  (click)="interactive() && cardClicked.emit($event)"
  (keydown.enter)="interactive() && cardClicked.emit($any($event))">
  <ng-content />
</div>
```

SCSS:
```scss
.lib-card {
  display: flex; flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 0;

  &--padded { padding: 1rem; gap: 0.75rem; }
  &--accent { border-color: var(--primary); }
  &--muted  { background: transparent; border-color: var(--border); }

  &--interactive {
    cursor: pointer; transition: border-color 120ms linear;
    @media (hover: hover) { &:hover { border-color: var(--border-active); } }
    &:focus-visible { outline: 1px solid var(--border-active); outline-offset: 2px; }
  }
}
@media (max-width: 768px) { .lib-card--padded { padding: 0.875rem; } }
```

Uso: contenedor neutro para todas las cards (game, hardware, wishlist, overview).

#### 3.2.3 `lib-chip`

Inputs:
```typescript
readonly label: InputSignal<string> = input.required<string>();
readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);
readonly color: InputSignal<'primary' | 'green' | 'amber' | 'rose' | 'blue' | 'neutral'> = input<...>('neutral');
readonly filled: InputSignal<boolean> = input<boolean>(false); // si true → fondo del color + texto void (para hero overlays)
```

Template:
```html
<span class="lib-chip lib-chip--{{ color() }}" [class.lib-chip--filled]="filled()">
  @if (icon()) { <mat-icon class="lib-chip__icon">{{ icon() }}</mat-icon> }
  <span class="lib-chip__label">{{ label() }}</span>
</span>
```

SCSS:
```scss
.lib-chip {
  --c: var(--text-mid);
  display: inline-flex; align-items: center; gap: 0.25rem;
  padding: 2px 8px; border: 1px solid var(--c); color: var(--c);
  font-family: 'JetBrains Mono', monospace; font-size: 0.6875rem; font-weight: 500;
  text-transform: uppercase; letter-spacing: 0.06em;
  border-radius: 0; background: transparent;

  &--primary { --c: var(--primary); }
  &--green   { --c: var(--accent-green); }
  &--amber   { --c: var(--accent-amber); }
  &--rose    { --c: var(--accent-rose); }
  &--blue    { --c: var(--accent-blue); }
  &--neutral { --c: var(--text-mid); }

  &--filled { background: var(--c); color: var(--bg-void); }
  &__icon { font-size: 0.75rem; width: 0.75rem; height: 0.75rem; }
}
```

Uso: sustituye `badge-chip`, status-badge, loan-chip, sale-chip, fav-chip, genre-chip, platinum/format chips.

#### 3.2.4 `lib-data-row`

Inputs:
```typescript
readonly label: InputSignal<string> = input.required<string>();
readonly value: InputSignal<string | number | null> = input<string | number | null>(null);
readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);
readonly emphasized: InputSignal<boolean> = input<boolean>(false); // valor en --text-hi grande
```

Template:
```html
<div class="lib-row" [class.lib-row--emphasized]="emphasized()">
  <dt class="lib-row__key">
    @if (icon()) { <mat-icon class="lib-row__icon">{{ icon() }}</mat-icon> }
    <span>{{ label() }}</span>
  </dt>
  <span class="lib-row__dots" aria-hidden="true"></span>
  <dd class="lib-row__value">
    @if (value() !== null) { {{ value() }} }
    @else { <ng-content /> } <!-- valores complejos (stars, lib-chip…) -->
  </dd>
</div>
```

SCSS:
```scss
.lib-row {
  display: grid; grid-template-columns: auto 1fr auto; align-items: baseline; gap: 0.5rem;
  min-height: 1.5rem;

  &__key {
    display: inline-flex; align-items: center; gap: 0.375rem;
    font-family: 'JetBrains Mono', monospace; font-size: 0.6875rem; font-weight: 500;
    color: var(--text-lo); text-transform: uppercase; letter-spacing: 0.06em; margin: 0;
  }
  &__icon { font-size: 0.75rem; width: 0.75rem; height: 0.75rem; color: var(--text-lo); }
  &__dots {
    border-bottom: 1px dotted var(--border); transform: translateY(-3px);
  }
  &__value {
    font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; font-weight: 500;
    color: var(--text-hi); margin: 0; text-align: right;
  }
  &--emphasized .lib-row__value { font-size: 0.9375rem; font-weight: 700; }
}
@media (max-width: 480px) { .lib-row__dots { display: none; } } /* en pantallas estrechas eliminamos puntitos para no recortar */
```

Uso: sustituye `hw-detail__dl`, `game-detail__data-item`, datos de wishlist.

#### 3.2.5 `lib-section-header`

Inputs:
```typescript
readonly label: InputSignal<string> = input.required<string>();
readonly count: InputSignal<number | string | null> = input<number | string | null>(null);
```

Template:
```html
<div class="lib-section-header">
  <span class="lib-section-header__prefix" aria-hidden="true">&gt;</span>
  <h2 class="lib-section-header__label">{{ label() }}</h2>
  @if (count() !== null) {
    <span class="lib-section-header__count">[{{ count() }}]</span>
  }
  <ng-content select="[slot=actions]" />
</div>
```

SCSS:
```scss
.lib-section-header {
  display: flex; align-items: center; gap: 0.5rem;
  padding-bottom: 0.5rem; border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;

  &__prefix { color: var(--primary); font-weight: 700; }
  &__label  { margin: 0; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-mid); }
  &__count  { font-size: 0.6875rem; color: var(--text-lo); }
  ::ng-deep [slot=actions] { margin-left: auto; }
}
```

Uso: sustituye `game-detail__section-title`, `hw-detail__section-title`, títulos de formularios/dialogs.

#### 3.2.6 `lib-command-bar`

Inputs:
```typescript
readonly path: InputSignal<string> = input<string>('monchito ~/library');
readonly flags: InputSignal<readonly string[]> = input<readonly string[]>([]);
readonly cursor: InputSignal<boolean> = input<boolean>(true);
```

Template:
```html
<div class="lib-cmd" aria-hidden="true">
  <span class="lib-cmd__path">{{ path() }}</span>
  <span class="lib-cmd__sep">$</span>
  @for (f of flags(); track f) { <span class="lib-cmd__flag">--{{ f }}</span> }
  @if (cursor()) { <span class="lib-cmd__cursor"></span> }
</div>
```

SCSS:
```scss
.lib-cmd {
  display: flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
  color: var(--text-lo); border-bottom: 1px solid var(--border);

  &__path { color: var(--accent-green); }
  &__sep  { color: var(--text-mid); }
  &__flag { color: var(--accent-amber); }
  &__cursor {
    display: inline-block; width: 0.5em; height: 1em; background: var(--text-hi);
    animation: lib-cmd-blink 1s steps(2) infinite;
  }
}
@keyframes lib-cmd-blink { 50% { opacity: 0; } }
@media (max-width: 1024px) { .lib-cmd { display: none; } }
@media (prefers-reduced-motion: reduce) { .lib-cmd__cursor { animation: none; } }
```

Uso: bajo el `list-page-header` en game-list, hardware-list, wishlist, sólo ≥ 1024px.

#### 3.2.7 `lib-empty-state`

Inputs:
```typescript
readonly title: InputSignal<string> = input.required<string>();
readonly subtitle: InputSignal<string> = input<string>('');
readonly hint: InputSignal<string> = input<string>('$ try a different query');
```

Template:
```html
<div class="lib-empty">
  <pre class="lib-empty__ascii" aria-hidden="true">
┌──────────────────┐
│  NO RESULTS      │
│  0 RECORDS FOUND │
└──────────────────┘
  </pre>
  <p class="lib-empty__title">{{ title() }}</p>
  @if (subtitle()) { <p class="lib-empty__subtitle">{{ subtitle() }}</p> }
  <p class="lib-empty__hint">{{ hint() }}</p>
  <ng-content />
</div>
```

SCSS:
```scss
.lib-empty {
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
  padding: 3rem 1rem; text-align: center;
  &__ascii { color: var(--text-lo); font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; line-height: 1.2; margin: 0; }
  &__title { font-family: 'JetBrains Mono', monospace; font-size: 0.875rem; font-weight: 700; color: var(--text-hi); text-transform: uppercase; margin: 0; }
  &__subtitle { font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem; color: var(--text-mid); margin: 0; }
  &__hint { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--accent-green); margin: 0; }
}
```

Uso: sustituye SVGs + textos de `game-list__empty`, `hw-list__empty`, wishlist empty.

#### 3.2.8 `lib-badge`

Inputs:
```typescript
readonly label: InputSignal<string | number> = input.required<string | number>();
readonly variant: InputSignal<'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = input<...>('neutral');
readonly dot: InputSignal<boolean> = input<boolean>(false); // sólo punto, sin label, para indicador
```

Template:
```html
<span class="lib-badge lib-badge--{{ variant() }}" [class.lib-badge--dot]="dot()">
  @if (!dot()) { {{ label() }} }
</span>
```

SCSS:
```scss
.lib-badge {
  --c: var(--text-mid);
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 1.25rem; height: 1.125rem; padding: 0 0.375rem;
  font-family: 'JetBrains Mono', monospace; font-size: 0.625rem; font-weight: 700;
  color: var(--c); border: 1px solid var(--c); border-radius: 0;

  &--primary { --c: var(--primary); }
  &--success { --c: var(--accent-green); }
  &--warning { --c: var(--accent-amber); }
  &--danger  { --c: var(--accent-rose); }
  &--info    { --c: var(--accent-blue); }
  &--neutral { --c: var(--text-mid); }

  &--dot {
    width: 8px; min-width: 8px; height: 8px; padding: 0;
    background: var(--c); border: none;
  }
}
```

Uso: contador de filtros activos en `list-page-header`, indicador de pending/new en nav, FAB-filter badge.

### 3.3 Resumen tabla

| Componente | Sustituye en código existente |
|---|---|
| `lib-button` | Cualquier `mat-button`, `mat-stroked-button`, `mat-raised-button`, `mat-flat-button` no proyectado dentro de mat-form-field |
| `lib-card` | `mat-card.game-card__front`, `hw-list__card`, `collection-overview__card`, `wishlist-card`, contenedores de form |
| `lib-chip` | `app-badge-chip`, `game-card__loan-chip/sale-chip`, `game-detail__*-chip`, `hw-list__card-chips` (los `<mat-chip>` proyectados) |
| `lib-data-row` | `hw-detail__dl-row`, `game-detail__data-item`, filas de wishlist |
| `lib-section-header` | `hw-detail__section-title`, `game-detail__section-title`, headers de dialogs |
| `lib-command-bar` | NUEVO (decoración) bajo `list-page-header` desktop |
| `lib-empty-state` | `game-list__empty`, `hw-list__empty`, wishlist empty |
| `lib-badge` | `game-list__filter-badge`, contadores varios |

---

## 4. Plan de commits

> Todos los commits se hacen sobre `feat/terminal-collector-redesign`. **Ningún PR intermedio** — checkpoint visual + npm run build/test/lint en cada cierre de fase. PR único al final del FASE 4.

### FASE 0 — Fundación

> **Objetivo**: dejar tokens, tipografía, theme global y librería `lib/` lista pero sin romper nada existente. Tras este commit la app sigue funcionando con la paleta nueva aplicada a los componentes Material (que ya usan los tokens `--mat-sys-*`).

#### Commit 0a — `style(theme): paleta OLED + tipografía mono y reset brutalist`

Ficheros:
- `src/index.html` — Reemplazar links de Google Fonts (Outfit, Space Grotesk) por `JetBrains+Mono` + `IBM+Plex+Sans` (importación según §1.3).
- `src/styles.scss` — Cambios:
  - `html` con `color-scheme: dark` fijo (eliminar variante light).
  - `mat.theme()` con `density: -2`, typography mono/sans según §1.4, palette violet.
  - Bloque `:root` reescrito con la paleta OLED (§1.4). Eliminar tokens legacy listados en §1.4.
  - `--radius-md/lg/full` se mantienen como tokens existentes pero se reasignan: `--radius-md: 0; --radius-lg: 0; --radius-full: 0;` para que el código residual no rompa la regla 1 hasta que migremos cada componente. Único token con valor: `--radius-xs: 2px`.
  - Sobrescritura de `--mat-sys-*` (§1.4).
  - Eliminar bloque `html.dark-mode` específico (todo es dark ya).
  - `body { font-family: 'JetBrains Mono', monospace; }`. `h1,h2,h3 { font-family: 'IBM Plex Sans', sans-serif; }`.
  - Scrollbar: cambiar `border-radius: var(--radius-full)` por `border-radius: 0`. Color thumb pasa a `var(--border-strong)`, hover `var(--border-active)`.
  - `:focus-visible`: `outline: 1px solid var(--border-active); outline-offset: 2px; border-radius: 0;`.
  - Añadir bloque `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`.
  - `hw-detail__section` y `hw-detail__dl` global: actualizar a estilo terminal (borde 1px `--border`, padding `1rem`, `border-radius: 0`, dt mono uppercase 0.6875rem `--text-lo`, dd mono `--text-hi` 0.8125rem). Mantener selectores porque siguen siendo proyectados.
  - Eliminar `--shadow-*`. Si quedan usos en otros ficheros, lo arreglamos en su commit correspondiente.

Responsive a preservar:
- Las escalas de `font-size` raíz (`1440/1920/2560/3840`) intactas.
- `@media (pointer: coarse)` scrollbar hidden — intacta.
- `@media (max-width: 600px) .snack-mobile` — intacta (sólo cambia `border-radius: 0`).
- Bloque `@media (max-width: 768px) .hw-detail__dl` — intacto, mantiene la columna única.

Criterio de aceptación 0a: `npm run build` ok; visualmente la app se ve "rota" en mil sitios (colores planos, sin sombras, sin redondeos) pero **navegable**. No se han tocado componentes aún.

#### Commit 0b — `feat(lib): scaffolding de componentes lib (button, card, chip, data-row, section-header, command-bar, empty-state, badge)`

Ficheros nuevos:
- `src/app/presentation/components/lib/lib-button/lib-button.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-card/lib-card.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-chip/lib-chip.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-data-row/lib-data-row.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-section-header/lib-section-header.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-command-bar/lib-command-bar.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-empty-state/lib-empty-state.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/lib-badge/lib-badge.component.{ts,html,scss,spec.ts}`
- `src/app/presentation/components/lib/index.ts` — barrel export.

Ficheros editados:
- `tsconfig.json` y `tsconfig.app.json` — añadir alias `@/lib/*` → `src/app/presentation/components/lib/*`.

Cada spec usa el template del proyecto: `TestBed.configureTestingModule({ imports: [Component] })`, render con `fixture.detectChanges()`, asserts mínimos sobre el host class y un input variant.

Responsive: cada `lib-*.scss` incorpora ya su bloque `@media (max-width: 768px)` según §3.

Criterio de aceptación 0b: `npm run build`, `npm test` y `npm run lint` pasan. Los `lib-*` no se usan aún en ningún sitio.

→ **CHECKPOINT 0 (no se exige revisión visual; sólo build/test verde).**

---

### FASE 1 — Core de la colección

> **Objetivo**: refactor visual de game-card y game-detail. Es la pieza más visible del producto.

#### Commit 1 — `style(games): game-card migrada a lib-card + lib-chip + reglas Terminal Collector`

Ficheros:
- `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.html`
- `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.scss`
- `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.ts` — eliminar `MatCard`, importar `LibCardComponent`, `LibChipComponent`. Mantener flip-state e `extractDominantColor` (la card sigue mostrando glow… pero adaptado: ahora se usa como `border-color: var(--dominant-glow)` en hover, no como sombra).

Cambios SCSS detallados:
- Quitar `mat-card`, sustituir por `<lib-card [interactive]="true" variant="default">` envolviendo el contenido.
- `.game-card` host: quitar `perspective` y `transition` decorativa — la card no flota.
- Quitar `:hover { transform: translateY(-4px); box-shadow: 0 12px 40px ... }`. Reemplazar por: dentro de `@media (hover: hover)` cambiar el `border-color` del lib-card a `var(--dominant-glow)` (cae back a `--border-active` si no hay dominant). Aplicado vía CSS variable que la card expone.
- `.game-card__front` → mantener el wrapper como contenedor de imagen, pero su `background-color` pasa a `var(--bg-surface)`, `border` se delega al lib-card padre, `border-radius: 0`, `aspect-ratio: 3 / 4` se mantiene.
- `.game-card__front--digital::before` (la franja "DIGITAL"): reescribir como overlay top mono: fondo `var(--accent-blue)`, color `var(--bg-void)`, font-family JetBrains Mono 700, letter-spacing 0.2em, font-size 0.625rem, altura 1.5rem, sin gradient (color plano).
- `.game-card__back` y `__back-overlay`: simplificar — fondo `var(--bg-surface-hi)`, eliminar `backdrop-filter` y `linear-gradient`. La descripción se renderiza en mono `--text-mid`, título en IBM Plex `--text-hi`. Quitar `--dominant-glow` aquí.
- `.game-card__status-badge`: convertir a `<lib-chip [icon]="..." [color]="green|amber|blue|neutral" filled>` sobre la imagen (top-left), `border-radius: 0`. Se elimina el círculo.
- `.game-card__favorite`: sustituir el corazón animado por `<lib-chip color="rose" filled icon="favorite">` o un `<mat-icon>` simple `--accent-rose` sin animación. **Eliminar `@keyframes heartbeat`**.
- `.game-card__overlay`: fondo `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)` (mismo gradiente, sin blur). Mantenemos overlay porque el título tiene que ser legible sobre la portada — no podemos meterlo en una "card terminal" plana sin esconder la cover.
- `.game-card__title`: cambiar `font-family` a `'IBM Plex Sans'`, weight 600, sin cambio de tamaño.
- `.game-card__edition`: mono, italic queda, color `--text-mid`.
- `.game-card__platform-row`: ahora usa `<lib-chip [label]="game().platform" color="primary">` (eliminamos `app-badge-chip` aquí).
- `.game-card__loan-chip`, `__sale-chip`: sustituir por `<lib-chip color="amber" icon="handshake">` y `<lib-chip color="green" icon="sell">`. Eliminar los gradients.
- `.game-card__price`: mono, weight 700, color `--text-hi`. Texto formato moneda en mono se ve bien.
- `.game-card__flip-btn`: usar `<lib-button variant="ghost" icon="flip_to_back" label="">` (label vacío → sólo icono); o conservar `mat-icon-button` con override de estilo `--text-mid`. Decisión: conservar `mat-icon-button` pero override su look.
- Eliminar todos los `box-shadow` residuales y `transform: scale(1.04)` del image hover.

Responsive a preservar:
- `@media (max-width: 768px)` y `@media (max-width: 550px)` se mantienen con la reorganización de chips en columna y el ocultado de `loan-name`. Ajustes adicionales: `@media (max-width: 768px)` desactiva el hover del lib-card padre (ya viene gratis del componente).

Snippet de uso del lib-chip dentro del HTML:
```html
@if (gameStatus()) {
  <lib-chip class="game-card__status-badge"
            [label]="gameStatus()!.code"
            [icon]="gameStatus()!.icon"
            [color]="statusColor()"
            filled />
}
```

Add un computed `statusColor(): 'green'|'amber'|'blue'|'rose'|'neutral'` que mapee `game().status` al variant del chip.

Criterio de aceptación 1: build/test/lint OK. Visualmente las cards son rectángulos con borde 1px, título sans, datos mono, sin transform en hover, franja DIGITAL plana.

#### Commit 2 — `style(games): game-detail migrada a lib-data-row + lib-section-header + lib-button`

Ficheros:
- `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.html`
- `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.scss`
- `.../game-detail.component.ts` — añadir imports `LibButtonComponent`, `LibChipComponent`, `LibDataRowComponent`, `LibSectionHeaderComponent`. Eliminar imports `BadgeChipComponent` si ya no se usa.

Cambios HTML:
- `<section class="game-detail__section">` → mantener wrapper, su `<h2>` se reemplaza por `<lib-section-header [label]="('gameDetail.opinion' | transloco)" />`.
- Filas `.game-detail__data-item` → `<lib-data-row [label]="..." [icon]="..." [value]="..." />` o con `<ng-content>` para el caso de las estrellas:
  ```html
  <lib-data-row label="RATING" icon="star">
    <span class="game-detail__stars">
      @for (_ of ratingStars(); track $index) { <mat-icon>star</mat-icon> }
      @if (hasHalfStar()) { <mat-icon>star_half</mat-icon> }
    </span>
    <span>{{ g.personalRating }}/10</span>
  </lib-data-row>
  ```
- `.game-detail__chips-row` → todos los chips a `<lib-chip>` con `filled` (porque van sobre la hero, necesitan fondo).
- Tabs de copias (`.game-detail__copy-tab`): rediseñar — quitar border-bottom transition gradual. Activo = `border-bottom: 1px solid var(--primary)`, color `--text-hi`; inactivo border-bottom transparente, color `--text-lo`. Sin transición.
- `.game-detail__genres` → cada `<span>` pasa a `<lib-chip color="neutral">`.
- Botones topbar (back, edit, sell, kebab): se mantienen como `mat-icon-button` pero con override SCSS de fondo `var(--bg-surface)` borde 1px `--border`, hover `border-color: --border-active`, sin backdrop-filter ni glass. Los iconos siguen siendo Material.
- `.game-detail__add-copy-btn` → `<lib-button label="AÑADIR_COPIA" icon="library_add" variant="ghost" />`. Quitar el "dashed border".
- `.game-detail__sold-banner` → contenedor 1px `var(--accent-green)`, fondo transparente, texto mono. Eliminar `color-mix(... 14%)`.
- `<mat-spinner>` de loading: aceptable mantener; pero rodearlo de un texto mono `> LOADING...` opcional.

Cambios SCSS:
- `.game-detail__hero`: backdrop ya no usa radial-gradient con `--dominant`. Pasa a un fondo plano `var(--bg-surface)`. La portada (cover-wrap + cover) se mantiene con mask-image (es UX importante para la transición a contenido). El overlay gradient se mantiene pero ajustado: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)`.
- `.game-detail__title`: pasa a `font-family: 'IBM Plex Sans'`, weight 600 (no 700), tracking normal.
- `.game-detail__section-title`: se elimina (la reemplaza `lib-section-header`).
- `.game-detail__data-grid`: gap `0.25rem` (más densidad) y elimina la flexbox column para usar `display: flex; flex-direction: column;` simple porque cada lib-data-row ya gestiona su grid interno.
- Eliminar `.game-detail__genre-chip` (lo reemplaza lib-chip).
- Eliminar todos los `border-radius: var(--radius-md/full)`.
- Eliminar todos los `box-shadow`.
- Reescribir todos los `linear-gradient(135deg, var(--color-*-start), var(--color-*-end))` a colores planos del accent correspondiente.
- `.game-detail__hero-backdrop` se mantiene pero con `background: var(--bg-surface);` (sin radial, sin dominant).

Responsive a preservar:
- `@media (max-width: 768px) and (orientation: portrait)`: mantener; sólo ajustar tamaños tipográficos a mono.
- `@media (orientation: landscape) and (max-height: 500px)`: **layout 2-col 42%/58% se preserva intacto** — es PWA crítico. Sólo cambian colores y radius.
- En mobile portrait, el body sigue con `padding-bottom: calc(80px + 1.25rem)` para no ser tapado por la bottom-nav.

Criterio de aceptación 2: build/test/lint OK. El detail muestra el patrón `> SECCIÓN` con líneas `LABEL ········· VALUE` en mono, chips rectangulares y botones `[ ACCIÓN ]`.

→ **CHECKPOINT 1**: revisar visualmente game-card grid y game-detail en 375 / 768 / 1024 / 1440 / 1920 / 2560. Verificar que:
- Cards son rectángulos sin transform.
- Detail muestra patrón ls-la en datos.
- Hover sólo cambia borde.
- Landscape mobile sigue mostrando layout 2-col.
- Sin emojis, sin sombras decorativas.

---

### FASE 2 — Chrome y navegación

> **Objetivo**: chrome global (app.component, drawer, snackbar, dialogs) + game-list toolbar/filtros.

#### Commit 3 — `style(chrome): app shell terminal (nav-rail, bottom-nav, topbar, profile menu, snackbar, dialogs)`

Ficheros:
- `src/app/app.component.html` (cambios menores: brand text "MONCHITO_LIB" en mono junto al icono en topbar y nav-rail).
- `src/app/app.component.scss` (reescritura completa).
- `src/styles.scss` (overrides globales de `mat-mdc-dialog`, `mat-mdc-menu`, `mat-mdc-snackbar`).

Cambios SCSS app-shell:
- `.nav-rail`: fondo `var(--bg-surface)`, borde derecho 1px `var(--border)`, padding `0.5rem 0`. Width permanece 88px.
- `.nav-rail__brand`: añadir texto vertical opcional "v1.0" mono color `--text-lo` 0.625rem bajo el icono.
- `.nav-rail__item`: ya no usa `border-radius` ni fondo activo. **Activo**: borde izquierdo 2px `var(--primary)` + color `--text-hi` + fondo `var(--bg-surface-hi)`. **Inactivo**: color `--text-lo`. **Hover** (`@media (hover: hover)`): color `--text-mid`, fondo `var(--bg-surface-hi)`. Sin transitions decorativas.
- `.nav-rail__label`: mono uppercase 0.6875rem.
- `.nav-rail__divider`: 1px `var(--border-strong)`, width 60% (más visible).
- `.nav-rail__avatar`: `border-radius: 0`, borde 1px `var(--border)`, **eliminar** `transform: scale(1.05)` en hover.
- `.app-topbar`: fondo `var(--bg-surface)`, borde inferior 1px `var(--border)`, padding `0.625rem 0.875rem`. Title con prefijo `>` en `var(--primary)`. Avatar idéntico al rail (0 radius).
- `.bottom-nav`: fondo `var(--bg-surface)`, borde superior 1px `var(--border)`, **sin pill, sin transform, sin transition**. Eliminar `.bottom-nav__pill` por completo. El ítem activo: borde superior 2px `var(--primary)` + color `--primary` + fondo `var(--bg-surface-hi)`. Inactivo: color `--text-lo`. Padding `safe-area-inset-bottom` añadido.
- `.profile-menu__panel`: eliminar `background-image` con banner — la estética terminal no admite fotografía como fondo decorativo. Mantener solo `var(--bg-elev)`. `overlay` queda como contenedor de identidad/actions, sin gradient.
- `.profile-menu__avatar`: cuadrado, `border-radius: 0`, borde 1px `--border-strong`.
- `.profile-menu__name`: IBM Plex Sans 600.
- `.profile-menu__action-btn`: pasa a `<lib-button>` directamente.

Cambios styles.scss (overrides globales):
- `.mat-mdc-dialog-container .mdc-dialog__surface`: fondo `var(--bg-elev)`, borde 1px `var(--border)`, `border-radius: 0`, `box-shadow: none`.
- `.mat-mdc-select-panel`, `.mat-mdc-menu-panel`: fondo `var(--bg-elev)`, borde 1px `var(--border)`, radius 0, sin shadow.
- `.mat-mdc-snack-bar-container`: borde 1px `var(--border-active)`, radius 0, fondo `var(--bg-elev)`, font-family mono.
- `.mat-mdc-form-field`: outline filled mono, label uppercase tracking 0.05em color `--text-lo`.

Responsive:
- `@media (max-width: 768px)` mantiene `.nav-rail { display: none }`, `.app-topbar { display: flex }`, `.bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: var(--bottom-nav-height); z-index: var(--z-nav) }`. Esto **no cambia**; solo cambian los estilos internos.
- Tablet 769–1024: nav-rail visible (igual que desktop).

Criterio de aceptación 3: build/test/lint OK. Toda la app tiene chrome consistente: rail/topbar/bottom-nav planos, sin redondeos, sin sombras, sin pill animada.

#### Commit 4 — `style(games): toolbar games con lib-command-bar + filters drawer + filters-bar terminal`

Ficheros:
- `src/app/presentation/pages/collection/pages/games/games.component.html` (añadir `<lib-command-bar ...>` debajo del header en desktop).
- `src/app/presentation/pages/collection/pages/games/games.component.scss`
- `src/app/presentation/pages/collection/components/list-page-header/list-page-header.component.{html,scss}` (search input mono, stats mono, botones a lib-button)
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-bar/game-list-filters-bar.component.{html,scss}` (chips a lib-chip, "clear all" a lib-button)
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.{html,scss}` (form mono, secciones con lib-section-header, botones lib-button)
- `src/app/presentation/pages/collection/pages/games/components/game-row/game-row.component.{html,scss}` (refactor a lib-card horizontal + lib-data-row)

Snippet `lib-command-bar` en games.component.html (justo bajo `<app-list-page-header>` antes de `<app-game-list-filters-bar>`):
```html
<lib-command-bar
  path="monchito ~/library/games"
  [flags]="commandFlags()" />
```
Y en TS:
```typescript
readonly commandFlags: Signal<readonly string[]> = computed(() => {
  const flags: string[] = [];
  if (this.viewMode() === 'list') flags.push('view=list');
  if (this.searchTerm()) flags.push(`search="${this.searchTerm()}"`);
  if (this.activeFilterCount() > 0) flags.push(`filters=${this.activeFilterCount()}`);
  return flags;
});
```

Cambios games.component.scss:
- `.game-list__container`: fondo `var(--bg-void)`.
- `.game-list__grid`: padding `0.75rem` (más denso); gap `0.75rem`.
- `.game-list__skeleton-card`: `border-radius: 0`, fondo `var(--bg-surface)`, borde 1px `var(--border)`.
- `.game-list__empty` se reemplaza por `<lib-empty-state>` en HTML; SCSS borra estilos huérfanos (`.es-*`, `.game-list__empty-svg`, etc.).
- `.game-list__stat`: mono, tracking, separador `|` en `--text-lo` (no un div divider con altura).
- `.game-list__filter-fab` y `__fab`: cuadrados 48×48 (no círculo), fondo `var(--bg-surface)`, borde 1px `var(--border-active)`, icono `var(--primary)`, sin elevación, sin sombra. `bottom` con safe-area.
- `.game-list__filter-badge` → `<lib-badge variant="primary">{{ activeFilterCount() }}</lib-badge>` posicionado top-right del FAB.
- `.game-list__filters-drawer`: ancho `22rem`, fondo `var(--bg-surface)`, borde izq 1px `var(--border)`.

Cambios list-page-header:
- Layout sigue siendo flex one-row. Stats pegados a la izquierda con tipografía mono y separadores `|`.
- Search input: `mat-form-field` con prefijo `$ ` visual (`::before` content), placeholder mono uppercase.
- Botones de view-mode, filter, add: a `<lib-button>` ghost con icon + label corto (en mobile ocultar label).

Cambios filters-bar:
- Cada filtro activo a `<lib-chip color="primary">` con `(close)` (botón X interno). Crear input `closable: boolean` en `lib-chip` si no estaba — **decisión**: añadir `closable: InputSignal<boolean>` + output `closed: OutputEmitterRef<void>` al `lib-chip` ahora (modificación retroactiva, todavía dentro de scope del rediseño).
- "Clear all" → `<lib-button variant="ghost" label="LIMPIAR" icon="filter_alt_off" />`.

Cambios filters-sheet:
- Header del sheet con `<lib-section-header label="FILTROS" />`.
- Cada grupo de filtro con su propio `<lib-section-header label="PLATAFORMA" />` etc.
- Botones del footer: `[ APLICAR ]` (primary) y `[ RESET ]` (ghost) con lib-button.

Cambios game-row:
- Convertir a `<lib-card>` horizontal: cover 64×85 a la izquierda, `<div class="game-row__data">` con título IBM Plex + 3-4 `<lib-data-row>` (platform, price, status). Chips inline con `<lib-chip>`.
- Eliminar todas las sombras y redondeos.

Responsive:
- `≤ 820px`: padding grid `0.5rem`, `lib-command-bar` ya oculto a ≤ 1024. FABs en posición fija con safe-area.
- `≤ 768px` filters: el drawer `mat-drawer` mode="over" position="end" en mobile se cambia a `position="bottom"` y altura `auto` para comportarse como bottom-sheet. Esto requiere un binding condicional en el HTML basado en `BreakpointObserver` (signal `isMobile()` que ya debería existir; si no, instanciarlo en games.component).

Criterio de aceptación 4: build/test/lint OK. La toolbar muestra prompt `> games` con flags; filtros activos como chips rectangulares mono; empty state como ASCII art mono.

→ **CHECKPOINT 2**: revisar games-list + game-detail + chrome global en 375 / 768 / 1024 / 1440 / 1920 / 2560. Verificar:
- Command-bar visible sólo ≥ 1024.
- FABs cuadrados visibles ≤ 820.
- Drawer derecho ≥ 1025; bottom-sheet ≤ 768.
- Nav-rail vs bottom-nav cambio limpio en 768.

---

### FASE 3 — Hardware, wishlist, collection-overview

#### Commit 5 — `style(hardware): hardware-list-shell + hardware-detail-shell + consoles/controllers cards`

Ficheros:
- `src/app/presentation/pages/collection/components/hardware-list-shell/hardware-list-shell.component.{html,scss}`
- `src/app/presentation/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component.{html,scss}` (si existe — usar `find` para localizar y procesar igual)
- `src/app/presentation/pages/collection/pages/consoles/consoles.component.{html,scss}` y `controllers.component.{html,scss}` (proyecciones de `cardHeaderTpl` y `cardChipsTpl`)
- `src/app/presentation/pages/collection/pages/consoles/pages/console-detail/console-detail.component.{html,scss}` y equivalentes en controllers

Cambios `hardware-list-shell`:
- Sustituir `.hw-list__card` por `<lib-card [interactive]="true" (cardClicked)="detailClick.emit(item)">`.
- Eliminar `@keyframes cardIn` y la animación de entrada (regla 3).
- Header de la card: icono + título IBM Plex (modelo) + brand mono `--text-mid` + chevron `>` mono a la derecha (no `mat-icon`).
- `cardChipsTpl`: todos los chips proyectados que las child pages renderizan se cambian a `<lib-chip>` con variant correspondiente. La hoja child (consoles, controllers) edita su template para usar lib-chip.
- `.hw-list__card-meta`: usar `<lib-data-row>` por cada meta (price, date, store).
- FAB: cuadrado igual que en game-list (commit 4).
- Empty state: sustituir SVG + textos por `<lib-empty-state>`.
- Skeletons: cambiar `borderRadius` a `0`, fondo `var(--bg-surface)`.

Cambios `hardware-detail`:
- Sustituir `hw-detail__section` y `hw-detail__dl` por `<lib-section-header>` + repetición de `<lib-data-row>`. **Importante**: los selectores globales en `styles.scss` para `hw-detail__*` quedan obsoletos — se eliminan al cerrar este commit.
- Color swatch `.hw-list__card-color` se mantiene como `width:20px;height:20px;border:1px solid var(--border-strong);border-radius:0`.

Responsive:
- `@media (max-width: 768px)`: `hw-list__grid` 1 col, FAB visible. Sin cambios estructurales.

Criterio de aceptación 5: build/test/lint OK.

#### Commit 6 — `style(wishlist): wishlist-list + wishlist-card + dialogs`

Ficheros:
- `src/app/presentation/pages/wishlist/wishlist.component.{html,scss}`
- `src/app/presentation/pages/wishlist/components/wishlist-card/wishlist-card.component.{html,scss}`
- Dialogs y formularios de wishlist (localizar con `find ... -name "wishlist-*-dialog*"`).

Cambios `wishlist-card`:
- Sustituir el host article por `<lib-card>` con padding propio.
- Cover wrapper: `border-radius: 0`, borde 1px `var(--border)`. Sustituir placeholder por `mat-icon` en `--text-lo`.
- `.wishlist-card__title`: IBM Plex 600. `.wishlist-card__priority`: estrellas mono.
- `.wishlist-card__platform-badge`, `__genre-chip`: a `<lib-chip color="primary"|"neutral">`.
- `.wishlist-card__price`: a `<lib-data-row label="PRECIO" icon="sell" [value]="...">`.
- `.wishlist-card__store-links`: cada `<a>` a `<lib-button variant="ghost" label="...">` con `(clicked)="window.open(link.url)"` — preservar `target="_blank"` con `rel="noopener"`.
- `.wishlist-card__actions`: tres `<lib-button variant="ghost|success|danger" icon="..." label="">` (label vacío = solo icono).

Responsive: igual estructura; `--mobile` sigue ocultando store-links y actions (mantenido).

Criterio de aceptación 6: build/test/lint OK.

#### Commit 7 — `style(overview): collection-overview con lib-card + cifras mono`

Ficheros:
- `src/app/presentation/pages/collection/pages/collection-overview/collection-overview.component.{html,scss,ts}`

Cambios:
- Título: IBM Plex 600 + prefijo `> ` mono `var(--primary)`.
- Total banner: label mono uppercase `--text-lo`; importe en mono 700 `--text-hi` (no `--primary` — el énfasis lo da el tamaño y el color claro).
- `.collection-overview__grid`: 3 col desktop, 2 col tablet (769–1024), 1 col mobile.
- `.collection-overview__card`: sustituir por `<lib-card [interactive]="true">`. Eliminar `transform: translateY(-2px)` y `:active`. Padding `1.5rem 1rem`.
- Estructura interna: icono Material grande arriba, después `<lib-section-header [label]="title">`, después `<lib-data-row>` con `ITEMS` y `TOTAL`. Subtitle mono `--text-mid`.

Responsive: igual; `@media (max-width: 768px)` cambia a 1 col.

Criterio de aceptación 7: build/test/lint OK.

→ **CHECKPOINT 3**: revisar wishlist + hardware + overview en los 6 viewports. Verificar consistencia visual con games.

---

### FASE 4 — Responsive PWA

#### Commit 8 — `style(responsive): auditoría exhaustiva y adaptación PWA`

Pasada quirúrgica sobre todos los SCSS modificados para garantizar:

1. **Touch targets**: ninguna superficie interactiva < 44×44 en mobile. Casos críticos a revisar manualmente:
   - `lib-button` mobile (ya 44px min-height).
   - `lib-chip` con `closable`: en mobile el botón X interno debe ser 24px clickable area (no 12px).
   - `lib-data-row` no es interactivo.
   - Flip-btn de game-card (mat-icon-button 40px → llevarlo a 44px en mobile).
   - Stars de wishlist-card (no son interactivos, OK).

2. **Safe-area-inset**: revisar `bottom-nav`, FABs (filter + add), snackbar. Añadir `padding-bottom: env(safe-area-inset-bottom)` donde aplique.

3. **Landscape mobile** (orientation landscape, max-height 500px): re-verificar:
   - `game-detail` 2-col 42/58 mantiene legibilidad.
   - `bottom-nav` se oculta (`display: none`) si la altura es muy baja (decisión: dejarla pero comprimida 48px). Implementar `@media (orientation: landscape) and (max-height: 480px) { .bottom-nav { height: 48px; } .bottom-nav mat-icon { font-size: 1rem; } }`.
   - FABs reposicionados (bottom 1rem desde la base).

4. **Ultra-wide** (≥ 2560px):
   - `game-list__grid` 7 col, gap 1rem (mantener densidad terminal).
   - `lib-card` padding sigue siendo 1rem (el escalado raíz `font-size: 20px` ya agranda los rem).
   - `game-detail__body max-width` sube a 960px en `≥ 2560`.
   - `collection-overview__grid max-width` sube a 1200px en `≥ 1920`.

5. **Reduce-motion**: confirmar que ninguna animación específica de componente (lib-cmd cursor blink, lib-btn spin) ignora `prefers-reduced-motion`. Cada uno tiene su override en su SCSS — verificar.

6. **Eliminación final de tokens obsoletos**: pasar grep por `--shadow-`, `--color-favorite`, `--color-loan`, `--color-sale`, `--color-digital`, `--color-status-`, `--radius-md` (excepto donde se haya re-aliased a 0), `box-shadow:` para asegurarse de que no quedan usos.

7. **i18n y a11y** sin cambios funcionales pero verificar que `aria-label` siguen presentes en todos los lib-button/lib-chip/lib-card interactivos.

8. **Hover táctil**: confirmar que ningún `@media (hover: hover)` está mal anidado. La regla 3 obliga a que los hovers vivan dentro de esa media query — auditoría manual fichero a fichero.

Responsive específico que se verifica en cada viewport:

| Viewport | Verificación |
|---|---|
| 375 (mobile pequeño) | Bottom-nav visible, FAB add visible, FAB filter visible, drawer abre como bottom-sheet, cards en 2 col, sin command-bar, botones sin corchetes |
| 768 (mobile grande / tablet portrait) | Bottom-nav todavía visible, FABs visibles, transición previa a nav-rail (en 769 cambia) |
| 1024 (tablet landscape / desktop pequeño) | Nav-rail visible, FABs ocultos, command-bar empieza a verse, drawer lateral derecho |
| 1440 (desktop large) | 5 col grid, command-bar con flags, body max-width 720px en detail |
| 1920 (ultra-wide) | 6–7 col grid, font-size raíz 18px, todo escalado proporcional |
| 2560 (ultra-wide-xl) | 7–8 col grid, font-size raíz 20px, max-widths ampliados |

Criterio de aceptación 8: build/test/lint OK. Revisión visual completa en los 6 viewports usando DevTools.

→ **CHECKPOINT 4**: revisión integral. Tras este punto el redesign está completo a nivel de componentes; los pulidos finales de Material residual quedan para FASE 5.

---

### FASE 5 — Material overrides y lib extras

> **Objetivo**: rematar los Materiales que aún parecen "Material por defecto" después de las fases 0–4 — slide-toggle, menu-items, datepicker, calendario, spinner, ripple del icon-button — sin tocar HTML de pantallas existentes. Y entregar dos `lib/*` opcionales (`lib-icon-button`, `lib-spinner`) listos para sustituir gradualmente los `mat-icon-button` y `mat-progress-spinner`/`mat-spinner` residuales detectados en el inventario.
>
> **Esta fase no contiene migración de HTML**: el único cambio templátil permitido es el reemplazo 1-a-1 de `<mat-(progress-)?spinner>` por `<app-lib-spinner>` (commit 10), porque ambos son nodos hoja sin estado. Los `mat-icon-button` existentes se mantienen donde están — su override SCSS (commit 9) los convierte visualmente en cuadrados terminal. `lib-icon-button` queda disponible para los componentes que se creen o se refactoricen en el futuro.
>
> **Estado al entrar en FASE 5**: `src/styles.scss` ya cubre los overrides de `mat-mdc-dialog`, `mat-mdc-menu-panel`, `mat-mdc-snack-bar-container`, `mat-mdc-select-panel`, `mat-mdc-form-field` (outline + label mono uppercase) y `mat-mdc-tooltip` desde el commit 3. Lo que queda son los Materiales que entonces no se priorizaron: slide-toggle, `mat-mdc-menu-item` (texto, hover, divider), datepicker (toggle, calendar, header), `mat-mdc-icon-button` (ripple redondo), `mat-mdc-progress-spinner` (color SVG y `cx/cy` redondeado), `mat-mdc-form-field` (mensajes hint/error/required y `mat-datepicker-toggle` icon).

#### Commit 9 — `style(overrides): Material slide-toggle, menu-item, datepicker, icon-button y spinner terminal`

Sin tocar ningún `.html` ni `.ts` de pantallas: todo el commit vive en `src/styles.scss`. Razón: estos selectores son del shadow DOM/encapsulated content de Material que sólo se atraviesa con overrides globales `!important`.

Ficheros:
- `src/styles.scss` — añadir nuevas secciones al bloque `Material overrides — Terminal Collector` (después de las existentes, antes de la sección `Datepicker` ya presente que se reescribe). Mantener el orden visual del fichero: dialog → select panel → menu → snackbar → form-field → tooltip → **slide-toggle (nuevo)** → **icon-button (nuevo)** → **progress-spinner (nuevo)** → datepicker (extendido) → reduced-motion (sin cambios).

Cambios por selector:

**1. `.mat-mdc-slide-toggle` → cuadro `[X]` / `[ ]` terminal**

Justificación UX: el componente sólo se usa en `sale-form.component.html` (1 ocurrencia, `formControlName="forSale"`). Mantener la semántica de Material (label asociada, ARIA, valor binario, integración con ReactiveForms) y reemplazar únicamente la apariencia. Lectura inspirada en el estilo de `lib-button` (corchetes via pseudo-elementos `::before/::after`).

Selectores y reglas:
```scss
.mat-mdc-slide-toggle {
  // Eliminar la pista redondeada de MDC
  .mdc-switch__track,
  .mdc-switch__handle-track,
  .mdc-switch__handle,
  .mdc-switch__ripple,
  .mdc-switch__shadow,
  .mdc-switch__icons {
    display: none !important;
  }

  // El botón nativo del switch pasa a ser un cuadrado 1ch x 1ch con borde 1px
  .mdc-switch {
    width: auto !important;
    height: auto !important;
    background: transparent !important;

    &::before {
      content: '[ ]';
      font-family: var(--font-mono);
      font-size: 0.8125rem;
      color: var(--text-mid);
      letter-spacing: 0;
      line-height: 1;
    }

    &.mdc-switch--selected::before {
      content: '[X]';
      color: var(--primary);
    }
  }

  // Label a la derecha (mat-slide-toggle-content) mono
  .mdc-form-field > label,
  .mat-mdc-slide-toggle-touch-target {
    font-family: var(--font-mono) !important;
    color: var(--text-hi) !important;
  }

  // Touch target ≥ 44px lo proporciona ya MDC vía .mat-mdc-slide-toggle-touch-target;
  // no se altera.
}
```

Notas técnicas:
- `content: '[X]'` / `'[ ]'` se renderiza con la fuente mono ya definida en el `:root`. No hace falta forzar `font-variant-ligatures: none` porque JetBrains Mono no liga corchetes.
- El estado disabled de MDC (`.mdc-switch--disabled`) hereda automáticamente `opacity: 0.4` de la regla genérica de Material; opcional añadir `&.mdc-switch--disabled::before { color: var(--text-lo); }`.
- `aria-checked` lo gestiona MDC; no se toca.

**2. `.mat-mdc-menu-item` → texto mono, hover plano, divider 1px**

El panel ya tiene fondo `var(--bg-elev)` + borde 1px desde commit 3. Falta el contenido:

```scss
.mat-mdc-menu-item {
  font-family: var(--font-mono) !important;
  font-size: 0.8125rem !important;
  letter-spacing: 0.02em;
  color: var(--text-hi) !important;
  border-radius: 0 !important;
  min-height: 40px;
  padding: 0 0.875rem !important;

  .mat-icon,
  .mat-mdc-menu-item-text {
    color: inherit !important;
  }

  @media (hover: hover) {
    &:hover:not(:disabled),
    &.cdk-focused {
      background-color: var(--bg-surface-hi) !important;
      color: var(--text-hi) !important;
    }
  }

  &[disabled] {
    color: var(--text-lo) !important;
    opacity: 1;
  }
}

.mat-mdc-menu-content .mat-divider {
  border-top-color: var(--border) !important;
  margin: 0.25rem 0;
}
```

Touch target: `min-height: 40px` desktop. En `@media (pointer: coarse)` subir a 44px.

**3. `.mat-mdc-icon-button` → cuadrado mono sin ripple redondo**

Inventario: 64 ocurrencias en HTML. Justificación: este override neutraliza visualmente todos los `mat-icon-button` existentes (back buttons de detail, suffixes de inputs, kebabs de cards, list-page-header, filter sheets, auth password-toggle, etc.) sin obligar a tocar 25 HTMLs. Es el commit con mayor retorno visual de toda la Fase 5.

```scss
.mat-mdc-icon-button {
  --mdc-icon-button-state-layer-shape: 0;
  --mat-icon-button-state-layer-shape: 0;

  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  border-radius: 0 !important;
  border: 1px solid transparent !important;
  background-color: transparent !important;
  color: var(--text-mid) !important;
  transition:
    color 120ms linear,
    border-color 120ms linear,
    background-color 120ms linear !important;

  // MDC mete un span ripple circular con clip-path: ocultarlo
  .mat-mdc-button-persistent-ripple,
  .mat-mdc-button-ripple,
  .mat-mdc-focus-indicator {
    border-radius: 0 !important;
    display: none !important;
  }

  .mat-icon {
    color: inherit !important;
  }

  @media (hover: hover) {
    &:not(:disabled):hover {
      color: var(--text-hi) !important;
      border-color: var(--border-active) !important;
      background-color: var(--bg-surface-hi) !important;
    }
  }

  &:focus-visible {
    outline: 1px solid var(--border-active);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// Variante densa cuando aparece como matSuffix dentro de un form-field:
// reducir a 32px para no romper la altura del input.
.mat-mdc-form-field .mat-mdc-icon-button {
  width: 32px !important;
  height: 32px !important;
}
```

Touch target en mobile (mantener accesibilidad pese a `width: 40px` por defecto):
```scss
@media (pointer: coarse) {
  .mat-mdc-icon-button {
    width: 44px !important;
    height: 44px !important;
  }
}
```

Notas:
- El override **no** afecta a `<button mat-mdc-icon-button>` que estén bajo selectores con prioridad propia (`.profile-menu`, `.sale-form__back-btn`); siguen respetándolos. Verificar tras el commit que no hay regresiones en `app.component.scss` (donde el commit 3 ya tocó el rail/topbar/profile-menu).
- Se conserva la semántica ARIA del `mat-icon-button` original — los `aria-label` y `[attr.aria-label]` en todos los HTMLs siguen vigentes.

**4. `.mat-mdc-progress-spinner` → look terminal mientras no se haya migrado a `lib-spinner`**

Como el commit 10 sustituye los 18 usos templátiles por `<app-lib-spinner>`, en teoría este override nunca se renderiza. Aun así se incluye como **red de seguridad** por si algún dialog o componente proyectado mantiene un `mat-spinner` no detectado:

```scss
.mat-mdc-progress-spinner,
mat-spinner,
mat-progress-spinner {
  --mdc-circular-progress-active-indicator-color: var(--primary);

  circle {
    stroke: var(--primary) !important;
    stroke-linecap: square !important; // sin punta redondeada
  }
}
```

**5. Extensiones de `.mat-mdc-form-field` (mensajes y datepicker toggle)**

El commit 3 ya cubre outline + label + input. Faltan:
```scss
.mat-mdc-form-field {
  .mat-mdc-form-field-hint,
  .mat-mdc-form-field-error {
    font-family: var(--font-mono) !important;
    font-size: 0.6875rem !important;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .mat-mdc-form-field-error {
    color: var(--accent-rose) !important;
  }

  .mat-mdc-form-field-required-marker {
    color: var(--accent-rose) !important;
  }

  // matTextSuffix (ej. €, /10, ud.) en mono
  .mat-mdc-form-field-text-suffix,
  .mat-mdc-form-field-text-prefix {
    font-family: var(--font-mono) !important;
    color: var(--text-mid) !important;
  }
}
```

**6. Datepicker (extender el bloque existente)**

El bloque actual `// ────────────────────────── Datepicker ──────────────────────────` sólo ajusta padding y cursor. Añadir:
```scss
.mat-datepicker-content {
  background-color: var(--bg-elev) !important;
  border: 1px solid var(--border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: var(--text-hi) !important;
  font-family: var(--font-mono) !important;

  .mat-calendar-table-header,
  .mat-calendar-body-label,
  .mat-calendar-period-button {
    font-family: var(--font-mono) !important;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-lo) !important;
  }

  .mat-calendar-body-cell-content {
    border-radius: 0 !important;
    border: 1px solid transparent;
  }

  .mat-calendar-body-active .mat-calendar-body-cell-content,
  .mat-calendar-body-selected {
    background-color: var(--primary) !important;
    color: var(--bg-void) !important;
    border-radius: 0 !important;
  }

  .mat-calendar-body-today:not(.mat-calendar-body-selected) {
    border-color: var(--border-active) !important;
  }
}

.mat-datepicker-toggle .mat-icon {
  color: var(--text-mid);
}
```

**Responsive**

Bloque ya existe al final del fichero (`@media (max-width: 600px) .snack-mobile`). Añadir junto a él:
```scss
@media (pointer: coarse) {
  .mat-mdc-icon-button {
    width: 44px !important;
    height: 44px !important;
  }
  .mat-mdc-menu-item {
    min-height: 44px;
  }
}

@media (max-width: 768px) {
  .mat-datepicker-content {
    // En mobile el datepicker abre como bottom sheet; mantener mismo look terminal
    .mat-calendar {
      width: 100%;
    }
  }
}
```

**Criterio de aceptación 9**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- Visual en cualquier vista con `mat-icon-button`: el botón es un cuadrado 40×40 desktop, 44×44 mobile, borde transparente que pasa a `--border-active` en hover. No hay ripple circular.
- `sale-form` muestra `[X] FOR SALE` / `[ ] FOR SALE` en lugar del switch animado.
- Cualquier kebab abierto muestra ítems mono con hover plano `--bg-surface-hi`, sin radius.
- Datepicker abierto: panel rectangular oscuro, días mono, hoy con borde violet, seleccionado con fondo violet plano.
- Hints/errores de los form-field aparecen en mono uppercase 0.6875rem.

#### Commit 10 — `feat(lib): lib-icon-button + lib-spinner y sustitución de mat-spinner residual`

Dos componentes nuevos en `src/app/presentation/components/lib/` + sustitución 1-a-1 de los 18 `mat-spinner` / `mat-progress-spinner` actuales. **No se tocan los `mat-icon-button`** del proyecto en este commit — su sustitución por `app-lib-icon-button` queda como mejora incremental en futuras tareas.

Ficheros nuevos:
- `src/app/presentation/components/lib/lib-icon-button/lib-icon-button.component.ts`
- `src/app/presentation/components/lib/lib-icon-button/lib-icon-button.component.html`
- `src/app/presentation/components/lib/lib-icon-button/lib-icon-button.component.scss`
- `src/app/presentation/components/lib/lib-icon-button/lib-icon-button.component.spec.ts`
- `src/app/presentation/components/lib/lib-spinner/lib-spinner.component.ts`
- `src/app/presentation/components/lib/lib-spinner/lib-spinner.component.html`
- `src/app/presentation/components/lib/lib-spinner/lib-spinner.component.scss`
- `src/app/presentation/components/lib/lib-spinner/lib-spinner.component.spec.ts`
- `src/app/entities/types/lib-component.type.ts` — extender con `LibIconButtonVariant`, `LibIconButtonSize`, `LibSpinnerSize`, `LibSpinnerVariant`.

Ficheros editados:
- `src/app/presentation/components/lib/index.ts` — re-export `LibIconButtonComponent`, `LibSpinnerComponent`.
- HTMLs y TSs con `mat-(progress-)?spinner` (lista exacta en sección "Sustituciones" más abajo).

---

**`LibIconButtonComponent` — spec**

```typescript
// lib-icon-button.component.ts
import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LibIconButtonSize, LibIconButtonVariant, LibButtonType } from '@/types/lib-component.type';

/**
 * Botón de icono reutilizable de la lib Terminal Collector.
 * `<button>` nativo + `<mat-icon>` interno (mat-icon es contenido tipográfico,
 * no UI Material). Sin ripple, sin Material Buttons. Borde 1px en hover.
 */
@Component({
  selector: 'app-lib-icon-button',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './lib-icon-button.component.html',
  styleUrl: './lib-icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibIconButtonComponent {
  /** Nombre del icono Material Icons (font-set por defecto). */
  readonly icon: InputSignal<string> = input.required<string>();

  /** Etiqueta accesible obligatoria — no hay texto visible. */
  readonly ariaLabel: InputSignal<string> = input.required<string>();

  /** Variante visual del botón. */
  readonly variant: InputSignal<LibIconButtonVariant> = input<LibIconButtonVariant>('ghost');

  /** Tamaño base: 'sm' (32) para matSuffix, 'md' (40) topbars, 'lg' (44) standalone mobile. */
  readonly size: InputSignal<LibIconButtonSize> = input<LibIconButtonSize>('md');

  /** Deshabilita el botón cuando es true. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** Tipo del elemento button HTML nativo. */
  readonly type: InputSignal<LibButtonType> = input<LibButtonType>('button');

  /** Emite el MouseEvent al hacer clic (solo si no está deshabilitado). */
  readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
}
```

```html
<!-- lib-icon-button.component.html -->
<button
  class="lib-icon-btn"
  [class.lib-icon-btn--primary]="variant() === 'primary'"
  [class.lib-icon-btn--danger]="variant() === 'danger'"
  [class.lib-icon-btn--ghost]="variant() === 'ghost'"
  [class.lib-icon-btn--sm]="size() === 'sm'"
  [class.lib-icon-btn--md]="size() === 'md'"
  [class.lib-icon-btn--lg]="size() === 'lg'"
  [type]="type()"
  [disabled]="disabled()"
  [attr.aria-label]="ariaLabel()"
  (click)="clicked.emit($event)">
  <mat-icon class="lib-icon-btn__icon">{{ icon() }}</mat-icon>
</button>
```

```scss
// lib-icon-button.component.scss
.lib-icon-btn {
  --color: var(--text-mid);

  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color);
  cursor: pointer;
  border-radius: 0;
  transition:
    color 120ms linear,
    border-color 120ms linear,
    background-color 120ms linear;

  &--sm {
    width: 32px;
    height: 32px;
    .lib-icon-btn__icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
  }

  &--md {
    width: 40px;
    height: 40px;
    .lib-icon-btn__icon {
      font-size: 1.125rem;
      width: 1.125rem;
      height: 1.125rem;
    }
  }

  &--lg {
    width: 44px;
    height: 44px;
    .lib-icon-btn__icon {
      font-size: 1.25rem;
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &--primary { --color: var(--primary); }
  &--danger  { --color: var(--accent-rose); }
  &--ghost   { --color: var(--text-mid); }

  @media (hover: hover) {
    &:not(:disabled):hover {
      color: var(--text-hi);
      border-color: var(--border-active);
      background-color: var(--bg-surface-hi);
    }
  }

  &:focus-visible {
    outline: 1px solid var(--border-active);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

// ────────────────────────── Responsive: ≤ 768 ──────────────────────────
// Touch target mínimo 44 en mobile incluso para variantes sm/md.
@media (max-width: 768px) {
  .lib-icon-btn {
    &--sm,
    &--md {
      width: 44px;
      height: 44px;
    }
  }
}
```

Decisiones justificadas:
- **No usa `MatIconButton`**: el contrato interno es `<button>` nativo. `mat-icon` queda únicamente como render del glyph (lo mismo que ya hace `lib-button`), evitando arrastrar el ripple service y el director de focus de MDC.
- **`ariaLabel` requerido por tipos**: previene la antipatrón "icon-only button sin label" detectada en el inventario de auth (password toggle). El TypeScript impide instanciar el componente sin él.
- **Tres tamaños fijos** alineados con los casos reales: `sm` para `matSuffix` dentro de form-fields (game-form, hardware-form, sale-form), `md` para topbars/back-buttons/kebabs (mayoría de usos), `lg` para FABs móviles o acciones standalone.
- **Touch target ≥ 44 en mobile** sea cual sea el `size` — sólo el tamaño visual del glyph cambia; la hit area se infla.
- **No tiene `loading`**: si el botón necesita feedback de carga, el componente padre intercala `<app-lib-spinner>` en su lugar (mismo footprint visual). Mantenerlo simple.

Dónde se podrá usar después (no en este commit):
- list-page-header (back btn topbar)
- hardware-form-shell (clear matSuffix + back btn)
- hardware-detail-shell (back btn)
- game-detail.component.html (back, edit, sell, kebab)
- game-row.component.html (kebab)
- game-card.component.html (flip + kebab)
- game-list-filters-sheet.component.html (cerrar sheet, clear field)
- auth pages (password toggle)
- protector-edit-panel, users/editions/models management (edit/delete inline)
- order-detail (back btn x2)

Migrarlos queda como follow-up incremental no bloqueante; en este commit el override del commit 9 ya hace que se vean idénticos al `lib-icon-button`.

---

**`LibSpinnerComponent` — spec**

```typescript
// lib-spinner.component.ts
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { LibSpinnerSize, LibSpinnerVariant } from '@/types/lib-component.type';

/**
 * Spinner ASCII reutilizable de la lib Terminal Collector.
 * Sin Material. Animación CSS pura con frames discretos sobre `::before`.
 * En `prefers-reduced-motion` se muestra un frame estático.
 */
@Component({
  selector: 'app-lib-spinner',
  standalone: true,
  templateUrl: './lib-spinner.component.html',
  styleUrl: './lib-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibSpinnerComponent {
  /** Tamaño visual: 'inline' (1ch, dentro de un botón/línea), 'sm' (18-20px), 'md' (40-48px), 'lg' (80px). */
  readonly size: InputSignal<LibSpinnerSize> = input<LibSpinnerSize>('md');

  /** Variante de glyph: 'bars' (|/-\\), 'dots' (... → ....), 'blocks' (▖▘▝▗). Default 'bars'. */
  readonly variant: InputSignal<LibSpinnerVariant> = input<LibSpinnerVariant>('bars');

  /** Texto accesible para lectores de pantalla. Default 'Loading…'. */
  readonly ariaLabel: InputSignal<string> = input<string>('Loading');
}
```

```html
<!-- lib-spinner.component.html -->
<span
  class="lib-spinner"
  [class.lib-spinner--inline]="size() === 'inline'"
  [class.lib-spinner--sm]="size() === 'sm'"
  [class.lib-spinner--md]="size() === 'md'"
  [class.lib-spinner--lg]="size() === 'lg'"
  [class.lib-spinner--bars]="variant() === 'bars'"
  [class.lib-spinner--dots]="variant() === 'dots'"
  [class.lib-spinner--blocks]="variant() === 'blocks'"
  role="status"
  [attr.aria-label]="ariaLabel()">
</span>
```

```scss
// lib-spinner.component.scss
.lib-spinner {
  display: inline-block;
  font-family: var(--font-mono);
  color: var(--primary);
  line-height: 1;
  letter-spacing: 0;

  &::before {
    content: '|';
    display: inline-block;
  }

  // Tamaños
  &--inline { font-size: 1em; }
  &--sm     { font-size: 1.125rem; }
  &--md     { font-size: 2rem; }
  &--lg     { font-size: 3rem; }

  // Variantes — cada una define su propia animación con frames discretos.
  &--bars   { animation: lib-spinner-bars 480ms steps(4, end) infinite; }
  &--dots {
    &::before { content: '.'; }
    animation: lib-spinner-dots 800ms steps(4, end) infinite;
  }
  &--blocks { animation: lib-spinner-blocks 640ms steps(4, end) infinite; }
}

// Frames mediante `content` cambiando por keyframes (truco: usar
// pseudo-elemento independiente para cada variante; aquí se anima el
// `::before` cambiando su `content` con keyframes).
@keyframes lib-spinner-bars {
  0%   { transform: rotate(0deg); }
  25%  { transform: rotate(45deg); }
  50%  { transform: rotate(90deg); }
  75%  { transform: rotate(135deg); }
  100% { transform: rotate(180deg); }
}

// Para que la variante 'bars' rote como `| / - \\` clásico necesitamos
// un nodo cuyo content sea fijo `|` y rotemos en 4 pasos discretos.
// Si se prefiere intercambiar caracteres reales, alternativa:
//
// @keyframes lib-spinner-bars-chars {
//   0%, 24%   { content: '|'; }
//   25%, 49%  { content: '/'; }
//   50%, 74%  { content: '-'; }
//   75%, 100% { content: '\\'; }
// }
// .lib-spinner--bars::before { animation: lib-spinner-bars-chars 480ms steps(1, end) infinite; }
//
// Decisión: usar la versión con `transform: rotate()` sobre `|` porque
// las animaciones de `content` no son soportadas universalmente; el
// resultado visual a 480ms / steps(4) es indistinguible.

@keyframes lib-spinner-dots {
  0%   { content: '.'; }
  25%  { content: '..'; }
  50%  { content: '...'; }
  75%  { content: '....'; }
  100% { content: '....'; }
}

@keyframes lib-spinner-blocks {
  0%   { content: '\\2596'; } // ▖
  25%  { content: '\\2598'; } // ▘
  50%  { content: '\\259D'; } // ▝
  75%  { content: '\\2597'; } // ▗
  100% { content: '\\2596'; }
}

// ────────────────────────── Responsive: ≤ 768 ──────────────────────────
@media (max-width: 768px) {
  .lib-spinner {
    &--md { font-size: 1.75rem; }
    &--lg { font-size: 2.25rem; }
  }
}

// ────────────────────────── prefers-reduced-motion ──────────────────────────
@media (prefers-reduced-motion: reduce) {
  .lib-spinner {
    animation: none !important;
    &::before { content: '...'; } // frame estático visible
  }
}
```

Decisiones de diseño (justificadas con el skill UX):
- **Frame rate**: 480 ms / 4 steps = 120 ms/frame para `bars`, 800/4 = 200 ms/frame para `dots`, 640/4 = 160 ms/frame para `blocks`. El skill recomienda 150-300 ms para micro-interacciones; los valores caen en el rango. `dots` es deliberadamente más lento porque añade caracteres en lugar de rotar (movimiento más perceptible).
- **`steps()` en vez de `ease`**: el spinner es ASCII; necesitamos saltos discretos, no interpolación. `linear` daría aspecto borroso al rotar el `|`.
- **`prefers-reduced-motion`**: regla explícita que detiene la animación y muestra `...` como frame estático (el skill marca esto como severidad alta). El bloque global en `styles.scss` ya lo reduce a 0.01ms, pero conviene que el componente declare su propia variante estática legible.
- **`role="status"` + `aria-label`**: el spinner anuncia su estado a lectores de pantalla; cumple con la regla `loading-states` del skill.
- **No usa Material**: cumple la restricción del usuario y permite que `lib-spinner` sea un nodo realmente plano sin overrides MDC adicionales.

Nota técnica sobre `content` en `@keyframes`: la animación de la propiedad `content` está soportada por la spec CSS Animations Level 2 pero la cobertura en navegadores varía. Si en el QA visual se detecta que `dots`/`blocks` no anima en algún navegador soportado, sustituir esas dos variantes por la técnica de `transform: rotate()` sobre un único carácter (igual que `bars`) y aceptarlo como limitación documentada.

---

**Sustituciones de `mat-spinner` / `mat-progress-spinner` (parte templátil del commit 10)**

Por cada HTML, sustituir `<mat-spinner diameter="X" />` (o `<mat-progress-spinner diameter="X" mode="indeterminate" />`) por `<app-lib-spinner size="..." />` con el mapeo:

| Diameter Material | `size` lib-spinner |
|---|---|
| 18 | `inline` |
| 20 | `sm` |
| 36 | `sm` |
| 40 | `md` |
| 48 | `md` |
| 80 | `lg` |

Lista exacta de ficheros a tocar (TS para quitar el import + añadir `LibSpinnerComponent`; HTML para el reemplazo):

| HTML | Línea(s) | Size lib-spinner |
|---|---|---|
| `src/app/presentation/components/catalog-search-panel/catalog-search-panel.component.html` | 18 (`diameter="40"`) | `md` |
| `src/app/presentation/pages/sale/sale.component.html` | 40, 156 | `md` |
| `src/app/presentation/pages/settings/components/avatar-crop-dialog/avatar-crop-dialog.component.html` | 7 (`40`) | `md` |
| `src/app/presentation/pages/settings/settings.component.html` | 22 (`80`), 62 (`18`), 111 (`36`) | `lg` / `inline` / `sm` |
| `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.html` | 5 (`48`) | `md` |
| `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.html` | 21 (`48`), 268 (`18`) | `md` / `inline` |
| `src/app/presentation/pages/auth/pages/register/register.component.html` | 113 (`20`) | `sm` |
| `src/app/presentation/pages/auth/pages/forgot-password/forgot-password.component.html` | 43 (`20`) | `sm` |
| `src/app/presentation/pages/auth/pages/reset-password/reset-password.component.html` | 88 (`20`) | `sm` |
| `src/app/presentation/pages/auth/pages/login/login.component.html` | 60 (`20`) | `sm` |
| `src/app/presentation/pages/management/pages/users/users-management.component.html` | 139, 202 (`20`) | `sm` |
| `src/app/presentation/pages/orders/pages/order-create/order-create.component.html` | 35 (`18`) | `inline` |
| `src/app/presentation/pages/orders/pages/order-invite/order-invite.component.html` | 39 (`20`) | `sm` |

Por cada `.component.ts` correspondiente:
1. Eliminar import `MatProgressSpinnerModule` / `MatProgressSpinner` / `MatSpinner` del array `imports`.
2. Eliminar el `import { ... } from '@angular/material/progress-spinner';`.
3. Añadir `import { LibSpinnerComponent } from '@/lib';` (vía el barrel) e incluirlo en `imports`.

Tras el commit no debe quedar ningún `mat-spinner` ni `mat-progress-spinner` en HTML; `grep -rn "mat-spinner\\|mat-progress-spinner" src --include="*.html"` debe devolver vacío.

---

**Specs nuevos** (siguiendo el patrón del proyecto, mocks ya disponibles en `src/testing/`):

- `lib-icon-button.component.spec.ts` (3 tests mínimos): renderiza con `icon` y `ariaLabel`; emite `clicked` al pulsar; no emite cuando `disabled`.
- `lib-spinner.component.spec.ts` (2 tests mínimos): renderiza con `size="md"` por defecto; aplica la clase de variante correcta cuando se pasa `variant="dots"`.

Specs afectados por la sustitución de mat-spinner: cualquier spec que hiciera `By.css('mat-spinner')` necesita pasar a `By.css('app-lib-spinner')`. Detectado en `users-management.spec.ts`, `settings.spec.ts`, `game-detail.component.spec.ts` y `game-form.component.spec.ts` (revisar al implementar).

---

**Responsive — resumen del commit 10**

- `lib-icon-button` infla touch target a 44×44 en `@media (max-width: 768px)` aunque la variante sea `sm` o `md`.
- `lib-spinner` reduce ligeramente el `font-size` de `md` y `lg` en mobile para que el spinner hero no quede desproporcionado en 375px.
- `lib-spinner` respeta `prefers-reduced-motion` con frame estático `...`.
- Ambos componentes son `border-radius: 0` por construcción (no aplican).

**Criterio de aceptación 10**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-spinner\\|mat-progress-spinner" src --include="*.html"` devuelve 0 resultados.
- En cada vista que antes mostraba `mat-spinner` ahora se ve el spinner ASCII (`|`, `/`, `-`, `\\` rotando, o `....` creciendo, o glyphs de bloque rotando), color `--primary`, sin círculo.
- En `prefers-reduced-motion: reduce` (chequear con DevTools → Rendering → Emulate CSS media feature) el spinner queda fijo en `...`.
- `lib-icon-button` instanciado en un harness de demo (página de desarrollo opcional) muestra los tres tamaños con borde transparente, hover `--border-active`, focus ring visible al tabular.
- No hay regresión visual en los `mat-icon-button` existentes (siguen invariantes gracias al commit 9).

→ **CHECKPOINT 5 FINAL**: revisión integral terminal pulida.

Criterios objetivos:
- `mat-slide-toggle` renderiza como `[X]` / `[ ]` mono y sigue editando el formControl.
- Cualquier `mat-icon-button` se ve como cuadrado terminal en hover, sin ripple circular.
- Datepicker abierto: panel terminal, sin radius, hoy con borde violet, seleccionado fondo plano.
- Spinners de loading son ASCII en todas las páginas listadas (18 ubicaciones).
- Lighthouse a11y ≥ baseline pre-Fase 5 (sin regresiones).
- `prefers-reduced-motion` deja los spinners en estado estático.

Si OK → PR único `feat: terminal collector redesign` contra `master` con squash merge (acumula commits 0a, 0b, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10).

---

## 5. Checkpoints

Resumen de revisiones visuales requeridas:

| Checkpoint | Tras commit | Qué revisar |
|---|---|---|
| 0 | 0b | Sólo CI (build/test/lint). No revisión visual. |
| 1 | 2 | game-card grid + game-detail en 6 viewports |
| 2 | 4 | games-list (toolbar, filtros, command-bar, FABs) + chrome global (nav-rail, bottom-nav, dialogs, snackbar) |
| 3 | 7 | hardware (lista + detail), wishlist (lista + dialogs), collection-overview |
| 4 | 8 | Auditoría responsive integral en los 6 viewports |
| 5 (final) | 10 | Material residual pulido (slide-toggle, icon-button, datepicker, spinner) + lib extras + PR |

Criterios objetivos de aceptación visual (válidos en cada checkpoint):

- Sin `border-radius` > 2px en ningún componente nuevo.
- Sin `box-shadow` decorativo en ningún componente.
- Sin `transform` en hover.
- Sin emojis.
- Todo el texto de UI en JetBrains Mono salvo títulos de obra (IBM Plex Sans).
- Focus ring visible en todos los interactivos (tab por la app).
- Touch target ≥ 44px en mobile.
- Bottom-nav presente ≤ 768; nav-rail presente ≥ 769.
- Command-bar presente ≥ 1024.
- Botones desktop muestran corchetes `[ ACCIÓN ]` (vía pseudo-elementos).
- FABs cuadrados visibles ≤ 768.

---

## 6. Notas operativas

- **Sin PRs intermedios**. Toda la rama acumula commits y se mergea con squash al final. Mientras tanto, el feedback se hace localmente con build/test/lint verde tras cada commit.
- **Tests existentes**: pueden romperse en commits 1, 2, 5, 6, 7, 10 si los specs hacen aserciones DOM sobre clases CSS específicas (`By.css('mat-spinner')`, ripple del icon-button, switch toggle). El tech agent debe actualizar los specs en el mismo commit donde modifica el componente.
- **i18n**: los labels nuevos como "ADD_COPY", "LIMPIAR", "APLICAR", "FILTROS" se traducen vía clave i18n existente cuando exista; si no, **se añade en `src/assets/i18n/es.json` y `en.json`** en el mismo commit que los usa.
- **Sin migración de BD**: este rediseño es 100% frontend.
- **PWA manifest**: revisar `src/manifest.webmanifest` al final — `theme_color` y `background_color` deben pasar a `#000000`.
- **Service worker / cache**: no se toca; los cambios CSS se sirven con el bust normal de Angular.
- **Accesibilidad**: tras el commit 8, ejecutar Lighthouse a11y para confirmar que el contraste no ha empeorado vs baseline actual (la app ya estaba en dark, el cambio principal es a `--text-lo: #525252` para labels — verificar contraste 4.5:1 contra `--bg-surface: #0A0A0A` → ratio ≈ 7.0:1 OK; `--text-mid #A3A3A3` contra `#0A0A0A` ≈ 11:1 OK).
- **Lighthouse perf**: la eliminación de gradients, sombras, animaciones y dos webfonts (Outfit + Space Grotesk → JetBrains Mono + IBM Plex Sans similares en peso) no debería afectar negativamente; medir igualmente.

---

**Fin del plan.**

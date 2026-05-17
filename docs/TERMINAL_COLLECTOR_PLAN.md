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
   - [FASE 6 — Migración y rediseño de componentes ad-hoc](#fase-6--migración-y-rediseño-de-componentes-ad-hoc)
   - [FASE 7 — Migración de botones, mat-card, mat-menu y mat-slide-toggle](#fase-7--migración-de-botones-mat-card-mat-menu-y-mat-slide-toggle)
   - [FASE 8 — Ampliaciones de `lib/` y cierre de excepciones](#fase-8--ampliaciones-de-lib-y-cierre-de-excepciones)
5. [Checkpoints](#5-checkpoints)
6. [Notas operativas](#6-notas-operativas)
7. [FASE 10 — Reemplazo total de Angular Material y CDK](#7-fase-10--reemplazo-total-de-angular-material-y-cdk)

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

→ **CHECKPOINT 5**: revisión integral terminal pulida (intermedia — falta migrar ad-hoc en Fase 6).

Criterios objetivos:
- `mat-slide-toggle` renderiza como `[X]` / `[ ]` mono y sigue editando el formControl.
- Cualquier `mat-icon-button` se ve como cuadrado terminal en hover, sin ripple circular.
- Datepicker abierto: panel terminal, sin radius, hoy con borde violet, seleccionado fondo plano.
- Spinners de loading son ASCII en todas las páginas listadas (18 ubicaciones).
- Lighthouse a11y ≥ baseline pre-Fase 5 (sin regresiones).
- `prefers-reduced-motion` deja los spinners en estado estático.

---

### FASE 6 — Migración y rediseño de componentes ad-hoc

> **Objetivo**: cerrar el rediseño Terminal Collector eliminando el último foco de estética Material residual: la carpeta `src/app/presentation/components/ad-hoc/`. Tres componentes (`badge-chip`, `skeleton`, `toggle-switch`) se rediseñan o se migran a `lib/` según su naturaleza (primitiva vs ad-hoc funcional). Tras esta fase el directorio `ad-hoc/` queda **vacío y se elimina**.
>
> **Estado al entrar en FASE 6**:
> - `app-badge-chip` ya fue sustituido por `<lib-chip>` en `game-card` (Commit 1) y en `game-row` (Commit 4). Queda confirmar que no hay más usos y borrar el componente y su tipo.
> - `app-skeleton` se ha mantenido invariante: lo siguen consumiendo ≈80 puntos en 18 templates. La estética Material (gradient `--mat-sys-surface-variant`, radius arbitrario por input) sigue presente y rompe la regla 1 (border-radius 0) y la regla 2 (sin tokens Material). Aunque el Commit 5 le forzó `borderRadius="0"` en hardware-list, en el resto de pantallas siguen pasando `"50%"`, `"6px"`, `"10px"`, `"var(--radius-full)"`, `"var(--radius-sm)"`.
> - `app-toggle-switch` no fue tocado por ninguna fase previa (el Commit 9 sí redefine `mat-slide-toggle`, pero `app-toggle-switch` es un componente CVA propio, no Material). Mantiene `border-radius: var(--radius-full)`, thumb circular, animación translateX y `mat-icon` interno — incompatible con Terminal Collector.
>
> **Esta fase migra primitivas a `lib/` (cambia selector + estética) y, en el caso de toggle-switch, rediseña el componente sin moverlo de carpeta porque su CVA + iconos Material no encaja en la API genérica de las primitivas terminales — se decide **eliminarlo y reemplazarlo por un nuevo `lib-checkbox`** que cumpla el patrón `[X] / [ ]` decidido en el Commit 9 para `mat-slide-toggle`. Coherencia visual: el `lib-checkbox` se ve idéntico al `mat-slide-toggle` overrideado y al `mat-mdc-checkbox` overrideado.

#### Inventario y decisiones

| Ad-hoc | Decisión | Razón |
|---|---|---|
| `badge-chip` | **C — Eliminar** | Ya sustituido por `lib-chip` en sus 2 usos (game-card por Commit 1, game-row por Commit 4). Queda código muerto. |
| `skeleton` | **A — Migrar a `lib/` como `lib-skeleton`** | Primitiva pura (geometría + animación), API genérica (`width/height`), reutilizada en 18 pantallas. Encaja perfectamente en la lib. La migración aprovecha para forzar estética terminal (sin radius, shimmer mono `--bg-surface` ↔ `--bg-surface-hi`). |
| `toggle-switch` | **A — Migrar a `lib/` como `lib-checkbox`** + cambio de patrón | El widget de pildora redondeada con thumb no encaja en Terminal Collector. La decisión del Commit 9 (que `mat-slide-toggle` se vea como `[X]/[ ]` mono) marca el patrón canónico de "boolean control" del sistema. `lib-checkbox` lo materializa como primitiva, deprecando `app-toggle-switch`. Mantiene CVA y el contrato `(changed)`. Como el patrón visual cambia (de toggle a checkbox-mono), los iconos `light_mode/dark_mode` (settings) y `favorite_border/favorite` (game-form) pasan a ser **decoración en el label adyacente**, no glyphs dentro del control. |

> **Por qué `lib-checkbox` y no `lib-toggle`**: el patrón `[X] / [ ]` no es un toggle (que requiere thumb y track) sino un checkbox mono. Forzar `lib-toggle` perpetuaría el modelo mental Material (pildora con thumb), que es exactamente lo que la Fase 5 ya elimina vía override de `mat-slide-toggle`. Coherencia gana sobre paralelismo de nombres.

#### Commit 11 — `feat(lib): lib-skeleton mono terminal + migración de todos los usos de app-skeleton`

Ficheros nuevos:
- `src/app/presentation/components/lib/lib-skeleton/lib-skeleton.component.ts`
- `src/app/presentation/components/lib/lib-skeleton/lib-skeleton.component.html`
- `src/app/presentation/components/lib/lib-skeleton/lib-skeleton.component.scss`
- `src/app/presentation/components/lib/lib-skeleton/lib-skeleton.component.spec.ts`
- `src/app/entities/types/lib-component.type.ts` — extender con `LibSkeletonShape`.

Ficheros editados:
- `src/app/presentation/components/lib/index.ts` — añadir `export { LibSkeletonComponent } ...`.
- Los 18 templates con `<app-skeleton>` (lista exhaustiva más abajo).
- Los `.ts` correspondientes — sustituir `imports: [..., SkeletonComponent]` por `imports: [..., LibSkeletonComponent]`.

Ficheros eliminados (al final del commit):
- `src/app/presentation/components/ad-hoc/skeleton/skeleton.component.ts`
- `src/app/presentation/components/ad-hoc/skeleton/skeleton.component.html`
- `src/app/presentation/components/ad-hoc/skeleton/skeleton.component.scss`
- `src/app/presentation/components/ad-hoc/skeleton/skeleton.component.spec.ts`

---

**`LibSkeletonComponent` — spec**

```typescript
// lib-skeleton.component.ts
import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { NgStyle } from '@angular/common';
import { LibSkeletonShape } from '@/types/lib-component.type';

/**
 * Skeleton de carga reutilizable de la lib Terminal Collector.
 * Geometría: rectángulo plano sin border-radius (la prop `shape="square"` o `shape="line"`
 * son meros alias semánticos; ambos producen un rectángulo terminal).
 * Animación: shimmer horizontal entre `--bg-surface` (25%) → `--bg-surface-hi` (50%)
 *   → `--bg-surface` (75%), 1.4s lineal infinita.
 * En `prefers-reduced-motion: reduce` la animación se detiene en un fondo plano
 * `--bg-surface-hi`.
 *
 * NOTA: el componente legacy `app-skeleton` aceptaba `borderRadius` como input;
 * `lib-skeleton` lo elimina por construcción (regla 1 Terminal Collector). La
 * migración mapea: cualquier valor previo de `borderRadius` (50%, 6px, --radius-*)
 * se descarta — todas las skeletons son rectángulos planos.
 */
@Component({
  selector: 'app-lib-skeleton',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './lib-skeleton.component.html',
  styleUrl: './lib-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibSkeletonComponent {
  /** Anchura del bloque (p.ej. '120px', '100%'). Default '100%'. */
  readonly width: InputSignal<string> = input<string>('100%');

  /** Altura del bloque (p.ej. '1rem', '120px'). Default '1rem'. */
  readonly height: InputSignal<string> = input<string>('1rem');

  /** Alias semántico opcional. No altera la geometría (siempre rectangular). */
  readonly shape: InputSignal<LibSkeletonShape> = input<LibSkeletonShape>('line');
}
```

```html
<!-- lib-skeleton.component.html -->
<div
  class="lib-skeleton lib-skeleton--{{ shape() }}"
  role="status"
  aria-busy="true"
  aria-live="polite"
  [ngStyle]="{ width: width(), height: height() }">
</div>
```

```scss
// lib-skeleton.component.scss
.lib-skeleton {
  display: block;
  border-radius: 0;
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--bg-surface-hi) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: lib-skeleton-shimmer 1.4s linear infinite;

  // Alias semánticos — no cambian la geometría
  &--line,
  &--square,
  &--block {
    // sin overrides; reservado para tweaks futuros
  }
}

@keyframes lib-skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ────────────────────────── prefers-reduced-motion ──────────────────────────
@media (prefers-reduced-motion: reduce) {
  .lib-skeleton {
    animation: none;
    background: var(--bg-surface-hi);
  }
}
```

`lib-component.type.ts` — añadir:
```typescript
export type LibSkeletonShape = 'line' | 'square' | 'block';
```

Spec mínimo (vitest, mismo patrón que el resto de specs `lib-*`):
- crea componente con `TestBed`.
- comprueba defaults: `width()='100%'`, `height()='1rem'`, `shape()='line'`.
- setea `width` y `height` con `componentRef.setInput` y verifica que el `ngStyle` aplica.
- verifica `aria-busy="true"` y `role="status"` en el host renderizado.

---

**Migración de los usos**

Sustitución 1-a-1: `<app-skeleton ...>` → `<app-lib-skeleton ...>`. El input `borderRadius` **se elimina** del template (cualquier valor previo se descarta). Si la sustitución es lo único que cambia en un fichero, no se toca su SCSS.

Templates afectados (exhaustivo — coincide con la salida de `grep -rn "<app-skeleton" src --include="*.html"`):

| Fichero | Ocurrencias | Notas de migración |
|---|---|---|
| `src/app/app.component.html` | 3 | Ya pasaban `borderRadius="0"`. Sólo cambia selector. |
| `src/app/presentation/pages/settings/settings.component.html` | 5 | `borderRadius="50%"` (avatar) y `"10px"` (banner) y `"6px"` (thumbnails) → eliminados. Avatar pasa a cuadrado plano (intencional). |
| `src/app/presentation/pages/collection/components/hardware-list-shell/hardware-list-shell.component.html` | 7 | Ya `borderRadius="0"` o sin radius. Sólo selector. |
| `src/app/presentation/pages/collection/components/hardware-form-shell/hardware-form-shell.component.html` | 9 | Ya `borderRadius="0"`. Sólo selector. |
| `src/app/presentation/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component.html` | 6 | Sin radius. Sólo selector. |
| `src/app/presentation/pages/collection/pages/collection-overview/collection-overview.component.html` | 7 | Sin radius. Sólo selector. |
| `src/app/presentation/pages/collection/pages/games/games.component.html` | 4 | Ya `borderRadius="0"`. Sólo selector. |
| `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.html` | 1 | Ya `borderRadius="0"`. Sólo selector. |
| `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.html` | 1 | `borderRadius="6px"` (thumbnails) → eliminado. |
| `src/app/presentation/pages/management/pages/hardware/pages/editions/hardware-editions-management.component.html` | 2 | `borderRadius="var(--radius-sm)"` → eliminado. |
| `src/app/presentation/pages/management/pages/hardware/pages/brands/hardware-brands-management.component.html` | 2 | `borderRadius="var(--radius-sm)"` → eliminado. |
| `src/app/presentation/pages/management/pages/hardware/pages/models/hardware-models-management.component.html` | 3 | `borderRadius="var(--radius-sm)"` → eliminado. |
| `src/app/presentation/pages/management/pages/stores/stores-management.component.html` | 2 | `borderRadius="var(--radius-sm)"` → eliminado. |
| `src/app/presentation/pages/management/pages/audit-log/audit-log-management.component.html` | 4 | `borderRadius="var(--radius-full)"` (avatar) → eliminado. Avatar cuadrado. |
| `src/app/presentation/pages/management/pages/protectors/protectors-management.component.html` | 5 | `borderRadius="var(--radius-lg|sm)"` → eliminados. |
| `src/app/presentation/pages/management/pages/users/users-management.component.html` | 8 | `borderRadius="var(--radius-full)"` (avatares) y `"var(--radius-md|sm)"` → eliminados. Avatares cuadrados. |
| `src/app/presentation/pages/orders/pages/orders-list/orders-list.component.html` | 4 | `borderRadius="var(--radius-full)"` (status pill) → eliminado. |
| `src/app/presentation/pages/orders/pages/order-invite/order-invite.component.html` | 3 | `borderRadius="var(--radius-full)"` (avatar) → eliminado. |
| `src/app/presentation/pages/orders/pages/order-detail/order-detail.component.html` | 5 | `borderRadius="var(--radius-sm)"` → eliminados. |
| `src/app/presentation/pages/wishlist/wishlist.component.html` | 7 | Mezcla `"0"` y sin radius. Sólo selector. |
| `src/app/presentation/pages/wishlist/pages/wishlist-detail/wishlist-detail.component.html` | 6 | Sin radius. Sólo selector. |

Operación recomendada (en el commit):
```bash
# 1. Reemplazo en bloque de selectores
grep -rln "<app-skeleton" src --include="*.html" | xargs sed -i '' 's|<app-skeleton |<app-lib-skeleton |g; s|</app-skeleton>|</app-lib-skeleton>|g'

# 2. Eliminación del input borderRadius (cualquier valor)
grep -rln "borderRadius=" src --include="*.html" | xargs sed -i '' -E 's/[[:space:]]+borderRadius="[^"]*"//g'

# 3. Verificación: 0 resultados esperados
grep -rn "<app-skeleton\\b\\|borderRadius=" src --include="*.html"

# 4. Refactor de imports TS: sustituir SkeletonComponent por LibSkeletonComponent
grep -rln "SkeletonComponent" src --include="*.ts" | grep -v "lib-skeleton" | xargs sed -i '' "s|from '@/components/ad-hoc/skeleton/skeleton.component'|from '@/components/lib/lib-skeleton/lib-skeleton.component'|g; s|\\bSkeletonComponent\\b|LibSkeletonComponent|g"
```

Después de la verificación de los grep, eliminar la carpeta `src/app/presentation/components/ad-hoc/skeleton/` completa.

**Specs afectados** (cualquier spec que use `By.css('app-skeleton')` o importe `SkeletonComponent`):
- Detección: `grep -rn "app-skeleton\\|SkeletonComponent" src --include="*.spec.ts"`.
- Por el grep inicial se cuentan 16 specs candidatos en `hardware-list-shell`, `hardware-form-shell`, `hardware-detail-shell`, `collection-overview`, `games.component`, `game-card`, `game-form`, management pages, orders y wishlist. Cada uno debe migrar `By.css('app-skeleton')` a `By.css('app-lib-skeleton')` y actualizar imports.

**Responsive — resumen del commit 11**

- `lib-skeleton` no tiene breakpoints propios: hereda el `width`/`height` que le pasa el padre, así que el responsive vive en el componente consumidor (sin cambios).
- `prefers-reduced-motion` queda cubierto: shimmer detenido en `--bg-surface-hi`.
- Sin touch target (es un elemento no interactivo: `role="status"`).
- Sin `border-radius` (regla 1 OK).

**Criterio de aceptación 11**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "app-skeleton\\b" src` devuelve **0 resultados** (sólo aparece `app-lib-skeleton`).
- `grep -rn "borderRadius=" src --include="*.html"` devuelve **0 resultados** (el input ya no existe).
- `grep -rn "from '@/components/ad-hoc/skeleton" src` devuelve **0 resultados**.
- La carpeta `src/app/presentation/components/ad-hoc/skeleton/` está eliminada.
- Revisión visual en settings (avatar y banner), users-management (avatares), audit-log (status pills): los antes-redondos ahora son cuadrados y tienen shimmer entre `#0A0A0A` y `#141414`.

---

#### Commit 12 — `feat(lib): lib-checkbox terminal + migración de app-toggle-switch + eliminación de badge-chip`

Dos operaciones en un mismo commit (ambas son la "última limpieza ad-hoc"):

1. **Crear `lib-checkbox`** como primitiva `[X] / [ ]` con CVA, sustituir los 4 usos de `<app-toggle-switch>`, eliminar el componente legacy y su constante `TOGGLE_SWITCH_DEFAULT_ICON*`.
2. **Eliminar `app-badge-chip`** (código muerto tras Commits 1 y 4) — junto con su tipo `BadgeChipVariant`, su spec y su carpeta.

Ficheros nuevos:
- `src/app/presentation/components/lib/lib-checkbox/lib-checkbox.component.ts`
- `src/app/presentation/components/lib/lib-checkbox/lib-checkbox.component.html`
- `src/app/presentation/components/lib/lib-checkbox/lib-checkbox.component.scss`
- `src/app/presentation/components/lib/lib-checkbox/lib-checkbox.component.spec.ts`
- `src/app/entities/types/lib-component.type.ts` — añadir `LibCheckboxSize`.

Ficheros editados:
- `src/app/presentation/components/lib/index.ts` — añadir `export { LibCheckboxComponent } ...`.
- `src/app/presentation/pages/settings/settings.component.{html,ts}` — sustituir toggle-switch del theme switcher.
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.{html,ts}` — sustituir 2 toggle-switch (`onlyFavorites`, `onlyLoaned`).
- `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.{html,ts}` — sustituir 2 toggle-switch (`is_favorite`, presumiblemente uno más con formControlName) y mantener integración formControlName.
- `src/app/presentation/pages/collection/pages/games/components/game-row/game-row.component.ts` — eliminar import legacy `BadgeChipComponent` (ya no se usa tras Commit 4).

Ficheros eliminados:
- `src/app/presentation/components/ad-hoc/toggle-switch/` (carpeta entera con `.ts`, `.html`, `.scss`, `.spec.ts`)
- `src/app/entities/constants/toggle-switch.constant.ts`
- `src/app/presentation/components/ad-hoc/badge-chip/` (carpeta entera)
- `src/app/entities/types/badge-chip-variant.type.ts`
- `src/app/presentation/components/ad-hoc/` (la carpeta padre queda vacía y se elimina; queda registrado en commit message: "removes ad-hoc directory").

---

**`LibCheckboxComponent` — spec**

Decisiones de diseño (consensuadas con el override de `mat-slide-toggle` del Commit 9):
- **No es un toggle con thumb**: render `[X]` ↔ `[ ]` en JetBrains Mono, color `--primary` cuando está checked, `--text-mid` cuando no.
- **Label opcional adyacente** (a la derecha): si se proporciona, se renderiza inline en mono uppercase. Permite usar el componente tanto como control puro (`<lib-checkbox formControlName="x" />`) como con label embebido (`<lib-checkbox formControlName="x" label="FAVORITO" />`).
- **CVA completo**: `writeValue`, `registerOnChange`, `registerOnTouched`, `setDisabledState` — mismo contrato que `app-toggle-switch` para que `formControlName` siga funcionando sin tocar los formularios.
- **Sin iconos Material dentro del control**: los iconos decorativos (`light_mode`, `favorite`) que `app-toggle-switch` mostraba dentro del thumb pasan a vivir en el label adyacente del componente consumidor (no del control). Esto significa que para mantener el icono `light_mode/dark_mode` en settings, el `<mat-icon>` queda en el `<span class="settings__row-label">` (que ya lo tenía) y el control sólo expone `[X]/[ ]`.
- **Tamaño**: `sm` (14px font) y `md` (16px font, default). No hay `lg`.
- **Sin animación** de transición — el cambio entre `[X]` y `[ ]` es discreto (frame único, regla 3 Terminal Collector).

```typescript
// lib-checkbox.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LibCheckboxSize } from '@/types/lib-component.type';

/**
 * Checkbox terminal `[X] / [ ]` reutilizable de la lib Terminal Collector.
 * Compatible con `formControlName` (ControlValueAccessor completo).
 * Reemplaza `app-toggle-switch` (deprecado): mismo contrato `(changed)` + CVA,
 * pero patrón visual `[X]/[ ]` mono en vez de pildora con thumb.
 */
@Component({
  selector: 'app-lib-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './lib-checkbox.component.html',
  styleUrl: './lib-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LibCheckboxComponent), multi: true }
  ]
})
export class LibCheckboxComponent implements ControlValueAccessor {
  /** Estado checked (modo standalone — se ignora si hay formControlName). */
  readonly checked: InputSignal<boolean> = input<boolean>(false);

  /** Etiqueta opcional a la derecha del control, mono uppercase. */
  readonly label: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Tamaño del glyph: 'sm' (0.875rem) o 'md' (1rem, default). */
  readonly size: InputSignal<LibCheckboxSize> = input<LibCheckboxSize>('md');

  /** Deshabilita el control (modo standalone — CVA usa setDisabledState). */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** Emite el nuevo valor booleano tras cada interacción. */
  readonly changed: OutputEmitterRef<boolean> = output<boolean>();

  /** Valor interno, alimentado por [checked] (standalone) o writeValue (CVA). */
  readonly _value: WritableSignal<boolean> = signal(false);

  /** Disabled interno, alimentado por [disabled] (standalone) o setDisabledState (CVA). */
  readonly _isDisabled: WritableSignal<boolean> = signal(false);

  private _cvaMode = false;
  private _onChange: (v: boolean) => void = () => {};
  private _onTouched: () => void = () => {};

  // Sincronización [checked] → _value (equivalente al ngOnChanges del legacy)
  constructor() {
    // implementar con effect() o ngOnChanges según preferencia del tech.
    // Recomendado: effect(() => { if (!this._cvaMode) this._value.set(this.checked()); });
  }

  writeValue(v: boolean): void { this._value.set(!!v); }
  registerOnChange(fn: (v: boolean) => void): void { this._onChange = fn; this._cvaMode = true; }
  registerOnTouched(fn: () => void): void { this._onTouched = fn; }
  setDisabledState(d: boolean): void { this._isDisabled.set(d); }

  /** Toggla el valor, notifica a Forms y emite (changed). */
  onToggle(): void {
    if (this._isDisabled()) return;
    const v = !this._value();
    this._value.set(v);
    this._onChange(v);
    this._onTouched();
    this.changed.emit(v);
  }
}
```

```html
<!-- lib-checkbox.component.html -->
<button
  class="lib-cb"
  [class.lib-cb--on]="_value()"
  [class.lib-cb--disabled]="_isDisabled()"
  [class.lib-cb--sm]="size() === 'sm'"
  [class.lib-cb--md]="size() === 'md'"
  type="button"
  role="switch"
  [attr.aria-checked]="_value()"
  [attr.aria-disabled]="_isDisabled() ? 'true' : null"
  [disabled]="_isDisabled()"
  (click)="onToggle()">
  <span class="lib-cb__box">{{ _value() ? '[X]' : '[ ]' }}</span>
  @if (label()) {
    <span class="lib-cb__label">{{ label() }}</span>
  }
</button>
```

```scss
// lib-checkbox.component.scss
.lib-cb {
  --color: var(--text-mid);

  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--color);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  transition: color 120ms linear;

  &--sm { font-size: 0.875rem; }
  &--md { font-size: 1rem; }

  &--on { --color: var(--primary); }

  &--disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &__box {
    display: inline-block;
    min-width: 2.25ch; /* asegura ancho fijo entre '[ ]' y '[X]' (kerning mono) */
    text-align: center;
    color: var(--color);
  }

  &__label {
    color: var(--text-mid);
    font-size: 0.8125rem;
  }

  &:focus-visible {
    outline: 1px solid var(--border-active);
    outline-offset: 2px;
  }

  @media (hover: hover) {
    &:not(:disabled):hover { --color: var(--border-active); }
  }
}

// ────────────────────────── Responsive: < 768px ──────────────────────────
@media (max-width: 768px) {
  .lib-cb {
    /* touch target ≥ 44px sin alterar la apariencia visual */
    min-height: 44px;
    min-width: 44px;
    justify-content: flex-start;
  }
}
```

`lib-component.type.ts` — añadir:
```typescript
export type LibCheckboxSize = 'sm' | 'md';
```

Spec mínimo (vitest, copiar el patrón del legacy `toggle-switch.component.spec.ts` que ya es muy completo): writeValue, registerOnChange (entra en modo CVA), setDisabledState, onToggle (invierte valor, notifica, emite), forwardRef del NG_VALUE_ACCESSOR resoluble. **Conservar la cobertura de líneas del legacy** — no perder casos al migrar el patrón.

---

**Migración de los 4 usos de `app-toggle-switch`**

1. **`settings.component.html`** (línea 181 — theme switcher, modo standalone con `[checked]` e iconos `light_mode/dark_mode`):

   _Antes_:
   ```html
   <app-toggle-switch
     [checked]="isDark()"
     icon="light_mode"
     iconChecked="dark_mode"
     (changed)="toggleTheme()" />
   ```
   _Después_:
   ```html
   <app-lib-checkbox
     [checked]="isDark()"
     (changed)="toggleTheme()" />
   ```
   El `<mat-icon>` `light_mode/dark_mode` que estaba **dentro** del thumb pasa a vivir en el `<span class="settings__row-label">` adyacente (que ya tenía un `<mat-icon>` decorativo justamente con esos mismos nombres — ver línea 174 del template). No se duplica: el label ya muestra el icono correcto. El control queda como `[X]/[ ]` puro.

2. **`game-list-filters-sheet.component.html`** (líneas 91 y 100 — flags `onlyFavorites`, `onlyLoaned`):

   _Antes_:
   ```html
   <app-toggle-switch [checked]="d.onlyFavorites()" (changed)="d.onlyFavorites.set($event)" />
   ```
   _Después_:
   ```html
   <app-lib-checkbox [checked]="d.onlyFavorites()" (changed)="d.onlyFavorites.set($event)" />
   ```
   Sin cambios de label (el label vive en el contenedor `<div class="filter-row">` o equivalente que ya está pintado al lado del control).

3. **`game-form.component.html`** (líneas 243 y 251 — `is_favorite` y otro flag con `formControlName`):

   _Antes_:
   ```html
   <app-toggle-switch formControlName="is_favorite" icon="favorite_border" iconChecked="favorite" />
   ```
   _Después_:
   ```html
   <app-lib-checkbox formControlName="is_favorite" />
   ```
   Mismo razonamiento: los iconos `favorite_border/favorite` que estaban dentro del thumb pasan a un `<mat-icon>` decorativo en el label de la fila del form, o se eliminan si el label textual ("FAVORITO") es suficiente. Decisión: **eliminarlos**. El estado checked se transmite por el color del `[X]` (violet `--primary`).

4. Actualizar los `.ts` correspondientes: eliminar import `ToggleSwitchComponent`, añadir `LibCheckboxComponent` al array `imports` del `@Component`.

**Eliminación de `app-badge-chip`**:
- Verificar primero con `grep -rn "app-badge-chip\\|BadgeChipComponent\\|BadgeChipVariant" src` que devuelve 0 resultados (los commits 1 y 4 ya migraron `game-card` y `game-row`). Si quedara algún uso, hay regresión en aquellos commits — abortar y revisar.
- Eliminar carpeta `src/app/presentation/components/ad-hoc/badge-chip/`.
- Eliminar `src/app/entities/types/badge-chip-variant.type.ts`.
- Validar que ningún `tsconfig path` u otro fichero referencia el tipo o el componente.

**Eliminación de la carpeta `ad-hoc/`**:
- Tras los `rm` de skeleton (commit 11), toggle-switch (este commit) y badge-chip (este commit), la carpeta `src/app/presentation/components/ad-hoc/` queda vacía → `rmdir` final. El commit message lo recoge: `feat(lib): lib-checkbox terminal + migración de app-toggle-switch + eliminación de ad-hoc/`.

**Specs afectados**:
- `toggle-switch.component.spec.ts` → migrar a `lib-checkbox.component.spec.ts` (mismos casos, distinto componente; mantener la cobertura ≥ baseline).
- `badge-chip.component.spec.ts` → eliminado junto con el componente.
- Cualquier spec que importe `ToggleSwitchComponent` o `BadgeChipComponent` por `By.css(...)` o por import directo (esperado 0 al revisar el grep inicial, pero verificar).

**Responsive — resumen del commit 12**

- `lib-checkbox` infla `min-height` y `min-width` a 44px en `@media (max-width: 768px)` para garantizar touch target sin alterar la apariencia visual (el padding del control y el ancho del label crecen, no el glyph).
- Sin animaciones (frame único entre `[X]` y `[ ]`), por tanto `prefers-reduced-motion` no añade reglas.
- Focus ring 1px `--border-active` con offset 2px, igual que el resto de la lib.
- Sin `border-radius` (regla 1 OK).

**Criterio de aceptación 12**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "app-toggle-switch\\|ToggleSwitchComponent\\|TOGGLE_SWITCH_DEFAULT_ICON" src` devuelve **0 resultados**.
- `grep -rn "app-badge-chip\\|BadgeChipComponent\\|BadgeChipVariant" src` devuelve **0 resultados**.
- `ls src/app/presentation/components/ad-hoc` falla (carpeta no existe).
- Revisión visual en settings (theme switch), game-list filters sheet (flags) y game-form (flags): el control aparece como `[X]` (en estado on, violet) o `[ ]` (en estado off, gris `--text-mid`), con label adyacente en mono uppercase. Sin pildora, sin thumb, sin animación translateX.
- `formControlName="is_favorite"` sigue editando el control reactive (TestBed). El `(changed)` standalone emite tras click (TestBed).
- Lighthouse a11y ≥ baseline post-Fase 5: el `role="switch"` con `aria-checked` mantiene la accesibilidad equivalente al `<input type="checkbox">` material.

→ **CHECKPOINT 6 FINAL**: revisión integral terminal sin residuos ad-hoc.

Criterios objetivos:
- Carpeta `ad-hoc/` eliminada.
- 0 ocurrencias de `<app-skeleton>`, `<app-toggle-switch>`, `<app-badge-chip>` en `src`.
- Todos los skeletons son rectángulos planos con shimmer `--bg-surface` ↔ `--bg-surface-hi` (no Material colors).
- Toggle theme en settings = `[X] DARK_MODE` / `[ ] LIGHT_MODE` (label decorativo a elección, contenido textual del row no cambia).
- Filters sheet con `[X]` / `[ ]` para favoritos y prestados.
- Form de game con `[X]` para "FAVORITO".
- Lighthouse a11y, perf y best-practices ≥ baseline pre-Fase 6.
- `prefers-reduced-motion` deja `lib-skeleton` en fondo plano.

Si OK → continuar con Fase 7 (la rama no se cierra hasta superar el CHECKPOINT 7 FINAL).

---

### FASE 7 — Migración de botones, mat-card, mat-menu y mat-slide-toggle

> **Objetivo**: cerrar definitivamente el rediseño Terminal Collector eliminando el último islote de Angular Material residual que aún se renderiza como UI Material (button shapes, card chrome, menu panel, slide-toggle widget). Tras esta fase la app solo conserva Material como capa de servicios no visuales (`MatDialog`, `MatSnackBar`, `MatTooltip`, `MatMenu` como overlay engine, `MatFormField`/`MatInput`/`MatDatepicker` reskinneados en Fase 5, `mat-icon` como font-set tipográfico). La nueva primitiva `lib-button` cubre los 53 + 15 botones Material textuales, `lib-icon-button` cubre los 64 icon-buttons, `lib-card` cubre las 4 cards de settings (28 elementos), `mat-menu` se mantiene como overlay engine bajo override CSS, y el último `mat-slide-toggle` se elimina migrándolo a `lib-checkbox`.
>
> **Estado al entrar en FASE 7** (verificable con grep tras Fase 6):
> - `<button mat-flat-button>` / `<button mat-stroked-button>`: **53 ocurrencias en 31 ficheros** (auth × 4, dialogs × 4, management × 13, orders × 8, collection forms y sale-form × 5, settings × 1). Todavía pintan como Material Buttons (radius, color="warn"|"primary", typography Roboto).
> - `<button mat-button>`: **15 ocurrencias en 11 ficheros** — variante text-button (sin background) usada predominantemente para "Cancelar" en footers de dialogs y edit-panels. **No estaba en el inventario inicial del usuario pero comparte target de migración** (`lib-button variant="ghost"`).
> - `<button mat-icon-button>`: **64 ocurrencias en 24 ficheros** (10 de ellas con `matTooltip` host-bound, 2 con `matMenuTriggerFor`, una en `<input matSuffix>` de auth con icono de visibility toggle).
> - `<mat-card>` y derivados (`<mat-card-header>`, `<mat-card-title>`, `<mat-card-content>`): **28 ocurrencias concentradas en `settings.component.html`** (4 secciones × 7 elementos por sección entre apertura, header, title, content y cierres).
> - `<mat-menu>` con `mat-menu-item`: **8 ocurrencias en 2 ficheros** — `app.component.html` (profile menu sin `mat-menu-item`, usa overlay como contenedor de un panel custom) y `game-detail.component.html` (context menu kebab clásico con 4 `mat-menu-item`).
> - `<mat-slide-toggle>`: **1 ocurrencia en `sale-form.component.html`** (control `forSale`, último vestigio del widget tras la migración de `app-toggle-switch` en Fase 6 — el override de la Fase 5 lo dejaba como `[X]/[ ]` mono pero el DOM Material seguía ahí).
> - **No detectados en inventario pero presentes**: 1 `<mat-button-toggle-group>` en `order-info-section.component.html` (toggle €/% para descuentos) — se mantiene fuera de Fase 7 (sigue siendo un control segmentado pequeño, no un botón; queda dependiente de override CSS futuro o aceptado como Material residual).
>
> **Sorpresas frente al brief inicial** (a tener en cuenta antes de empezar la implementación):
>
> 1. **`mat-button` (15 usos)**: no estaba contemplado pero usa la misma API que `mat-flat/stroked` y todos están en footers de dialogs/forms como cancelar. Se mete en el Commit 13 sin coste adicional (mismo destino: `lib-button variant="ghost"`).
> 2. **`mat-card` no es solo `<mat-card>`**: el template de settings usa `<mat-card-header>`, `<mat-card-title>` y `<mat-card-content>` como subcomponentes Material. La API actual de `lib-card` es un único `<ng-content>` plano sin slots — no replica esa estructura. Decisión en el Commit 15: o bien se traducen los subcomponentes a divs/headings semánticos dentro del slot único, o se amplía `lib-card` con un input `[title]` opcional. Se elige la primera opción (mantener `lib-card` minimal, los títulos pasan a `<h2 class="settings__card-title">`) — menos API, más control en cada consumidor, alineado con la regla de minimalismo de la lib.
> 3. **`mat-menu` del `app.component` NO usa `mat-menu-item`**: el profile menu (`#profileMenu`) inyecta un `<div class="profile-menu__panel">` con sus propios `<button class="profile-menu__action-btn">`. Sólo consume Material como **motor de overlay** (posicionamiento bottom-end del trigger, animación, outside-click, focus-trap, escape-key). Esto cambia la complejidad real de la decisión de menu (ver §Decisión sobre `mat-menu`).
> 4. **`mat-menu` del game-detail SÍ es clásico**: 4 `<button mat-menu-item>` con icono + texto. El override CSS ya existente en `styles.scss` (línea 432 `.mat-mdc-menu-item` mono uppercase, líneas 303 panel mono sin radius) **ya cubre la estética terminal** de este menú — se puede ver hoy abriendo el kebab del detalle.
> 5. **`mat-stroked-button` con SVG inline (no `<mat-icon>`)**: los 3 botones OAuth de `login.component.html` y `register.component.html` (6 ocurrencias) llevan un `<svg viewBox="0 0 24 24">` embebido con paths de marca (Google, Discord, Twitch). La API actual de `lib-button` solo acepta `icon: string` que se pinta como `<mat-icon>{{ icon() }}</mat-icon>`. Decisión en el Commit 13: mantener el `<svg>` como primer hijo del `lib-button` aprovechando que el contenido proyectado funciona vía `<ng-content>` **si** se amplía el template — o bien dejar esos 6 botones como excepción documentada (botones nativos `<button class="auth-oauth-btn">` con clase propia que mimetiza la estética terminal, sin `app-lib-button`). Se elige la **segunda opción**: las auth-pages no son parte del scope visual del rediseño (ya marcadas como tales) y forzar `lib-button` con projection rompe la API uniforme del componente. Se les aplica clase `auth-oauth-btn` con override SCSS local que iguala visualmente al `lib-btn` (mismo border 1px, mismo padding, mismo mono).
> 6. **`matTooltip` en `mat-icon-button` (10 ocurrencias)**: la directiva `matTooltip` se aplica al host element. Al migrar a `<app-lib-icon-button>`, la directiva queda en el host del componente (el `<app-lib-icon-button>` tag), no en el `<button>` interno. Verificar comportamiento en tres casos representativos (order-detail, wishlist-card, game-card chips) — si el tooltip no se dispara correctamente porque el host es el componente y no el button, el fix es añadir `inputs: ['matTooltip']` y un host binding interno, o más simple: convertir el `<button>` interno en `[attr.aria-label]` y dejar el matTooltip en el host componente con override SCSS para `display: contents` sobre el host. Decisión: **dejar `matTooltip` en el host del `app-lib-icon-button` y aplicar `display: contents` al `:host`** para que el tooltip se dispare sobre el `<button>` real al hacer hover. Sin tocar el código del componente, solo añadir una regla SCSS en `lib-icon-button.component.scss`: `:host { display: contents; }`. Es una micro-optimización trivial y reversible.
> 7. **`mat-icon-button` con `matSuffix`**: el toggle de visibility password en `login`, `register`, `reset-password` (3 ocurrencias) usa `matSuffix` como input para que `mat-form-field` lo coloque en el slot suffix. La migración a `lib-icon-button` requiere que el host del componente acepte la directiva `matSuffix` y se la pase al wrapper, lo cual no es trivial. **Decisión**: estos 3 botones quedan como excepción **dentro del propio Commit 14** — se mantienen como `<button mat-icon-button matSuffix>` porque están funcionalmente ligados al motor de `mat-form-field` (no son un icon-button independiente, son un slot del input). El override CSS de Fase 5 (`mat-icon-button` plano sin ripple) ya los neutraliza visualmente. No son code-smell, son uso correcto de la API de form-field.
>
> **Resumen tras Fase 7**: la app queda sin un solo `<button mat-*-button>` visible salvo los 3 `matSuffix` documentados arriba. Sin `<mat-card>` en ningún template. Con `<mat-menu>` solo como motor de overlay (sin estética Material gracias al override existente). Sin `<mat-slide-toggle>` en ningún template.

#### Decisión sobre `mat-menu` (justificación de la opción elegida)

| Opción | Trabajo | Pros | Contras |
|---|---|---|---|
| **A — CDK Overlay puro + `lib-menu` desde cero** | Crear componente `lib-menu` con `<ng-template>`, `Overlay`, `OverlayRef`, `PositionStrategy`, focus-trap, outside-click, keyboard nav, animaciones, ARIA `role="menu"` + `role="menuitem"`. Migrar `profile-menu` y `context-menu`. Spec con ≈25 casos. | Identidad terminal pura, control total, sin acoplamiento Material. | ≈3 días de trabajo para un componente con 2 únicos consumidores. Riesgo a11y (focus-trap, escape-key, arrow-key navigation son fáciles de hacer mal). Duplica funcionalidad que ya tenemos vía Material. |
| **B — Mantener `mat-menu`, override CSS** | Cero código. El override de `styles.scss` ya está en su sitio (líneas 303 `.mat-mdc-menu-panel`, 432 `.mat-mdc-menu-item`). Verificar visualmente que panel y items pintan terminal en producción y reforzar selectores si hay regresiones. | Cero coste de implementación. A11y y keyboard nav delegados a Material (probados, accesibles). El "motor" del overlay es invisible al usuario. Coherente con la decisión ya tomada para `MatDialog`, `MatSnackBar`, `MatTooltip` (servicios Material que se reskinean sin ser sustituidos). | El bundle sigue importando `MatMenuModule` (≈8 KB gzip). Cualquier nueva regresión visual requiere chasing en CSS de Material. |
| **C — `lib-menu` como wrapper de `MatMenu`** | Crear `lib-menu` que internamente declara un `<mat-menu>` y proyecta hijos. Migrar consumidores a `<app-lib-menu>` + `<app-lib-menu-item>`. | API más limpia para el consumidor. Permite migrar a CDK puro en el futuro sin tocar callers. | Coste real ≈1.5 días sólo para ocultar el detalle de implementación. No aporta ninguna mejora visual ni de a11y inmediata. Aporta un wrapper con poca ganancia mientras solo hay 2 consumidores. |
>
> **Decisión: opción B**. Razones:
>
> 1. **Coherencia con el patrón ya adoptado** para `MatDialog`, `MatSnackBar`, `MatTooltip` y `MatDatepicker` (overrideados en Fase 5, no sustituidos). `MatMenu` es de la misma familia: un overlay con servicios A11y/keyboard ya implementados. Sustituirlo sería gratuitamente inconsistente.
> 2. **Coste/beneficio**: 0 horas vs ≈3 días para 2 únicos consumidores, sin diferencia visual perceptible (el override CSS ya entrega la estética terminal).
> 3. **Riesgo A11y**: re-implementar focus-trap + arrow-key navigation + escape + outside-click es exactamente el tipo de trabajo donde un componente custom suele regresionar accesibilidad. La guía del skill UI/UX Pro Max (resultado 1 de la búsqueda ux) recalca "All functionality accessible via keyboard, Tab order matches visual order" — Material lo garantiza, un wrapper custom no.
> 4. **Reversibilidad**: si en el futuro queremos eliminar `MatMenuModule` del bundle por peso, podemos volver a la opción C sin tocar callers; opción B no nos cierra puertas.
>
> Lo que hace Commit 16 entonces: **verificar y reforzar los overrides existentes**, no crear código nuevo. El "código del Commit 16" es CSS de refinamiento (ajustar animación de apertura para que no haya `transform scale`, garantizar que el panel no usa `box-shadow`, que `cdk-overlay-pane` no impone radius).

#### Commit 13 — `style(buttons): mat-flat/stroked/text-button → lib-button en toda la app`

**Objetivo**: sustituir las 53 ocurrencias de `mat-flat-button`/`mat-stroked-button` y las 15 de `mat-button` por `<app-lib-button>`. Total 68 botones en 31 ficheros (no se cuenta dos veces los ficheros que tienen ambos tipos).

**Ficheros afectados (con conteo combinado mat-flat + mat-stroked + mat-button)**:

| # | Path (absoluto) | Botones | Contexto principal |
|---|---|---|---|
| 1 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/components/confirm-dialog/confirm-dialog.component.html` | 2 (1 flat + 1 button) | `mat-dialog-actions` (No/Sí) |
| 2 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/forgot-password/forgot-password.component.html` | 1 | Submit form auth |
| 3 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/login/login.component.html` | 4 (1 flat submit + 3 stroked OAuth) | Auth — **OAuth con SVG inline, ver excepción** |
| 4 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/register/register.component.html` | 4 (1 flat + 3 stroked OAuth) | Auth — **OAuth con SVG inline, ver excepción** |
| 5 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/reset-password/reset-password.component.html` | 1 | Submit form auth |
| 6 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/sale-form/sale-form.component.html` | 2 flat | Botones "Guardar" y "Marcar vendido" (variant primary y danger) |
| 7 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-cover-position-dialog/game-cover-position-dialog.component.html` | 2 | Dialog actions (cancel/save) |
| 8 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.html` | 3 | Form footer (cancel/submit/delete) |
| 9 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/game-detail/components/game-loan-form/game-loan-form.component.html` | 2 | Form footer |
| 10 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/components/hardware-brand-edit-panel/hardware-brand-edit-panel.component.html` | 3 (1 button + 2 flat) | Edit-panel actions (cancel/save/delete) |
| 11 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/components/hardware-edition-edit-panel/hardware-edition-edit-panel.component.html` | 3 (1 button + 2 flat) | Edit-panel actions |
| 12 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/components/hardware-model-edit-panel/hardware-model-edit-panel.component.html` | 3 (1 button + 2 flat) | Edit-panel actions |
| 13 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/pages/brands/hardware-brands-management.component.html` | 1 | Action button (crear marca) |
| 14 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/pages/editions/hardware-editions-management.component.html` | 1 | Action button (crear edición) |
| 15 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/pages/models/hardware-models-management.component.html` | 1 | Action button (crear modelo) |
| 16 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/protectors/components/protector-edit-panel/protector-edit-panel.component.html` | 4 (1 button + 3 flat) | Edit-panel actions |
| 17 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/protectors/protectors-management.component.html` | 1 | Action button |
| 18 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/stores/components/store-edit-panel/store-edit-panel.component.html` | 3 (1 button + 2 flat) | Edit-panel actions |
| 19 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/stores/stores-management.component.html` | 1 | Action button |
| 20 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/users/components/delete-user-dialog/delete-user-dialog.component.html` | 2 (1 button + 1 flat) | Dialog actions (cancel/delete) |
| 21 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/users/users-management.component.html` | 2 | Action buttons |
| 22 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-create/order-create.component.html` | 3 (2 button + 1 flat) | Back link + form footer |
| 23 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/components/add-edit-line-dialog/add-edit-line-dialog.component.html` | 2 (1 button + 1 flat) | Dialog actions |
| 24 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/components/order-info-section/order-info-section.component.html` | 2 (1 button + 1 flat) | Inline edit cancel/save |
| 25 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/components/order-product-list/order-product-list.component.html` | 1 | Action button |
| 26 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/components/order-stepper/order-stepper.component.html` | 2 | Navigation buttons |
| 27 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/components/ready-dialog/ready-dialog.component.html` | 2 (1 button + 1 flat) | Dialog actions |
| 28 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/order-detail.component.html` | 2 | Action buttons |
| 29 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-invite/order-invite.component.html` | 3 | Action buttons (accept/reject) |
| 30 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/settings/components/avatar-crop-dialog/avatar-crop-dialog.component.html` | 2 (1 button + 1 flat) | Dialog actions |
| 31 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/settings/settings.component.html` | 1 stroked | Logout button (`color="warn"`) |

**Mapeo Material → `lib-button`**:

| Material | `lib-button variant` | Notas |
|---|---|---|
| `mat-flat-button color="primary"` (default) | `primary` | CTA principal del flow |
| `mat-flat-button color="warn"` | `danger` | Destructivo (delete, mark-sold, logout) |
| `mat-flat-button` (sin color) | `primary` | Submit form |
| `mat-stroked-button` (sin color) | `ghost` | Secundario |
| `mat-stroked-button color="warn"` | `danger` (visualmente: `ghost` con `--color: var(--accent-rose)`) | Logout en settings — usar `ghost` con CSS si no se quiere "filled danger" |
| `mat-button` (sin color) | `ghost` | Cancelar |

**Patrón canónico para `mat-dialog-actions`** (aplica a confirm-dialog, delete-user-dialog, avatar-crop-dialog, add-edit-line-dialog, ready-dialog, game-cover-position-dialog):

_Antes_:
```html
<mat-dialog-actions align="end">
  <button mat-button mat-dialog-close>{{ 'common.no' | transloco }}</button>
  <button mat-flat-button color="warn" [mat-dialog-close]="true">{{ 'common.yes' | transloco }}</button>
</mat-dialog-actions>
```
_Después_:
```html
<mat-dialog-actions align="end">
  <app-lib-button
    [label]="'common.no' | transloco"
    variant="ghost"
    mat-dialog-close />
  <app-lib-button
    [label]="'common.yes' | transloco"
    variant="danger"
    [mat-dialog-close]="true" />
</mat-dialog-actions>
```

> Verificar que `mat-dialog-close` (directiva) sigue funcionando aplicada al host del componente — Material la procesa por selector `[mat-dialog-close]`, así que técnicamente sigue funcionando en cualquier elemento. Si no resolviera el click interno (porque el componente intercepta `click` antes), una pequeña refactor: el `lib-button` ya emite `clicked`, así que se puede usar `(clicked)="dialogRef.close(true)"` en su lugar con `MatDialogRef` inyectado en el componente padre. Para confirm-dialog (template-only) prefiero la primera vía; si falla, fallback al patrón con `(clicked)`.

**Patrón para footers de form** (sale-form, game-form, game-loan-form, hardware-loan-form, edit-panels):

_Antes_:
```html
<button mat-flat-button color="primary" (click)="onSave()" [disabled]="saving()">
  @if (saving()) { <mat-icon>hourglass_empty</mat-icon> } @else { <mat-icon>save</mat-icon> }
  {{ 'common.save' | transloco }}
</button>
```
_Después_:
```html
<app-lib-button
  [label]="'common.save' | transloco"
  icon="save"
  variant="primary"
  [loading]="saving()"
  [disabled]="saving()"
  (clicked)="onSave()" />
```

> `lib-button` ya gestiona el spinner internamente cuando `loading()=true` (template usa `progress_activity` con clase `lib-btn__icon--spin`). El icono `hourglass_empty` en los originales se elimina (lo cubre `loading`). El icono "save" se pasa como `icon` input. **No se proyecta contenido** — la API de `lib-button` exige `label` como input. Esto fuerza simplificar templates que metían iconos+texto+condicionales dentro del `<button>`.

**Caso especial — botones con icono leading + label condicional** (ej. order-create back-btn con routerLink):

_Antes_:
```html
<button mat-button routerLink="/orders" class="order-create-page__back-btn">
  <mat-icon>arrow_back</mat-icon>
  {{ 'common.back' | transloco }}
</button>
```
_Después_:
```html
<app-lib-button
  [label]="'common.back' | transloco"
  icon="arrow_back"
  variant="ghost"
  routerLink="/orders"
  class="order-create-page__back-btn" />
```

> `routerLink` aplicado al host del componente funciona si el `<app-lib-button>` es la raíz del `<button>` interno; pero Material's `routerLink` está pensado para `<a>` o `<button>`. Hay que verificar que el motor de Router aplica `routerLink` al elemento que produce el click del componente, no al tag custom (que es un wrapper transparente). **Riesgo conocido**: `routerLink` necesita ser aplicado al `<button>` interno, no al host. Solución (opciones, ordenadas por preferencia):
> 1. Aceptar un input opcional `[routerLink]` en `lib-button` y propagarlo al botón interno + manejar el click internamente vía `Router.navigateByUrl`.
> 2. Mantener `routerLink` en el host con `display: contents` igual que la solución para `matTooltip`.
> 3. Eliminar `routerLink` y usar `(clicked)="router.navigate(['/orders'])"`.
>
> **Decisión**: opción 2 (`display: contents` en el host del `lib-button`) por simetría con la solución de matTooltip en `lib-icon-button` (Commit 14). Si Router se queja del tipo de elemento al que aplica `routerLink`, fallback a opción 3 con el handler inyectado. Verificar al implementar.

**Excepción: botones OAuth con SVG inline (6 ocurrencias en `login` y `register`)**:

Esos botones se mantienen como `<button class="auth-oauth-btn">` con `<svg>` interno. NO se migran a `lib-button`. Justificación:
- Las páginas de auth están explícitamente fuera del scope visual del rediseño (ver §1).
- Forzar `lib-button` con `<ng-content>` para SVG rompe la API uniforme del componente.
- El SCSS `.auth-oauth-btn` ya existe en `login.component.scss` / `register.component.scss` — se mantiene tal cual.

Sin embargo, se aprovecha el commit 13 para **alinear visualmente** `.auth-oauth-btn` con la estética terminal:
- `border: 1px solid var(--border)` (era `var(--mat-sys-outline)`).
- `border-radius: 0` (era `var(--mat-sys-corner-extra-small)`).
- `font-family: var(--font-mono)`.
- `text-transform: uppercase`.
- `min-height: 44px`.
- Hover: `border-color: var(--border-active)`.

Esto deja los 6 OAuth visualmente coherentes con el resto sin pasar por `lib-button`.

**Responsive a verificar**:
- En `< 768px`, los botones de dialog-actions (especialmente `confirm-dialog` y `delete-user-dialog`) deben mantener un touch-target ≥ 44px. `lib-button` ya impone `min-height: 44px` (línea 251 del plan §3.2.1), OK.
- En `< 768px`, los corchetes `[ ]` del `lib-button` se ocultan via media query (línea 254 § 3.2.1, ya implementado). Verificar visualmente que no se solapan en pantallas estrechas.
- Form footers con 2 botones (cancel+save) en `< 480px`: deben apilarse vertical si el ancho no llega. Esto depende del SCSS local del consumidor (ej. `.sale-form__sold-btn { width: 100%; }`), no de `lib-button`. Verificar en sale-form, game-form, edit-panels.

**Specs afectados**:
- Los componentes que se editan no tienen specs DOM intrusivos sobre `mat-flat-button`/`mat-stroked-button` (los specs miran funcionalmente: `By.css('button[type=submit]')`, `getByText`, `dialogRef.close`). Aún así, ejecutar `npm test` tras cada lote de 5 ficheros y arreglar lo que rompa al vuelo. Los que sí pueden romper:
  - `confirm-dialog.component.spec.ts` — si usa `By.css('button[mat-flat-button]')`.
  - `delete-user-dialog.component.spec.ts` — idem.
  - `sale-form.component.spec.ts` — botones `Guardar`/`Marcar vendido`.
  - Auth specs (`login.component.spec.ts`, `register.component.spec.ts`) — submit + OAuth.
- En todos los casos: cambiar selector a `By.css('app-lib-button[variant="primary"]')` o similar. La cobertura no debería bajar.

**Otros ficheros a actualizar (.ts)**:
- Cada `.ts` correspondiente: eliminar de `imports` `MatButtonModule` (si solo se usaba para flat/stroked/button) y añadir `LibButtonComponent` desde `@/components/lib`. **Mantener `MatButtonModule`** en ficheros donde aún haya `mat-icon-button` que se migrará en Commit 14 (sale-form, game-form, etc.) — se quita en Commit 14.

**Criterio de aceptación 13**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-flat-button\\|mat-stroked-button" src --include="*.html"` devuelve **0 resultados** (los 6 OAuth ya no usan stroked).
- `grep -rn "mat-button\\b" src --include="*.html"` devuelve **solo** los 3 `mat-button-toggle*` de `order-info-section.component.html` (que NO se migran en esta fase).
- Revisión visual: todos los botones primarios de la app son `[ ACCIÓN ]` (mono uppercase, corchetes en desktop), todos los secundarios son ghost (mismo tipo, sin fondo). Auth OAuth queda como bloque coherente con borde 1px y mono.
- Dialogs (confirm, delete-user, avatar-crop, add-edit-line, ready) se cierran correctamente al pulsar el botón (verifica que `mat-dialog-close` o el handler `(clicked)` reemplazado funcionan).
- Submit de formularios de auth, sale-form, game-form siguen funcionando (envío + estado loading + disabled).

#### Commit 14 — `style(buttons): mat-icon-button → lib-icon-button en toda la app`

**Objetivo**: sustituir las 64 ocurrencias de `mat-icon-button` por `<app-lib-icon-button>`, excepto las 3 ocurrencias `matSuffix` documentadas como excepción.

**Ficheros afectados (con conteo)**:

| # | Path (absoluto) | Iconos | Contexto |
|---|---|---|---|
| 1 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/login/login.component.html` | 1 | `matSuffix` visibility toggle — **EXCEPCIÓN, no migrar** |
| 2 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/register/register.component.html` | 2 | 2× `matSuffix` visibility — **EXCEPCIÓN, no migrar** |
| 3 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/reset-password/reset-password.component.html` | 2 | 2× `matSuffix` visibility — **EXCEPCIÓN, no migrar** |
| 4 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/hardware-detail-shell/hardware-detail-shell.component.html` | 2 | Header actions |
| 5 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/hardware-form-shell/hardware-form-shell.component.html` | 4 | Header actions + form internal buttons |
| 6 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/hardware-loan-form/hardware-loan-form.component.html` | 1 | Back button |
| 7 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/list-page-header/list-page-header.component.html` | 2 | Back + search/filter |
| 8 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/sale-form/sale-form.component.html` | 1 | Back button |
| 9 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.html` | 2 | Kebab + favorite toggle |
| 10 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.html` | 2 | Close + clear |
| 11 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/components/game-row/game-row.component.html` | 1 | Inline action |
| 12 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.html` | 5 | Multiple inline actions (clear field, remove tag, etc.) |
| 13 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/game-detail/components/game-loan-form/game-loan-form.component.html` | 1 | Back |
| 14 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.html` | 4 | Edit + sell + share + kebab trigger (**con `matMenuTriggerFor`**) |
| 15 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/pages/editions/hardware-editions-management.component.html` | 1 | Row action |
| 16 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/hardware/pages/models/hardware-models-management.component.html` | 1 | Row action |
| 17 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/protectors/components/protector-edit-panel/protector-edit-panel.component.html` | 2 | Form internal buttons (con matTooltip) |
| 18 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/management/pages/users/users-management.component.html` | 2 | Row actions (con matTooltip) |
| 19 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/components/order-product-list/order-product-list.component.html` | 2 | Row actions (con matTooltip) |
| 20 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/orders/pages/order-detail/order-detail.component.html` | 15 | Header actions, stepper, inline edit, etc. (varios con matTooltip) |
| 21 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/wishlist/components/wishlist-card/wishlist-card.component.html` | 3 | Card actions (own/edit/delete) |
| 22 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/wishlist/components/wishlist-item-dialog/wishlist-item-dialog.component.html` | 2 | Dialog header + close |
| 23 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/wishlist/pages/wishlist-detail/wishlist-detail.component.html` | 3 | Header actions (con matTooltip) |
| 24 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/wishlist/wishlist.component.html` | 3 | Header actions |

> **Total a migrar**: 64 - 5 (matSuffix excepciones) = **59 botones en 22 ficheros** (los ficheros 1-3 de auth quedan parcialmente intactos).

**Mapeo Material → `lib-icon-button`**:

| Material | `lib-icon-button` | Notas |
|---|---|---|
| `mat-icon-button` (sin color) | `variant="ghost" size="md"` | Default |
| `mat-icon-button color="warn"` | `variant="danger"` | Delete/destructive |
| `mat-icon-button color="primary"` | `variant="primary"` | Acento positivo |
| `mat-icon-button` en topbar móvil | `size="lg"` | Touch target 44px (mobile) |
| `mat-icon-button` en row (inline) | `size="sm"` | Compacto (32px) |

**Patrón canónico**:

_Antes_:
```html
<button
  mat-icon-button
  (click)="onEdit()"
  [matTooltip]="'common.edit' | transloco"
  [attr.aria-label]="'common.edit' | transloco">
  <mat-icon>edit</mat-icon>
</button>
```
_Después_:
```html
<app-lib-icon-button
  icon="edit"
  [ariaLabel]="'common.edit' | transloco"
  [matTooltip]="'common.edit' | transloco"
  (clicked)="onEdit()" />
```

**Manejo de `matTooltip` (10 ocurrencias)**: la directiva queda en el **host del componente**. Para que dispare correctamente sobre el `<button>` interno, se añade a `lib-icon-button.component.scss`:

```scss
:host {
  display: contents;
}
```

Esto hace que el host no genere un box propio, y el `<button>` interno actúa como elemento visible/hover-target sobre el que `matTooltip` se dispara. Es un cambio de **una línea CSS** en `lib-icon-button.component.scss`, sin tocar el TS.

> **Riesgo**: `display: contents` puede afectar accesibilidad (el host pierde su rol semántico) — pero como el host no tiene rol (sólo es un wrapper), no hay impacto. Verificar con un screen reader en una página representativa (order-detail, que concentra 15 icon-buttons con tooltip). Si hay regresión a11y, alternativa: añadir input `[tooltip]` al `lib-icon-button` que se aplique al `<button>` interno via `[matTooltip]` — más limpio pero requiere importar `MatTooltipModule` desde el componente lib.

**Manejo de `matMenuTriggerFor` (2 ocurrencias)**: ver Commit 16. En este commit, los dos botones que actúan como trigger del menu (`app.component.html` línea 41 y `game-detail.component.html` línea 54) **se migran a `lib-icon-button`** con el mismo patrón `display: contents` — la directiva `matMenuTriggerFor` se aplica al host. **Comprobar**: el trigger funciona porque `matMenuTriggerFor` se activa al click en el host del elemento al que se aplica. Con `display: contents` el click se delega al button interno. Si falla, fallback igual que arriba: añadir input `[menuTrigger]` al componente.

**Touch targets en mobile**:

Verificar visualmente en 375px que los icon-buttons en kebabs (game-card, game-row, game-detail topbar) tienen ≥ 44px de área tocable. `lib-icon-button` ya impone `min-height: 44px; min-width: 44px` en `@media (max-width: 768px)` (ver Commit 10 § 3.2 del plan). OK.

**Excepciones a NO migrar**:
- 3 `mat-icon-button matSuffix` en `login.component.html`, `register.component.html`, `reset-password.component.html` (visibility password toggle). Razón: son slots de `mat-form-field`, dependen de la directiva `matSuffix`. Quedan como `<button mat-icon-button matSuffix>` y el override CSS de Fase 5 los neutraliza visualmente (sin ripple, sin radius).
- Documentar esto en el SCSS local del propio componente con comentario "// HACK: matSuffix obliga a mantener mat-icon-button (Fase 7 — Commit 14)".

**Otros ficheros a actualizar (.ts)**:
- En cada `.ts`: añadir `LibIconButtonComponent` desde `@/components/lib` al array `imports`. Eliminar `MatButtonModule` solo en ficheros donde no quede ningún `mat-*-button` (mantenerlo en los 3 de auth por las excepciones).

**Specs afectados**:
- Tests con `By.css('button[mat-icon-button]')` o `getAllByRole('button')` que filtren por aria-label: cambiar a `By.css('app-lib-icon-button')` o seguir filtrando por aria-label (más estable).
- Específico a verificar: `wishlist-card.component.spec.ts`, `game-card.component.spec.ts`, `order-detail.component.spec.ts`, `game-detail.component.spec.ts`. Si rompen, actualizar selectores DOM, no cambiar la lógica.

**Criterio de aceptación 14**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-icon-button" src --include="*.html" | wc -l` devuelve **5** (los 5 `matSuffix` excepciones, todas en `auth/pages/login`, `auth/pages/register` y `auth/pages/reset-password`).
- `matTooltip` se dispara correctamente en order-detail al hacer hover sobre los icon-buttons del header.
- El kebab del game-detail abre el `mat-menu` correctamente al pulsar el `lib-icon-button` con `[matMenuTriggerFor]="contextMenu"`.
- El profile menu en el nav-rail/topbar abre el panel al pulsar el avatar (que es un div, no se migra — sigue funcionando porque `matMenuTriggerFor` está en el div, no en un button).
- Touch targets ≥ 44px en mobile verificados manualmente en game-card, game-row, game-detail, order-detail.

#### Commit 15 — `style(settings): mat-card → lib-card + reskin terminal`

**Objetivo**: sustituir las 4 `<mat-card>` (con 7 subelementos cada una) de `settings.component.html` por `<app-lib-card>` y descartar la dependencia de subcomponentes Material (`mat-card-header`, `mat-card-title`, `mat-card-content`).

**Fichero único**:
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/settings/settings.component.html` (4 mat-card)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/settings/settings.component.scss` (limpiar `--mat-sys-*` y reescribir tokens a Terminal Collector)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/settings/settings.component.ts` (cambiar imports: fuera `MatCardModule`, dentro `LibCardComponent`)

**Patrón canónico** (aplicado a las 4 secciones: Profile, Appearance, Language, Session):

_Antes_:
```html
<mat-card class="settings__card">
  <mat-card-header>
    <mat-card-title>{{ 'settings.profile.title' | transloco }}</mat-card-title>
  </mat-card-header>
  <mat-card-content>
    <!-- contenido -->
  </mat-card-content>
</mat-card>
```
_Después_:
```html
<app-lib-card class="settings__card">
  <h2 class="settings__card-title">{{ 'settings.profile.title' | transloco }}</h2>
  <!-- contenido directo, sin subwrapper card-content -->
</app-lib-card>
```

> Justificación de no añadir input `[title]` a `lib-card`: una de las 4 secciones (Appearance) tiene **subtítulos** internos (`settings.appearance.bannerPanel`, `settings.appearance.theme`) además del título principal — la estructura no es plana `title + content` sino `title + body con subsecciones`. Un input `[title]` simple no la cubriría sin un slot adicional. Mantener `lib-card` con un único `<ng-content>` y dejar al consumidor componer su jerarquía interna es más flexible y consistente con el resto de la lib (lib-card no impone estructura).

**Nuevos estilos en `settings.component.scss`**:

Añadir clase `.settings__card-title` (uppercase mono, mismo tratamiento que `lib-section-header`):
```scss
.settings__card-title {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-hi);
  margin: 0 0 1rem;
  padding: 0;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}
```

**Limpieza adicional en `settings.component.scss`** (deuda de la Fase 1-6, debe acometerse aquí porque el fichero se toca):

- Sustituir todas las referencias a `--mat-sys-*` por tokens Terminal Collector:
  - `--mat-sys-primary` → `--primary`
  - `--mat-sys-primary-container` → `--bg-surface-hi`
  - `--mat-sys-on-surface-variant` → `--text-mid`
  - `--mat-sys-surface-container-highest` → `--bg-elev`
  - `--mat-sys-outline` → `--border`
- Sustituir `var(--radius-md)` (en `.settings__banner-preview`) → `0` (regla de oro 1: sin border-radius).
- Eliminar `::ng-deep .settings__card { overflow: visible !important; }` (línea 219) — `lib-card` no impone `overflow: hidden` por defecto, así que la regla deja de ser necesaria.
- Eliminar `animation: banner-fade-in 300ms ease` del `.settings__banner-preview--loaded` (regla de oro: sin animaciones decorativas).

**Responsive**:
- Settings ya es un layout simple de cards apiladas verticalmente. Verificar en 375px que `lib-card` mantiene padding apropiado (la `lib-card` ya tiene `padded=true` por defecto con padding `1rem` y gap entre hijos `0.75rem`).
- El grid de banner thumbs (`settings__banner-grid`) debe seguir scrollando horizontal en mobile — no se toca su grid.

**Specs afectados**:
- `settings.component.spec.ts` — si hace aserciones DOM sobre `mat-card-title` (`By.css('mat-card-title')`), cambiar a `By.css('.settings__card-title')` o usar texto.
- Verificar selectores en setUp por si hay `getByCss('mat-card')`.

**Otros ficheros a actualizar (.ts)**:
- `settings.component.ts`: eliminar `MatCardModule` de `imports`, añadir `LibCardComponent`.

**Criterio de aceptación 15**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-card" src --include="*.html"` devuelve **0 resultados**.
- `grep -rn "mat-card-title\\|mat-card-header\\|mat-card-content" src --include="*.html"` devuelve **0 resultados**.
- `grep -n "--mat-sys-" src/app/presentation/pages/settings/settings.component.scss` devuelve **0 resultados**.
- Settings se ve como 4 bloques con borde 1px `--border`, fondo `--bg-surface`, sin radius, sin sombras. Títulos mono uppercase con divider 1px debajo. Las 3 funcionalidades clave (cambiar avatar, cambiar banner, toggle theme, cambiar idioma, logout) siguen funcionando.

#### Commit 16 — `style(chrome): mat-menu reskinneado terminal (verificación + refinamiento de overrides)`

**Objetivo**: mantener `<mat-menu>` como motor de overlay/posicionamiento y consolidar el override CSS existente para que ambos consumidores (profile-menu en app-shell, context-menu en game-detail) pinten 100% Terminal Collector sin Material residual visible. **No se crea ningún componente nuevo.** El commit es CSS y, si es necesario, una pequeña actualización del template para alinear semántica.

**Ficheros editados**:
- `/Users/alcheca/git/personal/monchito-game-library/src/styles.scss` (refinar `.mat-mdc-menu-panel`, `.mat-mdc-menu-item`, `.cdk-overlay-pane`)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/app.component.scss` (revisar `.profile-menu__overlay/identity/actions/action-btn` para alinear con `--border`, `--text-mid`, `--font-mono`)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/app.component.html` (los `mat-icon` dentro de `.profile-menu__action-btn` siguen como tipografía, sin cambio)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.html` (no cambia: los `mat-menu-item` ya pintan terminal vía override)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.scss` (verificar que no hay overrides locales que pisen el override global)

**Selectores reforzados en `styles.scss`** (extender los existentes):

```scss
// Panel — añadir reset de animación scale (transform sin elevación)
.mat-mdc-menu-panel {
  background-color: var(--bg-elev) !important;
  border: 1px solid var(--border) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  // Sin animación de escala — sólo opacidad para no romper regla "no transform en hover"
  animation: none !important;
  transform: none !important;
}

// Item — refinar focus visible para no usar el background-hover de cdk-focused
.mat-mdc-menu-item {
  // ... (ya existe)
  &.cdk-program-focused,
  &:focus-visible {
    outline: 1px solid var(--border-active);
    outline-offset: -1px;
    background-color: var(--bg-surface-hi) !important;
  }
}

// Overlay container — sin radius en el pane host
.cdk-overlay-pane.mat-mdc-menu-panel-animations-enabled {
  border-radius: 0 !important;
}
```

**Refinar `.profile-menu__action-btn`** (`app.component.scss`):

Inspeccionar líneas 313+ y asegurar:
- `border-radius: 0` (regla 1).
- `font-family: var(--font-mono)`.
- `text-transform: uppercase`.
- Hover: `background-color: var(--bg-surface-hi)` (sin transform, sin shadow).
- Focus visible: `outline: 1px solid var(--border-active)`.
- Variant `--logout`: `color: var(--accent-rose)`.

**Verificación**:
- Profile menu (avatar nav-rail en desktop, avatar topbar en mobile): panel terminal, items "SETTINGS" y "LOGOUT" en mono uppercase, hover plano sin sombra.
- Context menu del game-detail (kebab): se abre, muestra 1-4 items según estado (sold, format, etc.), cada item mono uppercase con icono leading, hover plano. Selecciones disparan los handlers correctos (`openSaleView`, `undoSell`, `openLoanView`, `deleteGame`).

**Responsive**:
- En mobile (375px), el panel del context-menu del game-detail no debe salirse del viewport. Material's `PositionStrategy` ya lo gestiona; verificar manualmente.
- El profile-menu en mobile (trigger en topbar avatar) abre el panel por debajo del avatar, full-width si hay espacio. Sin cambio.

**Specs afectados**:
- `app.component.spec.ts` — si hay tests para abrir profile menu, mantener selector `By.css('mat-menu')` (el menu component sigue existiendo en el DOM).
- `game-detail.component.spec.ts` — idem.

**Criterio de aceptación 16**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "<mat-menu" src --include="*.html" | wc -l` devuelve **2** (los dos consumidores legítimos: profile-menu y game-detail kebab). **No se elimina nada** — la decisión es B (mantener mat-menu como overlay engine).
- Verificación visual: ambos menus abren en panel `--bg-elev` con borde 1px `--border`, sin radius, sin shadow, sin animación scale. Items mono uppercase. Hover plano `--bg-surface-hi`. Focus visible con outline `--border-active`.
- No hay regresiones funcionales: ambos menus se cierran al hacer click fuera, con escape, y disparan los handlers correctos al elegir un item.

#### Commit 17 — `style(sale): mat-slide-toggle → lib-checkbox en sale-form`

**Objetivo**: eliminar la última `mat-slide-toggle` del proyecto, presente en `sale-form.component.html` línea 21 para el control `forSale`.

**Fichero único**:
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/sale-form/sale-form.component.html` (1 mat-slide-toggle)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/sale-form/sale-form.component.ts` (cambiar imports: fuera `MatSlideToggleModule`, dentro `LibCheckboxComponent`)
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/sale-form/sale-form.component.scss` (verificar layout: probablemente el `.sale-form__toggle-row` no necesita cambios, sólo confirmar que el espaciado entre label y control sigue bien con el `[X]` mono).

**Patrón canónico**:

_Antes_:
```html
<div class="sale-form__toggle-row">
  <span class="sale-form__toggle-label">{{ i18nPrefix() + '.forSale' | transloco }}</span>
  <mat-slide-toggle formControlName="forSale" color="primary" />
</div>
```
_Después_:
```html
<div class="sale-form__toggle-row">
  <span class="sale-form__toggle-label">{{ i18nPrefix() + '.forSale' | transloco }}</span>
  <app-lib-checkbox formControlName="forSale" />
</div>
```

> `lib-checkbox` ya implementa CVA (Commit 12, Fase 6), por lo que `formControlName="forSale"` funciona out-of-the-box sin cambios en el TS del componente (el form-control sigue siendo `FormControl<boolean>`).

**Specs afectados**:
- `sale-form.component.spec.ts` — si hay aserciones `By.css('mat-slide-toggle')` cambiar a `By.css('app-lib-checkbox')`. Si comprueban el valor del control (`form.controls.forSale.value`), no cambia.

**Otros ficheros a actualizar (.ts)**:
- `sale-form.component.ts`: en `imports`, quitar `MatSlideToggleModule`, añadir `LibCheckboxComponent`.

**Responsive**:
- Sin cambios. El control es más estrecho que el slide-toggle anterior (`[X]` vs pildora 36px), pero el layout `flex` del row se ajusta automáticamente. Verificar visualmente en 375px que el label y el control no se solapan ni dejan demasiado hueco.

**Criterio de aceptación 17**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-slide-toggle\\|MatSlideToggleModule" src` devuelve **0 resultados**.
- Sale-form se abre desde el detalle de un juego, se puede activar/desactivar "En venta" (el `[X]/[ ]` cambia de color), el campo "Precio de venta" aparece/desaparece según el toggle, y al guardar el formulario el flag `for_sale` se persiste correctamente en la BD.

→ **CHECKPOINT 7 FINAL**: rediseño Terminal Collector 100% completo — sin un solo `mat-*-button` visible, sin `mat-card`, sin `mat-slide-toggle`, con `mat-menu` reskinneado como motor de overlay invisible.

Criterios objetivos:
- `grep -rn "mat-flat-button\\|mat-stroked-button\\|mat-card\\b\\|mat-card-title\\|mat-card-header\\|mat-card-content\\|mat-slide-toggle\\|MatSlideToggleModule" src` devuelve **0 resultados**.
- `grep -rn "<button mat-button\\b" src --include="*.html"` devuelve **0 resultados** (los 3 `mat-button-toggle*` de order-info-section quedan documentados como excepción aceptada).
- `grep -rn "mat-icon-button" src --include="*.html" | wc -l` devuelve **5** (las 5 excepciones `matSuffix` de auth, documentadas).
- `grep -rn "<mat-menu" src --include="*.html" | wc -l` devuelve **2** (profile-menu y game-detail kebab, manteniendo `MatMenuModule` como overlay engine).
- Revisión visual de los 6 viewports: ningún componente pinta como Material Buttons/Cards/Toggles. La estética terminal es total.
- Lighthouse a11y ≥ baseline pre-Fase 7.
- `matTooltip` funciona sobre `lib-icon-button` en order-detail (verificado en hover desktop).
- `matMenuTriggerFor` dispara el menu desde `lib-icon-button` en game-detail (verificado en click).

Si OK → PR único `feat: terminal collector redesign` contra `master` con squash merge (acumula commits 0a, 0b, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17).

---

### FASE 8 — Ampliaciones de `lib/` y cierre de excepciones

> **Objetivo**: cerrar las dos únicas excepciones documentadas tras Fase 7 (6 botones OAuth con SVG inline + 10 `mat-icon-button matSuffix` en formularios) **ampliando los componentes `lib/` existentes** en vez de mantener Material como excepción. Tras Fase 8, el grep `mat-icon-button|mat-stroked-button|mat-button\b|mat-flat-button` sobre `src/**.html` (excluyendo specs) devuelve **0 ocurrencias** y `lib-button` + `lib-icon-button` cubren el 100% de la app.
>
> **Estado al entrar en FASE 8** (verificable con grep tras Fase 7):
> - `<button mat-stroked-button class="auth-oauth-btn">` con SVG inline: **6 ocurrencias** (3 en `login.component.html` Google/Discord/Twitch, 3 en `register.component.html` idem). Cada botón inyecta un `<svg viewBox="0 0 24 24">` con paths de marca + label i18n.
> - `<button mat-icon-button matSuffix>`: **10 ocurrencias en 5 ficheros**:
>   - `login.component.html` (1 — visibility toggle password)
>   - `register.component.html` (2 — visibility toggles password + confirmPassword)
>   - `reset-password.component.html` (2 — idem)
>   - `hardware-form-shell.component.html` (3 — clear brand, clear model, clear store en autocompletes)
>   - `game-form.component.html` (2 — clear platform, clear store en autocompletes)
>
> **Análisis técnico de viabilidad**: `matSuffix` es un selector de directiva (`[matSuffix], [matIconSuffix], [matTextSuffix]`) que se aplica al **host del componente**. El template del `mat-form-field` proyecta los suffixes via `<ng-content select="[matSuffix], [matIconSuffix]">`. Por tanto, `<app-lib-icon-button matSuffix>` se proyecta correctamente: la directiva queda en el host, `MAT_SUFFIX` token registra el componente en `_suffixChildren`, y Material lo posiciona en el slot de suffix del template. Como `lib-icon-button` ya tiene `:host { display: contents }` (Fase 7 Commit 14 — añadido para `matTooltip` y `matMenuTriggerFor`), el `<button>` interno queda como hijo directo de `.mat-mdc-form-field-icon-suffix` y Material puede alinearlo verticalmente. La migración **no requiere cambiar la API del componente**, sólo sustituir `<button mat-icon-button matSuffix>` por `<app-lib-icon-button matSuffix>` con `size="sm"` (32px, encaja en la altura del suffix de form-field con density -2).
>
> **Análisis técnico de OAuth**: la API actual de `lib-button` acepta `icon: string` que se pinta como `<mat-icon>{{ icon() }}</mat-icon>`. Los 6 botones OAuth necesitan SVG inline (paths de marca con `fill="#4285F4"`, etc.). La ampliación consiste en añadir un `<ng-content>` interno al template de `lib-button` que renderiza **antes** del label y **en lugar** del `<mat-icon>` si hay contenido proyectado. Esto:
> - No rompe consumidores actuales (el slot vacío queda inerte).
> - Mantiene `label` como required (sigue siendo el texto visible y se usa para el aria-label cuando no hay texto).
> - Convierte la "excepción OAuth" en uso canónico del componente.
>
> **Sorpresa frente al brief inicial (Fase 7)**: la sección "Sorpresas frente al brief" del Commit 13 documenta dos excepciones (OAuth y matSuffix) que se asumían **imposibles de migrar**. El análisis técnico hecho para esta Fase 8 demuestra que ambas son **viables sin tocar la API pública del componente** (lib-icon-button) o con una ampliación mínima retrocompatible (lib-button + ng-content). El argumento de Fase 7 "matSuffix es slot de mat-form-field, no es un icon-button independiente" es **válido conceptualmente pero falso técnicamente**: como `[matSuffix]` es solo una directiva-marcador que se asocia al host, cualquier elemento (incluido un componente Angular) puede llevarla.
>
> **Eliminaciones esperadas tras Fase 8**:
> - `MatButtonModule` desaparece de los imports de `login.component.ts`, `register.component.ts`, `reset-password.component.ts`, `hardware-form-shell.component.ts`, `game-form.component.html`. Tras Fase 8, **ningún componente de la app importa `MatButtonModule`**.
> - El comentario `<!-- HACK: matSuffix obliga a mantener mat-icon-button (Fase 7 — Commit 14) -->` desaparece de los 10 sitios donde está.
> - La clase SCSS `.auth-oauth-btn` (en `auth-panel.component.scss`) puede vaciarse o reducirse — los estilos `lib-btn` ya cubren la estética. Mantener solo lo específico de OAuth (espaciado del SVG si difiere del `<mat-icon>` 1rem por defecto).

#### Commit 18 — `feat(lib): lib-button acepta ng-content para SVG/contenido custom`

**Objetivo**: ampliar `lib-button` con un slot `<ng-content>` que permite proyectar SVG inline o cualquier markup custom antes del label. Reemplaza la excepción de los 6 botones OAuth.

**Ficheros afectados**:

- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/components/lib/lib-button/lib-button.component.html` — añadir `<ng-content>` antes del bloque del icono.
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/components/lib/lib-button/lib-button.component.scss` — añadir reglas para que el contenido proyectado (típicamente `svg`) tenga tamaño y alineación coherentes con el `<mat-icon>` interno (1rem × 1rem, `flex-shrink: 0`).
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/components/lib/lib-button/lib-button.component.spec.ts` — añadir 2 specs:
  1. Renderiza ng-content cuando se proyecta `<svg>`.
  2. Cuando hay ng-content **y** `icon` definido, gana el ng-content (precedencia explícita).

**Spec concreta de la ampliación**:

API pública sin cambios — `label` sigue siendo required, `icon` sigue siendo opcional. Nueva regla: si hay contenido en `<ng-content>`, **no se renderiza el `<mat-icon>` aunque `icon` esté definido**.

_Template antes_:
```html
<button class="lib-btn" ...>
  @if (icon() && !loading()) {
    <mat-icon class="lib-btn__icon">{{ icon() }}</mat-icon>
  }
  @if (loading()) {
    <mat-icon class="lib-btn__icon lib-btn__icon--spin">progress_activity</mat-icon>
  }
  <span class="lib-btn__label">{{ label() }}</span>
</button>
```

_Template después_:
```html
<button class="lib-btn" ...>
  @if (loading()) {
    <mat-icon class="lib-btn__icon lib-btn__icon--spin">progress_activity</mat-icon>
  } @else {
    <span class="lib-btn__slot"><ng-content /></span>
    @if (icon()) {
      <mat-icon class="lib-btn__icon">{{ icon() }}</mat-icon>
    }
  }
  <span class="lib-btn__label">{{ label() }}</span>
</button>
```

> Nota de orden de renderizado: el `<ng-content>` se proyecta **antes** del `<mat-icon>` interno. Para garantizar que solo uno de los dos aparece (precedencia ng-content), el SCSS aplica `.lib-btn__slot:not(:empty) ~ .lib-btn__icon { display: none }`. Alternativa más limpia (pero requiere TS): exponer un signal `_hasProjectedContent` consultando `ContentChild` — descartada por su coste vs la regla CSS de una línea.

_SCSS añadido_:
```scss
.lib-btn__slot {
  display: inline-flex;
  align-items: center;
  line-height: 0;

  &:not(:empty) {
    /* contenido proyectado activo */

    &::v-deep,
    & {
      svg {
        width: 1rem;
        height: 1rem;
        flex-shrink: 0;
      }
    }
  }
}

.lib-btn__slot:not(:empty) ~ .lib-btn__icon {
  display: none;
}
```

> `::ng-deep` está marcado como deprecated en Angular pero sigue funcionando. Alternativa: el SCSS del componente consumidor (auth-panel) ya define `.auth-oauth-btn svg { width: 1.25rem; height: 1.25rem }` — la regla puede vivir ahí en lugar del lib (más limpio: el lib NO impone tamaño al contenido proyectado, deja al consumidor decidir). **Decisión final**: el lib aplica un `display: inline-flex` + `line-height: 0` neutro al wrapper `.lib-btn__slot` y deja el sizing del SVG al consumidor. Esto evita `::ng-deep`.

**Criterio de aceptación 18**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- Specs nuevos pasan (ng-content renderiza, precedencia ng-content sobre `icon`).
- Visual check: un `<app-lib-button>` sin ng-content sigue renderizando idéntico (no hay regresión).
- `docs/LIB_COMPONENTS.md` §4.1.1 ya cubre la documentación del slot — verificar que sigue alineada con la implementación final.

#### Commit 19 — `style(auth): botones OAuth migrados a app-lib-button con SVG proyectado`

**Objetivo**: sustituir los 6 botones `<button mat-stroked-button class="auth-oauth-btn">` por `<app-lib-button>` con el SVG proyectado como ng-content.

**Ficheros afectados**:

- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/login/login.component.html` — 3 botones OAuth (Google, Discord, Twitch).
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/register/register.component.html` — 3 botones OAuth idem.
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/login/login.component.ts` — quitar `MatButtonModule` del array `imports` si ya no quedan `mat-*-button` (tras este commit no quedan). Si después de revisar **todavía** queda algún `mat-*-button` (poco probable: solo el de submit que ya está migrado a lib-button), mantener el módulo.
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/register/register.component.ts` — idem.
- `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/components/auth-panel/auth-panel.component.scss` — vaciar / reducir `.auth-oauth-btn` (el lib-btn ya aporta border, padding, color, mono). Mantener sólo lo que sea específico (p.ej. tamaño del SVG `width: 1.25rem; height: 1.25rem;` y `flex-shrink: 0`).

**Patrón canónico**:

_Antes_:
```html
<button
  mat-stroked-button
  type="button"
  class="auth-oauth-btn"
  [disabled]="loading()"
  (click)="onOAuthSignIn('google')">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="..." fill="#4285F4" />
    ...
  </svg>
  {{ 'auth.continueWithGoogle' | transloco }}
</button>
```

_Después_:
```html
<app-lib-button
  [label]="'auth.continueWithGoogle' | transloco"
  variant="ghost"
  type="button"
  [fullWidth]="true"
  [disabled]="loading()"
  (clicked)="onOAuthSignIn('google')">
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="..." fill="#4285F4" />
    ...
  </svg>
</app-lib-button>
```

**Específico SCSS auth-panel**:
```scss
/* DESPUÉS del commit 19 — sólo el SVG, no el botón */
app-lib-button svg {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
```

> El bloque `.auth-oauth-btn { height: 44px; font-size: ...; border-radius: var(--radius-sm); ... .mdc-button__label { ... } }` **se elimina por completo** — todas esas propiedades las aporta `lib-btn`.

**Specs afectados**:
- `login.component.spec.ts`, `register.component.spec.ts` — si hay tests que buscan `By.css('.auth-oauth-btn')`, cambiar a `By.css('app-lib-button')` filtrando por `[label]` o el handler.

**Criterio de aceptación 19**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-stroked-button" src --include="*.html"` devuelve **0 resultados**.
- Visual check en login/register en desktop y mobile: el SVG aparece a la izquierda del label, el corchete `[ CONTINUE WITH GOOGLE ]` se renderiza correctamente (en desktop), el botón pinta `width: 100%` y altura ≥ 44px en mobile.
- Click en cada uno de los 3 botones dispara el handler con el provider correcto (`google`, `discord`, `twitch`).

#### Commit 20 — `style(forms): mat-icon-button matSuffix → app-lib-icon-button matSuffix (auth + game-form + hardware-form-shell)`

**Objetivo**: cerrar la última excepción Material — los 10 `mat-icon-button matSuffix` distribuidos en auth y forms se migran a `<app-lib-icon-button matSuffix size="sm">`.

**Ficheros afectados** (10 botones en 5 ficheros):

| # | Path (absoluto) | Botones | Contexto |
|---|---|---|---|
| 1 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/login/login.component.html` | 1 | Visibility toggle password |
| 2 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/register/register.component.html` | 2 | Visibility toggles password + confirmPassword |
| 3 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/auth/pages/reset-password/reset-password.component.html` | 2 | Visibility toggles idem |
| 4 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/components/hardware-form-shell/hardware-form-shell.component.html` | 3 | Clear brand / model / store en autocompletes |
| 5 | `/Users/alcheca/git/personal/monchito-game-library/src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.html` | 2 | Clear platform / store en autocompletes |

**Patrón canónico (visibility toggle)**:

_Antes_:
```html
<button
  mat-icon-button
  matSuffix
  type="button"
  (click)="togglePasswordVisibility()"
  [attr.aria-label]="(hidePassword() ? 'auth.showPassword' : 'auth.hidePassword') | transloco">
  <mat-icon>{{ hidePassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
</button>
```

_Después_:
```html
<app-lib-icon-button
  matSuffix
  size="sm"
  [icon]="hidePassword() ? 'visibility' : 'visibility_off'"
  [ariaLabel]="(hidePassword() ? 'auth.showPassword' : 'auth.hidePassword') | transloco"
  (clicked)="togglePasswordVisibility()" />
```

**Patrón canónico (clear de autocomplete)**:

_Antes_:
```html
<button
  matSuffix
  mat-icon-button
  type="button"
  (click)="form().get('brandId')?.setValue(null); brandChange.emit(null)">
  <mat-icon>close</mat-icon>
</button>
```

_Después_:
```html
<app-lib-icon-button
  matSuffix
  size="sm"
  icon="close"
  [ariaLabel]="'common.clear' | transloco"
  (clicked)="form().get('brandId')?.setValue(null); brandChange.emit(null)" />
```

> **Nuevo requisito i18n**: `common.clear` (ES: "Limpiar", EN: "Clear"). Añadir en `src/assets/i18n/es.json` y `en.json` en el mismo commit. Los `clear` actuales en game-form no tienen `aria-label` definido — esto **mejora la accesibilidad** (regresión positiva).

**Imports a actualizar (.ts)**:

- En cada `.component.ts` afectado:
  - Añadir `LibIconButtonComponent` desde `@/components/lib` al array `imports`.
  - Quitar `MatButtonModule` si ya no quedan otros `mat-*-button`. **Verificar antes** con `grep -n "mat-icon-button\\|mat-flat-button\\|mat-stroked-button\\|mat-button\\b" <html>`.

**Verificación de proyección al slot de form-field**:

El template del `<mat-form-field>` proyecta los suffixes via `<ng-content select="[matSuffix], [matIconSuffix]">`. La directiva `[matSuffix]` se asocia al host `<app-lib-icon-button>`, registrando el componente en `_suffixChildren: ContentChildren(MAT_SUFFIX, { descendants: true })` del form-field. Como `:host { display: contents }` ya está aplicado (Commit 14), el `<button>` interno queda como hijo directo de `.mat-mdc-form-field-icon-suffix`.

**Riesgos identificados y mitigaciones**:

1. **Alineación vertical**: Material aplica `align-items: center` al wrapper suffix. El `<app-lib-icon-button size="sm">` mide 32×32. La altura del input outline en density -2 es ~40px. **Mitigación**: si hay misalign, añadir `vertical-align: middle` al `:host` de `lib-icon-button` o `margin: auto 0` al `<button>` interno. Verificar visualmente en los 5 ficheros tras la migración.
2. **Padding lateral del suffix slot**: Material aplica `padding: 0 4px` al wrapper. Si el botón queda pegado al outline, el SCSS local del form-field consumidor puede ajustarse vía `::ng-deep .mat-mdc-form-field-icon-suffix { padding-right: 8px }`. **Solo si se detecta visualmente**, no preventivo.
3. **Tests rotos**: specs que hagan `By.css('button[mat-icon-button][matSuffix]')` rompen. Cambiar a `By.css('app-lib-icon-button[matSuffix]')` o filtrar por aria-label.

**Eliminación del HACK comment**: tras migrar cada botón, borrar el comentario `<!-- HACK: matSuffix obliga a mantener mat-icon-button (Fase 7 — Commit 14) -->`. Total de comments a eliminar: 10 ocurrencias en 5 ficheros (verificar con `grep -rn "HACK: matSuffix" src`).

**Criterio de aceptación 20**:
- `npm run build`, `npm test`, `npm run lint` verdes.
- `grep -rn "mat-icon-button" src --include="*.html" | wc -l` devuelve **0**.
- `grep -rn "HACK: matSuffix" src` devuelve **0**.
- Visual check: en los 5 forms, el botón suffix se renderiza con la estética terminal (32px, sin ripple, sin border-radius). La altura del input no cambia respecto al estado pre-Fase 8. El click toggle/clear funciona idénticamente.
- Auth password visibility: pulsar el botón cambia el icono entre `visibility` y `visibility_off` y el tipo del input entre `password` y `text`.
- Autocomplete clear: pulsar el botón limpia el control del form y emite el evento change correspondiente.
- Touch target en mobile ≥ 44px (el override `@media (max-width: 768px)` de `lib-icon-button` ya lo garantiza).

→ **CHECKPOINT 8 FINAL**: la app no contiene ningún `mat-*-button` ni ningún `mat-icon-button` en sus templates. La librería `lib/` cubre el 100% de los botones de la app. Las excepciones documentadas en Fase 7 quedan cerradas.

Criterios objetivos:
- `grep -rn "mat-flat-button\\|mat-stroked-button\\|mat-icon-button\\|mat-fab\\|mat-mini-fab" src --include="*.html"` devuelve **0 resultados** salvo el `<button mat-fab class="orders-page__fab">` de `orders-list.component.html` (ver §6 — Notas operativas: queda como excepción aceptada o se mete en un futuro commit 21 si se decide migrar).
- `grep -rn "<button mat-button\\b" src --include="*.html"` devuelve **0 resultados**.
- `grep -rn "MatButtonModule" src --include="*.ts"` devuelve **0 resultados** o quedan solo en los specs de Material (no en componentes de la app).
- `docs/frontend/AD_HOC_COMPONENTS.md` está **eliminado** del repo (era documentación de los 3 componentes ad-hoc — `SkeletonComponent`, `ToggleSwitchComponent`, `BadgeChipComponent` — migrados en Fase 6). El nuevo fichero de referencia es `docs/LIB_COMPONENTS.md`.
- `docs/TESTING.md` actualizado para que las 3 entradas que aún referencian `components/ad-hoc/badge-chip`, `components/ad-hoc/skeleton`, `components/ad-hoc/toggle-switch` se eliminen o se reemplacen por las entradas de los specs de `lib-skeleton`, `lib-checkbox`, etc.
- Visual final en los 6 viewports: 0 regresiones respecto a Checkpoint 7. La estética terminal es total y la API es uniforme: cualquier botón de la app es `lib-button` o `lib-icon-button`.

Si OK → PR único `feat: terminal collector redesign` contra `master` con squash merge. Si Fase 8 se hace **después** de cerrar la PR de Fase 7, va en una PR aparte `feat(lib): cerrar excepciones OAuth y matSuffix (Fase 8)`.

#### Limpieza documental obligatoria al cerrar Fase 8

| Acción | Path |
|---|---|
| **Eliminar** | `/Users/alcheca/git/personal/monchito-game-library/docs/frontend/AD_HOC_COMPONENTS.md` |
| **Verificar (no debe haber referencias)** | `grep -rn "ad-hoc\\|AD_HOC_COMPONENTS" /Users/alcheca/git/personal/monchito-game-library/docs/ /Users/alcheca/git/personal/monchito-game-library/CLAUDE.md` |
| **Actualizar** | `/Users/alcheca/git/personal/monchito-game-library/docs/TESTING.md` — quitar líneas 186-188 (refs a `components/ad-hoc/badge-chip`, `components/ad-hoc/skeleton`, `components/ad-hoc/toggle-switch`) y línea 285-286 (descripciones de ToggleSwitchComponent y BadgeChipComponent). Re-ejecutar `/update-testing` para sincronizar con los specs reales de `lib-*`. |
| **Referencia oficial** | A partir de Fase 8, `docs/LIB_COMPONENTS.md` es la única fuente de verdad sobre componentes de la lib. Cualquier `README` o doc que apunte a ad-hoc debe redirigirse aquí. |

> El fichero `docs/frontend/AD_HOC_COMPONENTS.md` describe `SkeletonComponent` (eliminado en Fase 6 Commit 11) y `ToggleSwitchComponent` (eliminado en Fase 6 Commit 12). El `BadgeChipComponent` también fue eliminado en Fase 6. Mantener el doc tras Fase 6 ya era stale — la limpieza se difirió porque el plan no tenía una fase explícita de cierre documental. Fase 8 cierra el ciclo.

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
| 5 | 10 | Material residual pulido (slide-toggle, icon-button, datepicker, spinner) + lib extras |
| 6 | 12 | Migración y eliminación de ad-hoc (skeleton → lib-skeleton, toggle-switch → lib-checkbox, badge-chip eliminado) |
| 7 | 17 | Migración integral de botones (`mat-flat`/`stroked`/`button` → `lib-button`), `mat-icon-button` → `lib-icon-button`, `mat-card` → `lib-card` en settings, `mat-menu` reskinneado como overlay engine, último `mat-slide-toggle` → `lib-checkbox` |
| 8 (final) | 20 | Ampliaciones de `lib-button` (ng-content para SVG) y migración de las 2 excepciones documentadas en Fase 7 (6 OAuth + 10 matSuffix). Eliminación de `AD_HOC_COMPONENTS.md` + actualización de `TESTING.md`. La lib cubre el 100% de la app + PR |

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
- **Tests existentes**: pueden romperse en commits 1, 2, 5, 6, 7, 10, 13, 14, 15, 17 si los specs hacen aserciones DOM sobre clases CSS específicas (`By.css('mat-spinner')`, `By.css('button[mat-flat-button]')`, `By.css('mat-card-title')`, `By.css('mat-slide-toggle')`). El tech agent debe actualizar los specs en el mismo commit donde modifica el componente.
- **Fase 7 — recordatorios concretos**:
  - `display: contents` en `:host` de `lib-icon-button` desbloquea `matTooltip` y `matMenuTriggerFor` aplicados al wrapper. Es la pieza clave para evitar refactorizar la API del componente.
  - Las 5 excepciones `matSuffix` de auth y las 5 de forms (game-form + hardware-form-shell) **se cierran en Fase 8** — el análisis técnico para Fase 8 demuestra que la directiva `[matSuffix]` se aplica al host del componente y la proyección via `<ng-content select="[matSuffix]">` funciona con `<app-lib-icon-button matSuffix>`. Por tanto durante Fase 7 se documenta con comentario inline `<!-- HACK: matSuffix obliga a mantener mat-icon-button (Fase 7 — Commit 14) -->` y se difiere a Fase 8 sin desviar el scope del rediseño visual.
  - Los 6 botones OAuth de auth (`login.html`, `register.html`) **se difieren a Fase 8** — la decisión de ampliar `lib-button` con `<ng-content>` para SVG proyectado se toma fuera del scope de Fase 7 para no expandir la API del componente core en mitad de la migración masiva. Durante Fase 7 quedan como `<button mat-stroked-button class="auth-oauth-btn">` con override CSS local que mimetiza visualmente al `lib-btn`.
  - `mat-menu` se mantiene como overlay engine (decisión documentada en Fase 7). El "código" del Commit 16 es CSS de refinamiento, no nuevo componente.
  - Tras Fase 7, `MatCardModule`, `MatSlideToggleModule` y `MatButtonModule` se quedan únicamente como peer deps invisibles del bundle (no se importan desde ningún componente). `MatMenuModule` sigue importándose en `app.component.ts` y `game-detail.component.ts`. `MatTooltipModule`, `MatDialogModule`, `MatFormFieldModule`, `MatInputModule`, `MatDatepickerModule`, `MatSnackBarModule` siguen activos como servicios reskinneados.
- **Fase 8 — recordatorios concretos**:
  - El análisis técnico del template del form-field confirma que `<ng-content select="[matSuffix], [matIconSuffix]">` proyecta cualquier elemento que lleve la directiva `matSuffix` — incluyendo un componente Angular. La directiva sólo registra el host en `_suffixChildren: ContentChildren(MAT_SUFFIX, { descendants: true })` y no impone restricciones sobre el tipo de elemento. Por tanto `<app-lib-icon-button matSuffix>` es **canónicamente correcto**, no un hack.
  - La ampliación de `lib-button` con `<ng-content>` mantiene compatibilidad hacia atrás: cualquier consumidor que use `<app-lib-button [label]="..." [icon]="...">` sigue funcionando sin cambios. El slot solo activa el nuevo comportamiento cuando hay contenido proyectado.
  - Tras Fase 8: **`MatButtonModule` desaparece de todos los `imports` de la app**. Verificable con `grep -rn "MatButtonModule" src --include="*.ts" | grep -v ".spec.ts"`. Lo único que permanece es la dependencia transitiva via `MatFormFieldModule` (toolbar internals).
  - Quedará pendiente — fuera del scope de este plan — el `<button mat-fab>` de `orders-list.component.html` (FAB de crear orden). Si se decide migrar, se puede añadir un commit 21 que cree `lib-fab` o se mete bajo `lib-icon-button size="lg"` con un wrapper de posicionamiento. **No urgente**: ese FAB es uno solo y ya está reskinneado en Fase 5.
- **i18n**: los labels nuevos como "ADD_COPY", "LIMPIAR", "APLICAR", "FILTROS" se traducen vía clave i18n existente cuando exista; si no, **se añade en `src/assets/i18n/es.json` y `en.json`** en el mismo commit que los usa.
- **Sin migración de BD**: este rediseño es 100% frontend.
- **PWA manifest**: revisar `src/manifest.webmanifest` al final — `theme_color` y `background_color` deben pasar a `#000000`.
- **Service worker / cache**: no se toca; los cambios CSS se sirven con el bust normal de Angular.
- **Accesibilidad**: tras el commit 8, ejecutar Lighthouse a11y para confirmar que el contraste no ha empeorado vs baseline actual (la app ya estaba en dark, el cambio principal es a `--text-lo: #525252` para labels — verificar contraste 4.5:1 contra `--bg-surface: #0A0A0A` → ratio ≈ 7.0:1 OK; `--text-mid #A3A3A3` contra `#0A0A0A` ≈ 11:1 OK).
- **Lighthouse perf**: la eliminación de gradients, sombras, animaciones y dos webfonts (Outfit + Space Grotesk → JetBrains Mono + IBM Plex Sans similares en peso) no debería afectar negativamente; medir igualmente.

---

## 7. FASE 10 — Reemplazo total de Angular Material y CDK

> Objetivo: construir desde cero, dentro de `src/app/presentation/components/lib/`, todos los componentes que faltan para eliminar `@angular/material` y `@angular/cdk` del `package.json`. El usuario asume conscientemente la deuda inicial de a11y a cambio de control total y de borrar la dependencia. La deuda se documenta explícitamente componente a componente y se cierra de forma iterativa en commits posteriores fuera de este plan.

> **Estrategia de rama y PR**: todos los commits de Fase 10 viven en una rama nueva `refactor/lib-remove-material` creada desde `master` tras haber mergeado la rama `feat/terminal-collector-redesign` (Fases 0-8). **Un único PR** al final, contra `master`, con squash merge — alineado con la convención del proyecto y con el feedback de memoria "Refactors de BD multi-fase = un solo PR final". No hay PRs intermedios. Los checkpoints A-E son revisiones del usuario en local sobre la rama, no PRs.

> **Inventario verificado (snapshot de `master`, tras Fase 8)**:
>
> | Módulo Material | Files que lo importan | Notas |
> |---|---|---|
> | `@angular/material/dialog` | 16 (servicio) + 7 (tokens MAT_DIALOG_DATA/Title/Content/Actions/Close/Ref) | 7 componentes que se abren como dialog: `confirm-dialog`, `avatar-crop-dialog`, `game-cover-position-dialog`, `delete-user-dialog`, `add-edit-line-dialog`, `ready-dialog`, `wishlist-item-dialog`. |
> | `@angular/material/icon` | 49 (entre TS y HTML; 147 `<mat-icon>` en templates) | Webfont `Material Icons` ya cargada en `src/index.html`. **No** migrar a `Material Symbols Outlined`: cambio visual no pedido y rompería todos los nombres de iconos (`star_rate` vs `star`). |
> | `@angular/material/snack-bar` | 18 | Sin servicio propio; cada componente inyecta `MatSnackBar` directamente. |
> | `@angular/material/form-field` | 27 | 80 `<mat-form-field>`. 47 `<mat-option>` (compartidos con select y autocomplete). |
> | `@angular/material/input` | 24 | Combina con form-field + datepicker. |
> | `@angular/material/core` | 19 | `MAT_DATE_LOCALE`, `provideNativeDateAdapter`, `MatOption`, `ErrorStateMatcher`. |
> | `@angular/material/tooltip` | 10 (38 usos `matTooltip` en templates) | Directiva sobre cualquier host. |
> | `@angular/material/select` | 10 (19 `<mat-select>`) | — |
> | `@angular/material/datepicker` | 6 (4 `<mat-datepicker>` + 1 directiva `DatepickerFieldClickDirective` propia) | Sólo 4 datepickers reales en toda la app — el usuario lo había estimado en 13. |
> | `@angular/material/bottom-sheet` | 4 | Un único componente que se abre: `GameListFiltersSheetComponent` desde `games.component.ts`. |
> | `@angular/material/autocomplete` | 4 (6 `<mat-autocomplete>`) | Usa `displayWith`, `MatAutocompleteSelectedEvent` y validador custom `invalidOption`. |
> | `@angular/material/divider` | 3 (4 `<mat-divider>`) | — |
> | `@angular/material/tabs` | 2 | 1 `<mat-tab-group>` real (`sale.component.html`) + 1 `<mat-tab-nav-bar>` con `routerLink` (`collection.component.html`). |
> | `@angular/material/menu` | 2 (2 templates: `app.component.html` profile menu, `game-detail.component.html` context menu) | — |
> | `@angular/material/sidenav` | 1 (import sin uso real) | A confirmar — puede caer con un grep en el commit de cleanup. |
> | `@angular/material/button-toggle` | 1 (`order-info-section.component.html` con `mat-button-toggle-group` €/%) | — |
> | `@angular/material/button` | 1 (residuo) | A barrer en commit 21. |
> | `@angular/cdk/layout` | 4 | `BreakpointObserver`. No bloquea — se puede sustituir por `window.matchMedia` o quedarse como única dep CDK si la limpieza del último commit es costosa. |
> | `@angular/animations` | 0 (uso propio) | Solo lo arrastra Material como peer dep. Cae con la desinstalación. |
>
> Diferencias relevantes vs estimación inicial del usuario:
> - **Datepickers: 4, no 13.**
> - **Select: 19, no 66.** (la cifra 66 era contando opciones, no selects.)
> - **Tabs reales: 1.** El segundo es un `mat-tab-nav-bar` que en realidad es un `routerLink` group y se migra como un nav-list, no como un tab system.
> - **Sidenav: 0 usos reales en templates.** El import es residual.

### 7.1 Principios obligatorios

1. **Orden de riesgo ascendente**. Trivial primero (icons, divider), complejo al final (datepicker, form-field). Cada commit es funcional, testeable y reversible.
2. **CDK como puente, no permanente**. Los commits de overlay (snackbar, tooltip, menu, drawer, bottom-sheet, dialog) **se construyen sobre `@angular/cdk/overlay`, `@angular/cdk/a11y` (FocusTrap, A11yModule), `@angular/cdk/portal` y `@angular/cdk/scrolling`**. Es bibliografía bien probada y nos da focus trap, scroll lock, posicionamiento y overlay container sin reinventar. El commit final de cleanup (Commit 39) **no** intenta eliminar CDK si todavía hay usos — se elimina sólo si el inventario de `grep -rn "@angular/cdk"` queda a 0. Si quedan usos de `@angular/cdk/layout` (BreakpointObserver) o `@angular/cdk/overlay`, se mantienen como **dependencia explícita justificada** y se documenta. La promesa de "sin Material" se cumple igualmente; CDK es un kit de primitivas, no un design system.
3. **Sin romper la app en ningún commit**. Tras cada commit: `npm run build && npm run lint && npm test --watch=false` deben pasar. Tests rotos por specs que asertan DOM Material (`By.css('mat-form-field')`) se actualizan en el mismo commit que toca el componente.
4. **A11y declarada explícitamente**. Cada componente nuevo de `lib/` documenta en su JSDoc de clase:
   - Roles ARIA que aplica.
   - Lista de teclas soportadas (Tab, Escape, flechas, Enter, Space, Home, End, type-ahead).
   - Comportamiento de focus (trap, restore, autofocus).
   - **Deuda a11y abierta** — qué falta vs WCAG 2.1 AA y vs APG (ARIA Authoring Practices). El usuario asume esa deuda y se cierra iterativamente.
5. **i18n**: ninguna cadena hardcoded. Cualquier label/aria nuevo (`SnackbarHostComponent`, "Cerrar diálogo", etc.) se traduce vía Transloco con claves nuevas en `src/assets/i18n/es.json` y `en.json` en el mismo commit.
6. **Tipos explícitos y prefijo `_` en privados** (CLAUDE.md). Sin excepciones.
7. **SCSS con `rem`, múltiplos de 0.25, sin `&__elemento`, sin `box-shadow` decorativo, sin `transform` en hover, `border-radius: 0`**. La estética Terminal Collector se mantiene.

### 7.2 Decisiones de diseño previas (tomadas antes de los commits)

1. **Iconos: mantener la webfont `Material Icons` ya cargada en `index.html`**. Componente `lib-icon` que renderiza `<span class="material-icons" aria-hidden="true">{{ name }}</span>`. **No** cambiar a `Material Symbols Outlined` porque (a) implicaría cargar otra webfont, (b) muchos nombres difieren (`star_rate` no existe en outlined, sería `star`), (c) es un cambio visual fuera de scope. La webfont actual seguirá funcionando aunque desinstalemos `@angular/material/icon` — son cosas independientes (la dependencia Material sólo aporta el componente `<mat-icon>`, no la fuente).
2. **Snackbar: servicio singleton + host global**. `LibSnackbarService` (provideIn root) gestiona una `WritableSignal<readonly LibSnackbarMessage[]>`. Un único componente `<app-lib-snackbar-host>` montado en `app.component.html` consume la signal y renderiza la cola. Auto-dismiss configurable (default 4000ms), action button opcional. Posición fija (bottom-center desktop, top-center mobile encima del bottom-nav). Sin Overlay CDK — directamente posición fija en `app-root`.
3. **Tooltip: directiva ligera + DOM nativo absolute**. `[libTooltip]` directiva. En desktop muestra el tooltip via `position: absolute` sobre un wrapper relative del host, con delay 500ms al hover. En touch (sin hover) se omite — los tooltips de Material en mobile se activan con long-press y degradan mal. Como compensación, los `aria-label` ya están bien puestos.
4. **Menu: CDK Overlay + ListKeyManager**. `LibMenuComponent` + `LibMenuTriggerDirective`. El trigger abre el overlay con `OverlayConfig` y `FlexibleConnectedPositionStrategy`. La navegación con flechas usa `cdk/a11y` `ListKeyManager` para no reimplementar type-ahead. La salida con Escape cierra y restaura focus al trigger.
5. **Drawer: panel slide-in lateral + scrim**. Como sólo hay 0 usos reales de `mat-sidenav`, se construye uno mínimo para el filters drawer de games-list (que actualmente usa `MatDrawer` indirectamente). Si tras la verificación final no hay consumidor, **se omite el componente** y se documenta. Decisión: dejarlo en el plan como opcional.
6. **Bottom-sheet: dialog con anchorBottom + drag-to-dismiss**. Un único consumidor (`GameListFiltersSheetComponent`). Se reutiliza la infraestructura de `lib-dialog` con una variante `position="bottom"` que ancla el panel a `bottom: 0`, full-width, con drag handle visible y `swipe-down` para cerrar. Esto evita un overlay separado.
7. **Dialog: CDK Overlay + portal + focus trap**. `LibDialogService` con API mimetizando `MatDialog.open()` para minimizar el diff en los call-sites: `open(component, { data, ariaLabel, position, ... })` → devuelve `LibDialogRef<T, R>` con `.afterClosed()` (`Observable<R | undefined>`) y `.close(result?)`. Los componentes que se abren como dialog (`ConfirmDialogComponent`, etc.) cambian sus imports: `MAT_DIALOG_DATA` → `LIB_DIALOG_DATA`, `MatDialogRef` → `LibDialogRef`, y los wrappers `<h2 mat-dialog-title>` → `<header lib-dialog-title>`. **La directiva equivalente `[libDialogClose]` se mantiene** para botones de cierre.
8. **Form-field stack: construir incrementalmente**.
   - **`lib-form-field`** wrapper + `[libFormFieldControl]` directiva marcadora para el input/select/textarea.
   - **`lib-input`** = `<input>` nativo con clase `.lib-input__control` (proyectado en form-field). Sin componente envoltorio pesado — sólo una directiva `[libInput]` que añade clase y maneja focus/blur events.
   - **`lib-select`** ≠ `<select>` nativo. Es un combobox completo con `role="combobox"` + listbox emergente (CDK Overlay). API: `[options]`, `[value]`, `(valueChange)`, `displayWith`. Implementa `ControlValueAccessor`.
   - **`lib-autocomplete`** = `lib-input` + listbox con filtrado. CDK ListKeyManager para teclas. `displayWith` y validador custom `invalidOption` se replican.
   - **`lib-datepicker`** = `lib-input` + popup calendario. **Implementación interna desde cero** (grid 7×6 con `role="grid"` y `gridcell`, navegación con flechas/PageUp/PageDown/Home/End siguiendo APG date picker dialog), locale `es-ES` vía `Intl.DateTimeFormat`. **No** se usa `flatpickr` ni libs externas para mantener bundle limpio y consistencia visual; si el coste estimado supera 1 día de implementación, **alternativa documentada**: usar `flatpickr` (3.5KB gz) envuelto en un wrapper Angular que aplica el theme terminal por overrides CSS sobre `.flatpickr-calendar`. La decisión final se toma en el Commit 37.
   - **`lib-error`** / **`lib-hint`** / **`lib-label`** = componentes wrapper triviales con clases CSS — esencialmente tags semánticos.
9. **Tabs (sale.component): `lib-tabs` con `role="tablist"`**. Sólo 1 usuario real. Componente compone `<lib-tab-list>` + `<lib-tab>` + `<lib-tab-panel>`. Teclas flechas + Home/End. Sin animations (el `animationDuration="150ms"` original se elimina; cambio visual aceptado).
10. **Tab-nav-bar (collection.component): `lib-router-tabs`** distinto. Es semánticamente una navegación, no un tablist (los enlaces cambian de ruta). Se convierte en `<nav class="lib-router-tabs"><a routerLink>...</a></nav>` con `aria-current="page"` en el activo y estilos terminal. **No usa rol tablist**.
11. **Button-toggle (orders €/%): radio group nativo**. Como sólo hay 1 uso, se hace inline con `<fieldset role="radiogroup">` + dos `<input type="radio">` estilizados con la convención terminal. No vale la pena un `lib-button-toggle` para un único consumidor.
12. **Divider: HR con clase**. `<hr class="lib-divider" />`. No es un componente, es una utilidad CSS.

### 7.3 Estructura de commits

> **Rama**: `refactor/lib-remove-material` desde `master` (post-merge de Fases 0-8). Numeración continua desde Commit 21 para coherencia con el plan existente. Los nombres en backticks son los mensajes de commit propuestos.
>
> **Checkpoints** (revisiones del usuario, no PRs): 5 (A-E) intercalados entre bloques.

#### Bloque 1 — Trivial (sin riesgo overlay)

##### Commit 21 — `feat(lib): lib-icon + sustitución de mat-icon en toda la app`

**Objetivo**: eliminar `@angular/material/icon` como dependencia importada.

**Componente nuevo**: `src/app/presentation/components/lib/lib-icon/lib-icon.component.ts`

```typescript
@Component({
  selector: 'app-lib-icon',
  standalone: true,
  template: `<span class="lib-icon material-icons" aria-hidden="true">{{ name() }}</span>`,
  styleUrl: './lib-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibIconComponent {
  readonly name: InputSignal<string> = input.required<string>();
}
```

**SCSS**: line-height 1, font-size `1em` por defecto, color `currentColor`. Modificadores opcionales `--sm`, `--md`, `--lg` con `font-size` explícito.

**A11y**: `aria-hidden="true"` por defecto (decorativo). Para iconos *informativos* el call-site añade `aria-label` al contenedor padre (el patrón ya está extendido en la app via `lib-icon-button`).

**Migración mecánica**: 147 `<mat-icon>` en templates + 49 ficheros `import { MatIconModule }` o `import { MatIcon }`.

**Patrón sed-friendly**:
```
<mat-icon>name</mat-icon>           → <app-lib-icon name="name" />
<mat-icon class="x">name</mat-icon> → <app-lib-icon class="x" name="name" />
<mat-icon [style.color]="c">name</mat-icon> → <app-lib-icon [style.color]="c" name="name" />
```

**Casos especiales** (búsqueda obligatoria antes del barrido):
- `<mat-icon matSuffix>` y `<mat-icon matPrefix>` dentro de `<mat-form-field>`: se mantienen como `mat-icon` con directiva — se migrarán al desmontar form-field en commits 34+. **No tocar en este commit**.
- `<mat-icon>` dentro de `<button mat-menu-item>` (game-detail context menu, profile menu): el botón mat sigue vivo hasta Commit 27. Sustituir el icono **interior** sin tocar el botón.
- `<mat-icon>` con `[matBadge]` (no debería haber, verificar con `grep matBadge src`): si aparece, mantener Material hasta auditar.

**Internos del lib que ya usan mat-icon**:
- `lib-button` → quitar `import { MatIconModule }` y poner `LibIconComponent` en `imports`. Sustituir `<mat-icon>` por `<app-lib-icon>` en su template.
- `lib-icon-button` → mismo cambio.
- `lib-spinner` no usa mat-icon (ASCII).

**Ficheros a modificar** (49 TS + 49 HTML aprox):
```
grep -rln "MatIcon\|@angular/material/icon" src/ --include="*.ts" | grep -v spec
grep -rln "<mat-icon" src/ --include="*.html"
```

**Specs afectados**: ~10 specs que aserten `By.css('mat-icon')`. Migrar a `By.css('app-lib-icon')`.

**Actualizar**: `src/app/presentation/components/lib/index.ts` añade `export { LibIconComponent } from './lib-icon/lib-icon.component';`

**No se desinstala** `@angular/material/icon` del package.json hasta Commit 39 (cleanup). El commit deja a 0 los imports en `src/`, verificable con:
```
grep -rn "@angular/material/icon\|MatIconModule\b\|<mat-icon" src/ --include="*.ts" --include="*.html" | grep -v "matSuffix\|matPrefix\|matIconSuffix" | wc -l   # → debe dar 0
```

**Deuda a11y declarada**: ninguna; es paridad funcional con `mat-icon` (que también renderiza un span con webfont).

**Criterios de aceptación**:
- `npm run build && npm run lint && npm test --watch=false` verde.
- 0 `<mat-icon>` en el repo salvo los marcados con `matSuffix`/`matPrefix` (form-field interno).
- Visual: ningún icono cambia de tamaño/color/peso.

##### Commit 22 — `feat(lib): lib-divider y migración de button-toggle a radio group nativo`

**Componente nuevo**: ninguno como tal. Se añade utilidad CSS `.lib-divider` en `styles.scss`:
```scss
.lib-divider {
  border: none;
  border-top: 1px solid var(--border);
  margin: 1rem 0;
}
```

**Migración divider**: 4 `<mat-divider>` → `<hr class="lib-divider" />`.

Ficheros:
- `src/app/presentation/pages/settings/settings.component.html:161`
- `src/app/presentation/pages/collection/components/sale-form/sale-form.component.html:46`
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.html:9`
- `src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.html:100`

**Migración button-toggle (orders €/%)**:

Fichero: `src/app/presentation/pages/orders/pages/order-detail/components/order-info-section/order-info-section.component.html:171-177`

Sustituir:
```html
<mat-button-toggle-group [(ngModel)]="discountType">
  <mat-button-toggle value="amount">€</mat-button-toggle>
  <mat-button-toggle value="percentage">%</mat-button-toggle>
</mat-button-toggle-group>
```

Por:
```html
<fieldset class="lib-radio-group" role="radiogroup" [attr.aria-label]="'orders.discount.type' | transloco">
  <label class="lib-radio-group__option" [class.lib-radio-group__option--active]="discountType() === 'amount'">
    <input type="radio" name="discountType" value="amount" [checked]="discountType() === 'amount'" (change)="discountType.set('amount')" />
    <span>€</span>
  </label>
  <label class="lib-radio-group__option" [class.lib-radio-group__option--active]="discountType() === 'percentage'">
    <input type="radio" name="discountType" value="percentage" [checked]="discountType() === 'percentage'" (change)="discountType.set('percentage')" />
    <span>%</span>
  </label>
</fieldset>
```

**SCSS** (en el propio order-info-section.component.scss):
```scss
.lib-radio-group {
  display: inline-flex;
  border: 1px solid var(--border);
  padding: 0;
  margin: 0;

  .lib-radio-group__option {
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    color: var(--text-mid);
    border-right: 1px solid var(--border);

    input { position: absolute; opacity: 0; pointer-events: none; }

    &--active { color: var(--text-hi); background: var(--bg-surface-hi); }
    &:focus-within { outline: 1px solid var(--primary); outline-offset: -1px; }
    &:last-child { border-right: none; }
  }
}
```

**A11y**: nativo de radio (Tab al group, flechas entre opciones — comportamiento nativo del browser); `aria-label` en el fieldset.

**Specs afectados**: `order-info-section.component.spec.ts`. Actualizar selectores `By.css('mat-button-toggle')`.

**Deuda a11y**: ninguna; el comportamiento nativo de radio es el mejor.

**Criterios de aceptación**:
- 0 `<mat-divider>` y 0 `<mat-button-toggle>` en el repo.
- Visual: divisor con grosor 1px color border. Toggle €/% con bordes terminales.

→ **CHECKPOINT A** — usuario revisa: iconos, divisores, toggle €/% en orders detail.

#### Bloque 2 — Servicios de overlay sencillos (riesgo bajo)

##### Commit 23 — `feat(lib): lib-snackbar service + host + migración de 18 ficheros`

**Servicio nuevo**: `src/app/presentation/services/lib-snackbar/lib-snackbar.service.ts`

```typescript
export interface LibSnackbarMessage {
  readonly id: number;
  readonly text: string;
  readonly action?: { label: string; handler: () => void };
  readonly variant: 'info' | 'success' | 'warning' | 'error';
  readonly duration: number;   // 0 = sticky
}

@Injectable({ providedIn: 'root' })
export class LibSnackbarService {
  private _nextId = 0;
  private readonly _messages: WritableSignal<readonly LibSnackbarMessage[]> = signal([]);
  readonly messages: Signal<readonly LibSnackbarMessage[]> = this._messages.asReadonly();

  /**
   * Encola un mensaje. Auto-dismiss tras duration ms (default 4000).
   * @param {Omit<LibSnackbarMessage, 'id'>} msg
   * @returns {number} id del mensaje (para cierre programático)
   */
  open(msg: Omit<LibSnackbarMessage, 'id' | 'duration' | 'variant'> & Partial<Pick<LibSnackbarMessage, 'duration' | 'variant'>>): number { ... }

  /** Cierra programáticamente. */
  dismiss(id: number): void { ... }
}
```

**Componente host**: `src/app/presentation/components/lib/lib-snackbar-host/lib-snackbar-host.component.ts`

- Lee `LibSnackbarService.messages()`.
- Renderiza una `<aside class="lib-snackbar-host" role="region" aria-live="polite" aria-label="Notificaciones">` con una lista de items.
- Cada item: `role="status"` (info/success) o `role="alert"` (warning/error), con `<button>` opcional de acción + `<app-lib-icon-button icon="close">` de cerrar.
- Auto-dismiss via `setTimeout` en el efecto al recibir el mensaje.

**Template**:
```html
<aside class="lib-snackbar-host" role="region" [attr.aria-label]="'common.notifications' | transloco">
  @for (msg of service.messages(); track msg.id) {
    <div
      class="lib-snackbar"
      [class.lib-snackbar--success]="msg.variant === 'success'"
      [class.lib-snackbar--error]="msg.variant === 'error'"
      [class.lib-snackbar--warning]="msg.variant === 'warning'"
      [attr.role]="msg.variant === 'error' || msg.variant === 'warning' ? 'alert' : 'status'">
      <span class="lib-snackbar__text">{{ msg.text }}</span>
      @if (msg.action) {
        <button class="lib-snackbar__action" type="button" (click)="onAction(msg)">
          {{ msg.action.label }}
        </button>
      }
      <app-lib-icon-button icon="close" size="sm" [ariaLabel]="'common.close' | transloco" (clicked)="dismiss(msg.id)" />
    </div>
  }
</aside>
```

**SCSS**:
```scss
.lib-snackbar-host {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 1000;
  pointer-events: none;     // los items recuperan pointer-events
}
.lib-snackbar {
  pointer-events: auto;
  min-width: 280px;
  max-width: 480px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface);
  color: var(--text-hi);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.lib-snackbar--success { border-color: var(--accent-green); }
.lib-snackbar--error   { border-color: var(--accent-rose); }
.lib-snackbar--warning { border-color: var(--accent-amber); }

// ────────────────────────── Responsive: ≤ 768px ──────────────────────────
@media (max-width: 768px) {
  .lib-snackbar-host {
    top: 1rem;
    bottom: auto;
    left: 1rem;
    right: 1rem;
    transform: none;
  }
  .lib-snackbar { min-width: 0; max-width: none; }
}
```

**Montaje**: añadir `<app-lib-snackbar-host />` al final de `src/app/app.component.html` (fuera del router-outlet).

**A11y**:
- `role="region"` + `aria-live="polite"` para que los screen readers anuncien.
- `role="alert"` para errores/warnings (anuncio inmediato).
- Cerrar con tecla Escape: opcional, abierto como deuda (un foco no llega ahí solo).

**Deuda a11y declarada**:
- No hay focus management — los snackbars no roban focus (decisión correcta para mensajes transitorios). El botón de acción es accesible vía Tab si el usuario quiere.
- Type-ahead/dismiss con tecla `Escape` desde cualquier parte de la app: NO implementado (deuda baja prioridad).

**Migración** — 18 ficheros usan `MatSnackBar`:

Patrón typescript en cada uno:
```diff
- import { MatSnackBar } from '@angular/material/snack-bar';
+ import { LibSnackbarService } from '@/services/lib-snackbar/lib-snackbar.service';
- protected readonly _snackBar: MatSnackBar = inject(MatSnackBar);
+ private readonly _snack: LibSnackbarService = inject(LibSnackbarService);
- this._snackBar.open(message, 'Cerrar', { duration: 3000 });
+ this._snack.open({ text: message, duration: 3000 });
```

Ficheros (verificados):
1. `src/app/presentation/abstract/hardware-list-base/hardware-list-base.component.ts`
2. `src/app/presentation/abstract/hardware-form-base/hardware-form-base.component.ts`
3. `src/app/presentation/abstract/hardware-detail-base/hardware-detail-base.component.ts`
4. `src/app/presentation/pages/sale/sale.component.ts`
5. `src/app/presentation/pages/settings/settings.component.ts`
6. `src/app/presentation/pages/collection/components/sale-form/sale-form.component.ts`
7. `src/app/presentation/pages/collection/components/hardware-loan-form/hardware-loan-form.component.ts`
8. Resto: `grep -rln "MatSnackBar" src/ --include="*.ts" | grep -v spec` (18 totales).

**Tests**: cada spec que mockeaba `MatSnackBar` ahora mockea `LibSnackbarService`. Crear `src/testing/lib-snackbar.mock.ts`:
```typescript
export const mockLibSnackbar: { open: jasmine.Spy; dismiss: jasmine.Spy; messages: () => readonly LibSnackbarMessage[] } = {
  open: jasmine.createSpy('open').and.returnValue(0),
  dismiss: jasmine.createSpy('dismiss'),
  messages: () => []
};
```

Y añadir entrada a la tabla del CLAUDE.md (sección "Tests — mocks compartidos").

**Criterios de aceptación**:
- 0 imports de `@angular/material/snack-bar` en `src/`.
- Snackbar visible en operaciones (guardar juego, error de red).
- Auto-dismiss tras 4s default.

##### Commit 24 — `feat(lib): lib-tooltip directiva + migración de 38 usos`

**Directiva nueva**: `src/app/presentation/shared/lib-tooltip/lib-tooltip.directive.ts`

```typescript
@Directive({
  selector: '[libTooltip]',
  standalone: true
})
export class LibTooltipDirective implements OnDestroy {
  readonly libTooltip: InputSignal<string> = input.required<string>();
  readonly libTooltipDelay: InputSignal<number> = input<number>(500);

  private readonly _el: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _renderer: Renderer2 = inject(Renderer2);
  private _tooltipEl?: HTMLElement;
  private _timer?: number;

  @HostListener('mouseenter') _onEnter(): void { ... }     // crea div absolute con texto + clase
  @HostListener('mouseleave') _onLeave(): void { ... }     // destruye
  @HostListener('focusin')    _onFocus(): void { ... }     // mismo flujo para teclado
  @HostListener('focusout')   _onBlur(): void { ... }
  // Toca añadir aria-describedby al host + role="tooltip" al div
}
```

**SCSS global** (en `styles.scss`):
```scss
.lib-tooltip {
  position: absolute;
  background: var(--bg-void);
  color: var(--text-hi);
  border: 1px solid var(--border-strong);
  padding: 0.25rem 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1100;
  pointer-events: none;

  @media (hover: none) { display: none; }   // mobile: sin tooltip
}
```

**Posicionamiento**: el div se ancla con `position: fixed` y se calcula la posición leyendo `getBoundingClientRect()` del host. Por defecto bottom-center; si no cabe en viewport, top-center.

**A11y**:
- `role="tooltip"` en el div.
- El host recibe `aria-describedby="<id-generated>"`.
- Sin tooltip en touch — el usuario ya pone `aria-label` en icon-buttons.

**Deuda a11y declarada**: no se muestra tooltip al focus en teclado si el host no recibe focus (por ejemplo: `<div libTooltip>`). Para iconos puramente decorativos basta el aria-label del wrapper button. Documentar en JSDoc.

**Migración**: 38 `matTooltip` en 10 ficheros.

Patrón:
```diff
- <button matTooltip="...">       →  <button [libTooltip]="'...'">
- <button [matTooltip]="x">       →  <button [libTooltip]="x">
- <button matTooltipShowDelay=200 →  <button [libTooltipDelay]="200">
```

En los TS, sustituir `import { MatTooltipModule } from '@angular/material/tooltip'` por `import { LibTooltipDirective } from '@/shared/lib-tooltip/lib-tooltip.directive'`.

**Specs afectados**: ~3. Mock trivial.

**Criterios de aceptación**:
- 0 `matTooltip` en el repo.
- Tooltips aparecen tras 500ms hover en desktop, nada en mobile.

→ **CHECKPOINT B** — usuario revisa: snackbars de éxito/error en flujos típicos (guardar juego, borrar) y tooltips en topbar/game-card/game-detail.

#### Bloque 3 — Overlay engine (riesgo medio)

##### Commit 25 — `feat(lib): lib-overlay engine sobre CDK Overlay`

**Objetivo**: introducir la infra de overlay reutilizable que servirá para menu, dialog, datepicker popup, select listbox, autocomplete listbox y bottom-sheet. **No** migra ningún consumidor; sólo construye el cimiento y lo testea con un sandbox interno (un dev-only `lib-overlay-demo` accesible bajo `/dev/overlay` si `isDevMode()`).

**Servicio**: `src/app/presentation/services/lib-overlay/lib-overlay.service.ts`

```typescript
export interface LibOverlayConfig {
  readonly origin?: ElementRef | HTMLElement;        // para anchored (menu, select)
  readonly positions?: ConnectedPosition[];          // CDK
  readonly hasBackdrop?: boolean;
  readonly backdropClass?: string;
  readonly panelClass?: string | string[];
  readonly disposeOnNavigation?: boolean;
  readonly scrollStrategy?: 'reposition' | 'block' | 'close';
  readonly focusTrap?: boolean;
  readonly autoFocus?: 'first-tabbable' | 'first-heading' | false;
  readonly restoreFocus?: boolean;
  readonly width?: string;
  readonly height?: string;
}

@Injectable({ providedIn: 'root' })
export class LibOverlayService {
  private readonly _overlay = inject(Overlay);
  private readonly _injector = inject(Injector);

  /**
   * Abre un componente o template dentro de un overlay CDK.
   * Devuelve una ref con .close() y .afterClosed$.
   */
  open<T, R = unknown>(content: ComponentType<T> | TemplateRef<unknown>, config?: LibOverlayConfig): LibOverlayRef<T, R> { ... }
}
```

**LibOverlayRef**: clase ligera que envuelve `OverlayRef` y expone `close(result?)`, `afterClosed$: Observable<R | undefined>`, `keydownEvents$`, `backdropClick$`, `componentInstance`. Internamente conecta un `cdk/a11y` `FocusTrap` cuando `focusTrap` está true, captura el activeElement antes de abrir y lo restaura al cerrar.

**Configs preset**: en el propio servicio se exportan helpers para casos comunes:
```typescript
export const LIB_OVERLAY_DIALOG_CONFIG: LibOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'lib-overlay-backdrop',
  panelClass: 'lib-overlay-panel--dialog',
  scrollStrategy: 'block',
  focusTrap: true,
  autoFocus: 'first-tabbable',
  restoreFocus: true
};

export const LIB_OVERLAY_MENU_CONFIG: LibOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'lib-overlay-backdrop--transparent',
  panelClass: 'lib-overlay-panel--menu',
  scrollStrategy: 'reposition',
  focusTrap: false,                    // ListKeyManager hace el trabajo
  restoreFocus: true
};
```

**SCSS global** (en `styles.scss`):
```scss
.lib-overlay-backdrop {
  background: rgba(0, 0, 0, 0.65);
}
.lib-overlay-backdrop--transparent {
  background: transparent;
}
.lib-overlay-panel--dialog {
  border: 1px solid var(--border-strong);
  background: var(--bg-surface);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}
```

**Imports `package.json`**: ya están `@angular/cdk` instalado (4 usos `@angular/cdk/layout`). Verificar que `@angular/cdk/overlay`, `@angular/cdk/portal` y `@angular/cdk/a11y` son accesibles (lo son — vienen en el mismo paquete).

**provideAnimations / overlay container scroll**: añadir en `app.config.ts` el necesario para que CDK Overlay funcione. CDK Overlay **no requiere** `provideAnimations`. Si por algún motivo `OverlayContainer` no aparece, registrar:
```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// O directamente: nada — CDK Overlay funciona sin animations.
```

**Criterios de aceptación**:
- Compila, lint y test verde.
- El sandbox `/dev/overlay` (sólo `isDevMode()`) abre un overlay simple con focus trap, escape para cerrar y backdrop click para cerrar.
- Ningún consumidor real usa todavía `LibOverlayService`.

##### Commit 26 — `feat(lib): lib-menu sobre lib-overlay + migración de 2 menús`

**Componentes nuevos**:
- `LibMenuComponent` — el panel con la lista de items.
- `LibMenuItemComponent` — un item con `role="menuitem"`.
- `LibMenuTriggerDirective` — `[libMenuTriggerFor]="menuRef"` aplicado al botón disparador.

**LibMenuComponent template**:
```html
<ul class="lib-menu" role="menu" [attr.aria-labelledby]="ariaLabelledBy">
  <ng-content />
</ul>
```

**LibMenuItemComponent template**:
```html
<li class="lib-menu-item" role="none">
  <button type="button" role="menuitem" [disabled]="disabled()" (click)="onClick($event)">
    @if (icon()) { <app-lib-icon [name]="icon()!" class="lib-menu-item__icon" /> }
    <span class="lib-menu-item__label"><ng-content /></span>
  </button>
</li>
```

**LibMenuTriggerDirective**:
- Aplica al host `aria-haspopup="menu"`, `aria-expanded` reactivo.
- Click / Enter / Space / ArrowDown abren.
- Una vez abierto, crea CDK `ListKeyManager` con los `LibMenuItemComponent` proyectados; flechas arriba/abajo navegan, Enter activa, Escape cierra y restaura focus al trigger, type-ahead funciona vía `withTypeAhead()`.

**SCSS**:
```scss
.lib-menu {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  border: 1px solid var(--border-strong);
  background: var(--bg-surface);
  min-width: 12rem;
}
.lib-menu-item {
  button {
    width: 100%;
    text-align: left;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    color: var(--text-mid);
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.8125rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (hover: hover) {
      &:hover { color: var(--text-hi); background: var(--bg-surface-hi); }
    }
    &:focus-visible { outline: 1px solid var(--primary); outline-offset: -1px; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }
}
```

**A11y completa**:
- Roles: `menu` (lista), `menuitem` (cada botón).
- Teclas: ArrowUp/Down (navegación), Home/End (extremos), Enter/Space (activar), Escape (cerrar), Tab (cierra y mueve fuera), type-ahead (escribir letra busca item).
- Focus restore al trigger al cerrar.

**Deuda a11y declarada**: submenús no soportados (no se usan en la app).

**Migración** — 2 menús:

1. `src/app/app.component.html:41-138` — profile menu:
```html
<!-- ANTES -->
<button mat-icon-button [matMenuTriggerFor]="profileMenu">
  <app-lib-icon name="account_circle" />
</button>
<mat-menu #profileMenu="matMenu" panelClass="profile-menu">
  <button mat-menu-item (click)="...">...</button>
</mat-menu>

<!-- DESPUÉS -->
<app-lib-icon-button icon="account_circle" [libMenuTriggerFor]="profileMenu" ... />
<app-lib-menu #profileMenu>
  <app-lib-menu-item icon="settings" (clicked)="...">{{ 'common.settings' | transloco }}</app-lib-menu-item>
  <app-lib-menu-item icon="logout" (clicked)="...">{{ 'common.logout' | transloco }}</app-lib-menu-item>
</app-lib-menu>
```

2. `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.html:48-78` — context menu del game-detail. Mismo patrón.

**Imports a quitar**: `MatMenuModule` de `app.component.ts` y `game-detail.component.ts`.

**Criterios de aceptación**:
- 0 `mat-menu` en el repo.
- Funcional con teclado completo en profile menu (Tab al avatar, Enter, flechas, Enter para activar item).
- Visual idéntico (terminal frame + monospace).

##### Commit 27 — `feat(lib): lib-tabs (sale page) + lib-router-tabs (collection nav)`

**Componentes nuevos**:

`LibTabsComponent` + `LibTabComponent` + `LibTabPanelComponent` — sólo para el `mat-tab-group` de `sale.component.html`.

API:
```html
<app-lib-tabs [selectedIndex]="0" (selectedIndexChange)="onTabChange($event)">
  <app-lib-tab label="Disponible" icon="sell">
    <ng-template>...contenido tab 1...</ng-template>
  </app-lib-tab>
  <app-lib-tab label="Historial" icon="receipt_long">
    <ng-template>...contenido tab 2...</ng-template>
  </app-lib-tab>
</app-lib-tabs>
```

Template `LibTabsComponent`:
```html
<div class="lib-tabs">
  <div role="tablist" class="lib-tabs__list" [attr.aria-label]="ariaLabel()">
    @for (tab of tabs(); track tab; let i = $index) {
      <button
        type="button"
        role="tab"
        [id]="'lib-tab-' + tab.id"
        [attr.aria-controls]="'lib-tabpanel-' + tab.id"
        [attr.aria-selected]="selectedIndex() === i"
        [tabindex]="selectedIndex() === i ? 0 : -1"
        class="lib-tabs__tab"
        [class.lib-tabs__tab--active]="selectedIndex() === i"
        (click)="select(i)"
        (keydown)="onKeydown($event, i)">
        @if (tab.icon) { <app-lib-icon [name]="tab.icon" /> }
        <span>{{ tab.label }}</span>
      </button>
    }
  </div>
  <div class="lib-tabs__panels">
    @for (tab of tabs(); track tab; let i = $index) {
      <div
        role="tabpanel"
        [id]="'lib-tabpanel-' + tab.id"
        [attr.aria-labelledby]="'lib-tab-' + tab.id"
        [hidden]="selectedIndex() !== i">
        <ng-container *ngTemplateOutlet="tab.template" />
      </div>
    }
  </div>
</div>
```

**A11y completa**:
- `tablist` / `tab` / `tabpanel`.
- Roving tabindex: sólo el tab activo tiene `tabindex=0`.
- ArrowLeft/Right (o Up/Down si vertical) navegan, Home/End extremos. Enter/Space activan (con activación automática al navegar — APG `automatic activation`).

**`LibRouterTabsComponent`** — para `collection.component.html`. Renderiza un `<nav>` con `<a>` que usan `routerLinkActive`. Es una **navegación**, no un tablist (cambia URL). Plantilla:

```html
<nav class="lib-router-tabs" [attr.aria-label]="ariaLabel()">
  @for (item of items(); track item.path) {
    <a
      class="lib-router-tabs__link"
      [routerLink]="item.path"
      [routerLinkActiveOptions]="item.exact ? { exact: true } : {}"
      routerLinkActive
      #rla="routerLinkActive"
      [class.lib-router-tabs__link--active]="rla.isActive"
      [attr.aria-current]="rla.isActive ? 'page' : null">
      @if (item.icon) { <app-lib-icon [name]="item.icon" /> }
      <span>{{ item.label }}</span>
    </a>
  }
</nav>
<router-outlet />
```

Input: `items: Signal<readonly { path: string; label: string; icon?: string; exact?: boolean }[]>`.

**Migración**:

1. `src/app/presentation/pages/sale/sale.component.html` — `<mat-tab-group>` → `<app-lib-tabs>` con 2 tabs. Mover el `(selectedTabChange)` a `(selectedIndexChange)`. **Cambio visual aceptado**: sin la animación de 150ms — el plan general ya elimina animations decorativas.

2. `src/app/presentation/pages/collection/collection.component.html` — `<nav mat-tab-nav-bar>...</nav>` → `<app-lib-router-tabs [items]="navItems" />`. El `routerLinkActive` se mueve dentro del componente. Definir `navItems` en `CollectionComponent`:
```typescript
readonly navItems: readonly { path: string; label: string; icon: string; exact?: boolean }[] = [
  { path: '/collection', label: 'collectionOverview.tabOverview', icon: 'home', exact: true },
  { path: '/collection/games', label: 'collectionOverview.tabGames', icon: 'sports_esports' },
  { path: '/collection/consoles', label: 'collectionOverview.tabConsoles', icon: 'tv' },
  { path: '/collection/controllers', label: 'collectionOverview.tabControllers', icon: 'gamepad' }
];
```

Los labels los traduce el template del componente via `transloco`.

**Imports a quitar**: `MatTabsModule` de `sale.component.ts` y `collection.component.ts`.

**Criterios de aceptación**:
- 0 `mat-tab` en el repo.
- Teclado: en sale page, flechas izq/der cambian tab, Home/End van a extremos. En collection nav, Tab entre links funciona como navegación normal.
- `aria-current="page"` en el link activo de collection nav.

##### Commit 28 — `feat(lib): lib-bottom-sheet + migración de game-list-filters-sheet`

**Decisión arquitectónica**: el bottom-sheet **reutiliza la infra de `LibOverlayService`** con un preset específico. NO se crea un servicio independiente — sería duplicar `LibOverlayService`.

**Helper preset** en `lib-overlay.service.ts`:
```typescript
export const LIB_OVERLAY_BOTTOM_SHEET_CONFIG: LibOverlayConfig = {
  hasBackdrop: true,
  backdropClass: 'lib-overlay-backdrop',
  panelClass: 'lib-overlay-panel--bottom-sheet',
  scrollStrategy: 'block',
  focusTrap: true,
  autoFocus: 'first-tabbable',
  restoreFocus: true
};
```

**SCSS** (en `styles.scss`):
```scss
.lib-overlay-panel--bottom-sheet {
  position: fixed !important;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 90vh;
  border: 1px solid var(--border-strong);
  border-bottom: none;
  background: var(--bg-surface);
}
```

**API consumidor** — se ofrece un wrapper conveniente `LibBottomSheetService.open(component, data)` que internamente llama a `LibOverlayService.open(component, { ...LIB_OVERLAY_BOTTOM_SHEET_CONFIG, data })`. Token de inyección `LIB_BOTTOM_SHEET_DATA` para que el componente abierto reciba la data.

```typescript
@Injectable({ providedIn: 'root' })
export class LibBottomSheetService {
  private readonly _overlay = inject(LibOverlayService);
  open<T, R = unknown>(component: ComponentType<T>, data?: unknown): LibBottomSheetRef<T, R> { ... }
}
```

**Migración** — 1 consumidor:

`src/app/presentation/pages/collection/pages/games/games.component.ts:86, 365`:
```diff
- import { MatBottomSheet } from '@angular/material/bottom-sheet';
+ import { LibBottomSheetService } from '@/services/lib-bottom-sheet/lib-bottom-sheet.service';
- private readonly _bottomSheet: MatBottomSheet = inject(MatBottomSheet);
+ private readonly _bottomSheet: LibBottomSheetService = inject(LibBottomSheetService);
  // call-site:
- this._bottomSheet.open(GameListFiltersSheetComponent, { data: this.filtersData });
+ this._bottomSheet.open(GameListFiltersSheetComponent, this.filtersData);
```

`src/app/presentation/pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.ts`:
```diff
- import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
+ import { LIB_BOTTOM_SHEET_DATA, LibBottomSheetRef } from '@/services/lib-bottom-sheet/lib-bottom-sheet.service';
```

**A11y**:
- `role="dialog"` + `aria-modal="true"` en el panel.
- Focus trap.
- Escape cierra.
- Backdrop click cierra.

**Deuda a11y declarada**: swipe-down para cerrar — no implementado en este commit. Está la X superior. Documentar como mejora futura.

**Criterios de aceptación**:
- 0 imports de `@angular/material/bottom-sheet` en `src/`.
- Filtros mobile siguen abriéndose desde el FAB.
- Escape y backdrop cierran.

→ **CHECKPOINT C** — usuario revisa: profile menu + context menu (game-detail), sale tabs + collection nav-tabs, filtros mobile en games list.

#### Bloque 4 — Dialog system (riesgo alto)

##### Commit 29 — `feat(lib): lib-dialog service + componentes wrapper + migración de los 7 dialogs`

**Servicio**: `src/app/presentation/services/lib-dialog/lib-dialog.service.ts`

```typescript
export interface LibDialogConfig<D = unknown> {
  readonly data?: D;
  readonly ariaLabel?: string;
  readonly ariaLabelledBy?: string;
  readonly panelClass?: string | string[];
  readonly width?: string;
  readonly maxWidth?: string;
  readonly disableClose?: boolean;          // bloquea escape/backdrop
  readonly autoFocus?: 'first-tabbable' | 'first-heading' | false;
  readonly restoreFocus?: boolean;
}

@Injectable({ providedIn: 'root' })
export class LibDialogService {
  private readonly _overlay = inject(LibOverlayService);

  open<T, D = unknown, R = unknown>(component: ComponentType<T>, config?: LibDialogConfig<D>): LibDialogRef<T, R> { ... }
}
```

**Tokens y refs**:
- `LIB_DIALOG_DATA` — InjectionToken para acceso a `config.data` dentro del componente.
- `LibDialogRef<T, R>` — clase con `.close(result?)`, `.afterClosed()`, `.componentInstance`, `.backdropClick$`, `.keydownEvents$`.

**Componentes wrapper de template** (paridad con MatDialogTitle / Content / Actions / Close):

- `LibDialogTitleComponent` (selector `[lib-dialog-title]`) — aplica `id` autogenerado y lo registra en el host del overlay como `aria-labelledby`. Renderiza un `<h2>` o el tag indicado.
- `LibDialogContentComponent` (selector `[lib-dialog-content]`) — clase con padding + scroll vertical.
- `LibDialogActionsComponent` (selector `[lib-dialog-actions]`) — flex row con justify-end por defecto, `[align]` input para `start`/`center`/`end`.
- `LibDialogCloseDirective` (selector `[libDialogClose]`) — al hacer click cierra el dialog con el valor pasado (`[libDialogClose]="true"` cierra con `true`).

**Template ejemplo (post-migración del ConfirmDialogComponent)**:
```html
<header lib-dialog-title>{{ data.title }}</header>
<div lib-dialog-content>{{ data.message }}</div>
<footer lib-dialog-actions align="end">
  <app-lib-button [label]="'common.no' | transloco" variant="ghost" libDialogClose />
  <app-lib-button [label]="'common.yes' | transloco" variant="danger" [libDialogClose]="true" />
</footer>
```

Y en el TS:
```diff
- import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
+ import { LIB_DIALOG_DATA, LibDialogActionsComponent, LibDialogCloseDirective, LibDialogContentComponent, LibDialogRef, LibDialogTitleComponent } from '@/services/lib-dialog/lib-dialog.service';
- imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, ...]
+ imports: [LibDialogTitleComponent, LibDialogContentComponent, LibDialogActionsComponent, LibDialogCloseDirective, ...]
- data: ConfirmDialogInterface = inject<ConfirmDialogInterface>(MAT_DIALOG_DATA);
+ data: ConfirmDialogInterface = inject<ConfirmDialogInterface>(LIB_DIALOG_DATA);
- dialogRef: MatDialogRef<ConfirmDialogComponent> = inject(MatDialogRef<ConfirmDialogComponent>);
+ dialogRef: LibDialogRef<ConfirmDialogComponent> = inject(LibDialogRef<ConfirmDialogComponent>);
```

**SCSS** (en `lib-dialog.component.scss`, importado globalmente):
```scss
.lib-dialog__title {
  margin: 0;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--text-hi);
}
.lib-dialog__content {
  padding: 1.25rem;
  overflow-y: auto;
  color: var(--text-mid);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8125rem;
}
.lib-dialog__actions {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border);

  &--end    { justify-content: flex-end; }
  &--center { justify-content: center; }
  &--start  { justify-content: flex-start; }
}
```

**A11y completa**:
- Panel del overlay con `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (id del título) + opcional `aria-label`.
- Focus trap con `cdk/a11y` FocusTrap.
- Escape cierra (a menos que `disableClose: true`).
- Backdrop click cierra (a menos que `disableClose: true`).
- Focus restore al activeElement previo.
- Scroll lock del body via `scrollStrategy: 'block'`.

**Migración** — 16 call-sites + 7 componentes:

Componentes (cambiar inyección de tokens + template wrappers):
1. `src/app/presentation/components/confirm-dialog/confirm-dialog.component.ts`
2. `src/app/presentation/pages/settings/components/avatar-crop-dialog/avatar-crop-dialog.component.ts`
3. `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-cover-position-dialog/game-cover-position-dialog.component.ts`
4. `src/app/presentation/pages/management/pages/users/components/delete-user-dialog/delete-user-dialog.component.ts`
5. `src/app/presentation/pages/orders/pages/order-detail/components/add-edit-line-dialog/add-edit-line-dialog.component.ts`
6. `src/app/presentation/pages/orders/pages/order-detail/components/ready-dialog/ready-dialog.component.ts`
7. `src/app/presentation/pages/wishlist/components/wishlist-item-dialog/wishlist-item-dialog.component.ts`

Call-sites (cambiar `MatDialog` → `LibDialogService`, `MatDialogRef<X>` → `LibDialogRef<X>`):
1. `src/app/presentation/abstract/hardware-detail-base/hardware-detail-base.component.ts`
2. `src/app/presentation/pages/settings/settings.component.ts`
3. `src/app/presentation/pages/collection/pages/games/components/game-row/game-row.component.ts`
4. `src/app/presentation/pages/collection/pages/games/components/game-card/game-card.component.ts`
5. `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.ts`
6. `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.ts`
7. `src/app/presentation/pages/management/pages/hardware/pages/editions/hardware-editions-management.component.ts`
8. `src/app/presentation/pages/management/pages/hardware/pages/brands/hardware-brands-management.component.ts`
9. `src/app/presentation/pages/management/pages/hardware/pages/models/hardware-models-management.component.ts`
10. `src/app/presentation/pages/management/pages/stores/stores-management.component.ts`
11. `src/app/presentation/pages/management/pages/protectors/protectors-management.component.ts`
12. `src/app/presentation/pages/management/pages/users/users-management.component.ts`
13. `src/app/presentation/pages/orders/pages/order-detail/order-detail.component.ts`
14. `src/app/presentation/pages/wishlist/wishlist.component.ts`
15. `src/app/presentation/pages/wishlist/pages/wishlist-detail/wishlist-detail.component.ts`

Patrón call-site:
```diff
- private readonly _dialog: MatDialog = inject(MatDialog);
+ private readonly _dialog: LibDialogService = inject(LibDialogService);
- const ref: MatDialogRef<ConfirmDialogComponent> = this._dialog.open(ConfirmDialogComponent, { data: { ... }, width: '400px' });
+ const ref: LibDialogRef<ConfirmDialogComponent, boolean> = this._dialog.open(ConfirmDialogComponent, { data: { ... }, width: '400px' });
  ref.afterClosed().subscribe(result => { ... });   // misma API
```

**Mock para tests**: `src/testing/lib-dialog.mock.ts`:
```typescript
export const mockLibDialog: { open: jasmine.Spy } = {
  open: jasmine.createSpy('open').and.returnValue({
    afterClosed: () => of(undefined),
    close: jasmine.createSpy('close'),
    componentInstance: null
  })
};
```

Y entrada en CLAUDE.md.

**Deuda a11y declarada**:
- `aria-describedby` automático apuntando al primer `[lib-dialog-content]`: **NO** implementado en este commit. Material lo hace; nuestra primera versión no. Deuda baja (los lectores leen el contenido del dialog igualmente al entrar en focus trap).
- `role="alertdialog"` para confirmaciones destructivas: no diferenciado del `dialog` normal. Deuda media — futura mejora del `ConfirmDialogComponent`.

**Criterios de aceptación**:
- 0 imports de `@angular/material/dialog` en `src/`.
- Todos los flujos que abren dialog funcionan (eliminar juego, editar wishlist, crear edición de hardware, crear/editar línea de orden, etc.).
- Escape y backdrop cierran.
- Focus trap funciona (Tab dentro del dialog no escapa).
- Focus restore al elemento previo al abrir.

→ **CHECKPOINT D** — usuario revisa: cada dialog manualmente (los 7), comprobando teclado (Tab cíclico, Escape) y aspecto visual. **Es el checkpoint más crítico** — si algo falla aquí, el bloque 5 se bloquea.

#### Bloque 5 — Formularios (riesgo muy alto)

##### Commit 30 — `feat(lib): lib-form-field + lib-input + lib-label + lib-error + lib-hint`

**Objetivo**: construir la infraestructura de form-field sin todavía tocar select/autocomplete/datepicker. **Migrar primero un único formulario simple como caso de validación**: `wishlist-item-dialog.component.html` (1 input texto + 1 textarea, sin selects).

**Componentes nuevos**:

`LibFormFieldComponent` — wrapper:
```html
<div class="lib-form-field" [class.lib-form-field--invalid]="invalid()" [class.lib-form-field--focused]="focused()" [class.lib-form-field--disabled]="disabled()">
  <ng-content select="[libLabel], app-lib-label" />
  <div class="lib-form-field__control">
    <ng-content select="[libPrefix]" />
    <ng-content />                          <!-- el input proyectado -->
    <ng-content select="[libSuffix]" />
  </div>
  <div class="lib-form-field__subscript">
    @if (invalid()) {
      <ng-content select="app-lib-error, [libError]" />
    } @else {
      <ng-content select="app-lib-hint, [libHint]" />
    }
  </div>
</div>
```

API:
- Detecta automáticamente el control proyectado vía `@ContentChild(LibInputDirective)` (o select/autocomplete/datepicker en commits siguientes). Si el control es un `FormControl`, observa su `statusChanges` y `touched` para calcular `invalid()`.
- Inputs: `[label]` (alternativa a proyectar `<app-lib-label>`), `[required]`, `[disabled]`.

**LibInputDirective**:
```typescript
@Directive({
  selector: 'input[libInput], textarea[libInput]',
  standalone: true,
  host: {
    'class': 'lib-input__control',
    '(focus)': '_onFocus()',
    '(blur)': '_onBlur()'
  }
})
export class LibInputDirective { ... }
```

Notifica al `LibFormFieldComponent` padre vía un service `LibFormFieldStateService` (provideIn parent) cuando recibe focus/blur. Si el host tiene `formControl`, el directive lee `NgControl` y se conecta al estado.

**LibLabelComponent**:
```html
<label class="lib-label" [attr.for]="for()">
  <ng-content />
  @if (required()) { <span class="lib-label__required" aria-hidden="true">*</span> }
</label>
```

**LibErrorComponent**:
```html
<span class="lib-error" role="alert"><ng-content /></span>
```

**LibHintComponent**:
```html
<span class="lib-hint"><ng-content /></span>
```

**SCSS** (terminal):
```scss
.lib-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__control {
    display: flex;
    align-items: center;
    border: 1px solid var(--border);
    background: var(--bg-surface);
    padding: 0 0.75rem;
    min-height: 44px;
    transition: border-color 120ms linear;

    .lib-input__control {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-hi);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      padding: 0.5rem 0;

      &::placeholder { color: var(--text-lo); }
      &:disabled { color: var(--text-lo); cursor: not-allowed; }
    }
  }

  &--focused .lib-form-field__control { border-color: var(--primary); }
  &--invalid .lib-form-field__control { border-color: var(--accent-rose); }
  &--disabled { opacity: 0.5; pointer-events: none; }

  &__subscript {
    min-height: 1rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.6875rem;
  }
}
.lib-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-mid);

  &__required { color: var(--accent-rose); margin-left: 0.25rem; }
}
.lib-error { color: var(--accent-rose); }
.lib-hint  { color: var(--text-lo); }
```

**A11y**:
- `<label for="">` correctamente vinculado al input. Si no se pasa `for`, generar un id en `LibInputDirective` y enlazarlo automáticamente (via DI mutual).
- `aria-invalid` sobre el input cuando `invalid()`.
- `aria-describedby` apuntando al id del `lib-error` o `lib-hint` si existe.
- `aria-required` cuando required.

**Migración piloto** — sólo `wishlist-item-dialog.component.html`. El resto de formularios se quedan con `mat-form-field` un commit más; el siguiente commit (Commit 35) migra el resto que no usa select/autocomplete/datepicker.

**Deuda a11y declarada**:
- `aria-describedby` con múltiples ids (hint + error simultáneos): no soportado, sólo uno a la vez. Material soporta ambos.
- Sin "floating label" animado: nuestra label vive arriba siempre (decisión de diseño terminal).

**Criterios de aceptación**:
- Compila + lint + test verde.
- `wishlist-item-dialog` funciona con teclado: Tab al input, escribir, validation visual al borrar required, mensaje de error visible.
- `mat-form-field` sigue presente en el resto de la app (no se ha tocado todavía).

##### Commit 31 — `feat(lib): migrar todos los form-field text-only a lib-form-field`

**Objetivo**: migrar los `<mat-form-field>` que **NO** llevan `<mat-select>`, `<mat-autocomplete>` ni `<mat-datepicker>`. Son ~50 de los 80 totales.

**Búsqueda** para identificar los simples:
```bash
# Form-fields con select/autocomplete/datepicker (NO tocar todavía):
grep -l "mat-select\|mat-autocomplete\|mat-datepicker" $(grep -rln "mat-form-field" src/ --include="*.html")
# El resto son los simples.
```

Por aproximación, los form-fields simples viven en:
- Auth: `login.html`, `register.html`, `forgot-password.html`, `reset-password.html` (~6 fields total)
- Hardware edit panels: `hardware-brand-edit-panel`, `hardware-edition-edit-panel` (~4)
- Stores edit panel: `store-edit-panel` (~2)
- Protectors: `protector-edit-panel` (~3)
- Orders: `order-create` (~2)
- Settings: nombre + email fields (~2)
- Catalog-search-panel (~1, sólo si no usa autocomplete)
- `wishlist.component.html` filtros simples
- `delete-user-dialog`

**Patrón de migración** (estricto):
```diff
- <mat-form-field appearance="outline" class="game-form__field">
-   <mat-label>{{ 'gameForm.fields.title' | transloco }}</mat-label>
-   <input matInput formControlName="title" />
-   <mat-icon matSuffix>lock</mat-icon>
-   @if (form.controls.title.hasError('required')) {
-     <mat-error>{{ 'gameForm.errors.required' | transloco }}</mat-error>
-   }
- </mat-form-field>
+ <app-lib-form-field class="game-form__field">
+   <app-lib-label>{{ 'gameForm.fields.title' | transloco }}</app-lib-label>
+   <input libInput formControlName="title" />
+   <app-lib-icon libSuffix name="lock" />
+   @if (form.controls.title.hasError('required')) {
+     <app-lib-error>{{ 'gameForm.errors.required' | transloco }}</app-lib-error>
+   }
+ </app-lib-form-field>
```

**Specs afectados**: muchos (~15). El selector `By.css('mat-form-field')` → `By.css('app-lib-form-field')`. Aserciones sobre `mat-error` → `app-lib-error`.

**Criterios de aceptación**:
- 0 `mat-form-field` que NO contenga `mat-select/mat-autocomplete/mat-datepicker` (verificar con grep).
- Auth forms, register/login, settings, hardware edit panels visualmente OK.
- Validación: error rojo aparece al hacer touched y dejar vacío.

##### Commit 32 — `feat(lib): lib-select + migración de 19 selects`

**Componentes**:

`LibSelectComponent` — implementa `ControlValueAccessor`. Renderiza:
```html
<button
  type="button"
  class="lib-select__trigger"
  role="combobox"
  [attr.aria-expanded]="open()"
  [attr.aria-haspopup]="'listbox'"
  [attr.aria-controls]="listboxId"
  [attr.aria-labelledby]="ariaLabelledBy"
  [attr.aria-activedescendant]="open() ? activeOptionId() : null"
  [disabled]="disabled()"
  (click)="toggle()"
  (keydown)="onTriggerKeydown($event)">
  <span class="lib-select__value">{{ displayValue() }}</span>
  <app-lib-icon name="expand_more" class="lib-select__caret" />
</button>
```

El listbox emergente se abre con `LibOverlayService` (preset menu-like, sin focus trap — el activeDescendant pattern es mejor para combobox que mover focus a las opciones).

`LibOptionComponent` (selector `app-lib-option`):
```html
<li
  class="lib-option"
  role="option"
  [id]="id"
  [attr.aria-selected]="selected()"
  [attr.aria-disabled]="disabled()"
  (click)="onClick()">
  <ng-content />
</li>
```

API:
```html
<app-lib-form-field>
  <app-lib-label>Plataforma</app-lib-label>
  <app-lib-select formControlName="platform">
    @for (p of platforms; track p.code) {
      <app-lib-option [value]="p.code">{{ p.labelKey | transloco }}</app-lib-option>
    }
  </app-lib-select>
</app-lib-form-field>
```

**A11y completa (APG combobox + listbox + activeDescendant)**:
- Trigger: `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls="<listbox-id>"`, `aria-activedescendant="<option-id>"` cuando hay highlight.
- Listbox: `role="listbox"`, `aria-labelledby` apuntando a la label del form-field.
- Cada opción: `role="option"`, `aria-selected` reactivo.
- Teclas (trigger cerrado): Enter/Space/ArrowDown/ArrowUp abren y posicionan el highlight; tipo-letra abre y va a la primera opción que matchea.
- Teclas (listbox abierto): ArrowDown/Up navegan, Home/End extremos, Enter/Space seleccionan y cierran, Escape cierra sin cambios, Tab cierra y selecciona, type-ahead.
- Click fuera cierra.

**Migración**: 19 `<mat-select>` en 10 ficheros (ver `grep`).

Patrón:
```diff
- <mat-form-field appearance="outline">
-   <mat-label>Estado</mat-label>
-   <mat-select formControlName="status">
-     @for (s of statuses; track s.code) {
-       <mat-option [value]="s.code">{{ s.labelKey | transloco }}</mat-option>
-     }
-   </mat-select>
- </mat-form-field>
+ <app-lib-form-field>
+   <app-lib-label>Estado</app-lib-label>
+   <app-lib-select formControlName="status">
+     @for (s of statuses; track s.code) {
+       <app-lib-option [value]="s.code">{{ s.labelKey | transloco }}</app-lib-option>
+     }
+   </app-lib-select>
+ </app-lib-form-field>
```

**Caso especial: opción con icono** (game-form status field, líneas 183-187):
```html
<app-lib-option [value]="status.code">
  <app-lib-icon [name]="status.icon" [style.color]="status.color" />
  {{ status.labelKey | transloco }}
</app-lib-option>
```
Funciona porque LibOption usa `<ng-content>` libre.

**Imports a quitar**: `MatSelectModule`, `MatOption` de los 10 ficheros TS.

**Deuda a11y declarada**:
- Multi-select (`[multiple]`): NO implementado en este commit (no se usa en la app). Documentar en JSDoc como deuda futura si aparece la necesidad.
- `compareWith` para objetos: implementado mínimamente (comparación por referencia). Si algún select usa `[compareWith]`, replicar.

**Criterios de aceptación**:
- 0 `<mat-select>` en el repo.
- Teclado completo en cada select migrado.
- `formControlName` enlazado correctamente — los valores guardados en el form coinciden con los antiguos.

##### Commit 33 — `feat(lib): lib-autocomplete + migración de 6 autocompletes`

**Componentes**:

`LibAutocompleteComponent` y `LibAutocompleteTriggerDirective` (`[libAutocompleteTrigger]`):
```html
<!-- Trigger en un input nativo dentro de lib-form-field -->
<input
  libInput
  [libAutocompleteTrigger]="auto"
  [formControl]="form.controls.platform" />
<app-lib-autocomplete #auto [displayWith]="displayFn">
  @for (p of filtered(); track p.code) {
    <app-lib-option [value]="p.code">{{ p.label }}</app-lib-option>
  }
</app-lib-autocomplete>
```

Diferencias clave vs select:
- El control es un `<input>` libre — el usuario escribe.
- El listbox emergente se filtra por lo que escribe (lógica del consumidor — `filtered()` es un computed signal en el componente).
- `[displayWith]` recibe una función `(value: T) => string` para transformar el valor del FormControl en lo mostrado en el input cuando se selecciona.
- Al seleccionar una opción se emite `(selected)` con el valor y se cierra.

A nivel ARIA, sigue siendo combobox + listbox pero con `aria-autocomplete="list"`.

**Teclas**:
- ArrowDown abre y navega; type filtra naturalmente.
- Enter selecciona la opción highlighted (si la hay) o cierra (si ninguna).
- Escape cierra y restaura el valor previo.
- Tab cierra (selecciona la highlighted si la hay; abierto a discusión — Material selecciona).

**Validador custom `invalidOption`**: el game-form actualmente usa un validator que invalida si el valor del control no matchea ninguna opción válida. Este validator es independiente del componente — se mantiene en el FormControl y opera sobre el valor crudo. No necesita cambios.

**`[displayWith]`**: input del componente; cuando recibe un valor desde `writeValue`, llama a `displayFn(value)` y lo pinta en el `<input>` interno (a través de `setValue` del FormControl si está enlazado, o de `nativeElement.value` si no).

**Migración**: 6 `<mat-autocomplete>` en 4 ficheros — todos en `game-form.component.html` (platform, store) y `add-edit-line-dialog.component.html` (product), más posiblemente en `hardware-model-edit-panel`. Verificar con grep.

Patrón estricto del game-form (líneas 124-145 actual):
```diff
- <mat-form-field appearance="outline" class="game-form__field">
-   <mat-label>{{ 'gameForm.fields.platform' | transloco }}</mat-label>
-   <input type="text" matInput [matAutocomplete]="platformAuto" [formControl]="form.controls.platform" />
-   <mat-autocomplete #platformAuto="matAutocomplete" [displayWith]="displayPlatformLabel">
-     @for (platform of filteredPlatforms(); track platform.code) {
-       <mat-option [value]="platform.code">{{ platform.labelKey | transloco }}</mat-option>
-     }
-   </mat-autocomplete>
-   @if (form.controls.platform.value) {
-     <app-lib-icon-button matSuffix size="sm" icon="close" ... />
-   }
- </mat-form-field>
+ <app-lib-form-field class="game-form__field">
+   <app-lib-label>{{ 'gameForm.fields.platform' | transloco }}</app-lib-label>
+   <input libInput type="text" [libAutocompleteTrigger]="platformAuto" [formControl]="form.controls.platform" />
+   <app-lib-autocomplete #platformAuto [displayWith]="displayPlatformLabel">
+     @for (platform of filteredPlatforms(); track platform.code) {
+       <app-lib-option [value]="platform.code">{{ platform.labelKey | transloco }}</app-lib-option>
+     }
+   </app-lib-autocomplete>
+   @if (form.controls.platform.value) {
+     <app-lib-icon-button libSuffix size="sm" icon="close" ... />
+   }
+ </app-lib-form-field>
```

**Deuda a11y declarada**:
- Anuncio del número de opciones disponibles (`aria-live` con "5 opciones disponibles"): NO implementado. Material lo hace. Deuda media.
- `aria-activedescendant` actualizado al filtrar: implementado.

**Criterios de aceptación**:
- 0 `<mat-autocomplete>` en el repo.
- game-form: platform y store funcionan (escribir, filtrar, seleccionar, validar invalidOption).
- Add line dialog en orders: producto se busca y selecciona.

##### Commit 34 — `feat(lib): lib-datepicker + migración de 4 datepickers`

**Decisión**: implementar **desde cero**. La grid del calendario es manejable y mantiene consistencia visual + bundle limpio. Si en la implementación se detecta que cuesta más de 1 día de tech engineer, **alternativa**: instalar `flatpickr@4.6.13` (3.5KB gz) y envolverlo con un wrapper Angular que aplique theme terminal. **Decisión final reservada al tech lead** durante la implementación; el plan documenta ambas vías.

**Componente**: `LibDatepickerComponent` + `LibDatepickerToggleDirective` (icono que abre).

**API**:
```html
<app-lib-form-field>
  <app-lib-label>Fecha</app-lib-label>
  <input libInput [libDatepicker]="picker" formControlName="purchaseDate" [readonly]="true" />
  <app-lib-icon libSuffix libDatepickerToggle [for]="picker" name="calendar_today" />
  <app-lib-datepicker #picker [min]="minDate" [max]="maxDate" />
</app-lib-form-field>
```

**Internals**:
- El popup se abre con `LibOverlayService` preset menu-like.
- Renderiza un calendario mes vista:
  - Header: botones prev/next mes, dropdown año, botón "hoy".
  - Grid 7×6: encabezados días de semana (`L M X J V S D` para `es-ES`), celdas día con `role="gridcell"`, `aria-selected`, `tabindex` roving.
  - Vista mes (`role="grid"`).
- Vistas opcionales: año (12 meses), década (12 años). Iniciar sólo con vista mes; las otras como deuda si hace falta.
- Locale `es-ES`: usar `Intl.DateTimeFormat('es-ES', ...)` para días de semana, mes, año.

**Teclas (APG date picker dialog grid pattern)**:
- ArrowLeft/Right: día anterior/siguiente.
- ArrowUp/Down: semana anterior/siguiente.
- Home/End: inicio/fin de semana.
- PageUp/PageDown: mes anterior/siguiente.
- Shift+PageUp/Down: año anterior/siguiente.
- Enter/Space: seleccionar día y cerrar.
- Escape: cerrar sin cambios.

**A11y completa**:
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` (header con "Marzo 2026").
- Grid `role="grid"`, filas `role="row"`, celdas `role="gridcell"`.
- Día actual: `aria-current="date"`.
- Día seleccionado: `aria-selected="true"`.
- Día fuera de mes: `aria-disabled="true"` (opcional, mostrar grises).

**Locale + provideNativeDateAdapter**: ya no se necesita `provideNativeDateAdapter` ni `MAT_DATE_LOCALE` en `app.config.ts`. Quitar esos providers. El componente trabaja con `Date` nativo y formatea con `Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'long', day: '2-digit' })`.

**`[matDatepickerParse]`** (sale-form usa esa key de error): se sustituye por un error custom `'invalidDate'` aplicado por el validator del FormControl (o por el propio `LibDatepickerComponent` cuando `writeValue` recibe un valor inválido).

**Migración**: 4 datepickers (verificados):
1. `src/app/presentation/pages/collection/components/hardware-form-shell/hardware-form-shell.component.html:117-119`
2. `src/app/presentation/pages/collection/components/sale-form/sale-form.component.html:66-69`
3. `src/app/presentation/pages/collection/components/hardware-loan-form/hardware-loan-form.component.html:56-58`
4. `src/app/presentation/pages/collection/pages/games/pages/game-detail/components/game-loan-form/game-loan-form.component.html:52-54`

Y eliminar la directiva `DatepickerFieldClickDirective` (`src/app/presentation/shared/datepicker-field-click/datepicker-field-click.directive.ts`) que sólo existía para abrir el datepicker al click en el wrapper — el nuevo lib-datepicker se abre desde el toggle, no del wrapper.

**Imports a quitar**: `MatDatepickerModule`, `provideNativeDateAdapter`, `MAT_DATE_LOCALE` de los componentes + `app.config.ts`.

**Deuda a11y declarada**:
- Sin range picker (no se usa en la app).
- Sin entrada por teclado del input (escribir "2026-03-15"): el actual ya es `[readonly]="true"`, así que no aplica.
- Sin auto-focus al día actual al abrir: implementado.
- Sin anuncios `aria-live` al cambiar de mes (Material no los hace tampoco). Deuda baja.
- Si la implementación se desvía a flatpickr, la deuda a11y se mide contra lo que flatpickr ofrece (es razonable, no perfecto, manejable).

**Criterios de aceptación**:
- 0 `<mat-datepicker>` en el repo.
- 4 formularios con fecha funcionan (sale, hardware-loan, hardware-form, game-loan).
- Teclado en el calendario navega correctamente.
- Locale `es-ES` (días en español, lunes primer día).

→ **CHECKPOINT E** — usuario revisa: game-form completo (autocompletes + selects + inputs + datepicker), un dialog de edición con form complejo (add-edit-line orders), un loan form. Verificar que TODO el flujo del CRUD funciona.

#### Bloque 6 — Cleanup final

##### Commit 35 — `chore(theme): quitar mat.theme() + tokens propios + manifest`

**Objetivo**: eliminar la dependencia visual de `@angular/material` en `styles.scss`.

**Cambios**:

1. Quitar de `src/styles.scss`:
```diff
- @use '@angular/material' as mat;
- @include mat.theme((...))
- // Sobrescritura de tokens Material (--mat-sys-*): eliminar todas
```

2. Tokens propios — ya están definidos en `:root` (`--bg-void`, `--text-hi`, etc.). Asegurar cobertura completa.

3. Sin `mat-typography` en `<body>`: quitar la clase de `src/index.html`.

4. Si quedan `--mat-*` referenciados en SCSS de componentes, sustituirlos por las variables locales (`--text-hi`, `--bg-surface`, etc.). Grep:
```bash
grep -rn "var(--mat-" src/ --include="*.scss"
```

5. `src/manifest.webmanifest`: `theme_color` y `background_color` ya deberían estar a `#000000` por Fases anteriores; verificar.

**Criterios de aceptación**:
- `grep -rn "@angular/material" src/styles.scss` → 0.
- `grep -rn "var(--mat-" src/ --include="*.scss"` → 0.
- Visual: idéntico (los tokens nuevos asumen los valores que tenía la sobrescritura).

##### Commit 36 — `chore(deps): npm uninstall @angular/material + verificación CDK`

**Pre-check obligatorio**:
```bash
grep -rn "@angular/material" src/ --include="*.ts" --include="*.html" --include="*.scss"
# → debe dar 0 resultados.
```

Si quedara alguno, detener y arreglar antes.

**Comandos**:
```bash
npm uninstall @angular/material
npm install                                        # sincroniza lock
npm run build && npm run lint && npm test --watch=false
```

**Decisión sobre `@angular/cdk`**:
```bash
grep -rn "@angular/cdk" src/ --include="*.ts" --include="*.html"
# Espera:
# - @angular/cdk/overlay   (lib-overlay.service usa Overlay, ScrollStrategy, OverlayConfig, ConnectedPosition)
# - @angular/cdk/portal    (ComponentPortal, TemplatePortal)
# - @angular/cdk/a11y      (FocusTrap, ListKeyManager, FocusMonitor)
# - @angular/cdk/layout    (BreakpointObserver — 4 usos)
```

**Resolución**: `@angular/cdk` **se mantiene** en `package.json` como dependencia justificada. CDK es un kit de primitivas (FocusTrap, Overlay, ListKeyManager) — eliminarlo implicaría reimplementar trampas de focus y posicionamiento de overlays, lo cual NO está en el scope del usuario ("preferir corregir a11y gradualmente vs depender de librería externa"). FocusTrap a mano es exactamente el tipo de cosa que querríamos NO inventar. **Documentar la decisión en `docs/LIB_COMPONENTS.md` y `CLAUDE.md`** como sección "Dependencias externas conservadas".

Si en el futuro el usuario quiere también eliminar CDK, se planificaría como Fase 11 con su propio análisis de riesgo (no trivial — reimplementar Overlay + FocusTrap son 3-5 días).

**`@angular/animations`**: ¿se necesita?
```bash
grep -rn "@angular/animations" src/ --include="*.ts"
# → 0 (verificado en inventario inicial).
```

Sin uso propio. CDK Overlay no lo requiere. Material lo requería como peer, pero Material ya no está. `npm uninstall @angular/animations` si está en deps directos:
```bash
cat package.json | grep "@angular/animations"
# Si está → npm uninstall @angular/animations
```

Quitar `provideAnimations`/`BrowserAnimationsModule` si quedaran en algún sitio (verificado: ya no hay).

**`@angular/platform-browser/animations` imports**: comprobar y limpiar.

**Criterios de aceptación**:
- `package.json` sin `@angular/material` ni `@angular/animations`.
- `package-lock.json` sincronizado.
- `npm run build && npm run lint && npm test --watch=false` verde.
- Bundle size: medir antes/después. Esperado: -150KB gz (Material + Animations).
- `npm ls @angular/material` → no encontrado.

##### Commit 37 — `test(lib): actualizar specs + mocks + docs`

**Objetivo**: cerrar la deuda de tests que se haya acumulado durante el refactor.

**Pasos**:

1. Auditoría de specs:
```bash
grep -rn "MatDialog\|MatSnackBar\|MatSelect\|MatFormField\|MatAutocomplete\|MatDatepicker\|MatBottomSheet\|MatMenu\|MatTabs\|MatTooltip\|mat-icon" src/ --include="*.spec.ts" | wc -l
```
Deben quedar **0** referencias a Material en specs.

2. Actualizar mocks en `src/testing/`:
   - Crear `lib-snackbar.mock.ts` (Commit 23) → verificar que existe.
   - Crear `lib-dialog.mock.ts` (Commit 29) → verificar que existe.
   - Crear `lib-bottom-sheet.mock.ts`.
   - Crear `lib-overlay.mock.ts` si algún spec lo inyecta directo.

3. Actualizar `CLAUDE.md` — tabla "Tests — mocks compartidos":

| Fichero | Exporta | Uso |
|---|---|---|
| `lib-snackbar.mock.ts` | `mockLibSnackbar` | `{ provide: LibSnackbarService, useValue: mockLibSnackbar }` |
| `lib-dialog.mock.ts` | `mockLibDialog` | `{ provide: LibDialogService, useValue: mockLibDialog }` |
| `lib-bottom-sheet.mock.ts` | `mockLibBottomSheet` | `{ provide: LibBottomSheetService, useValue: mockLibBottomSheet }` |

(Y quitar las filas obsoletas si aún están: `MatDialog`, `MatSnackBar`.)

4. Actualizar `docs/LIB_COMPONENTS.md`:
   - Añadir entradas para todos los componentes nuevos (lib-icon, lib-snackbar, lib-tooltip, lib-menu, lib-tabs, lib-router-tabs, lib-overlay, lib-bottom-sheet, lib-dialog, lib-form-field, lib-input, lib-label, lib-error, lib-hint, lib-select, lib-option, lib-autocomplete, lib-datepicker).
   - Sección "Deuda a11y" listando los items declarados componente a componente para que sea visible y se cierre iterativamente.

5. `docs/TESTING.md`: re-ejecutar `/update-testing` para sincronizar.

6. `index.ts` de `lib/`: añadir todos los exports nuevos en orden alfabético.

**Criterios de aceptación**:
- 0 referencias Material en `*.spec.ts`.
- Cobertura ≥ 80% (umbral CI del proyecto).
- `docs/LIB_COMPONENTS.md` actualizado.
- `docs/TESTING.md` actualizado.
- `CLAUDE.md` tabla mocks actualizada.

##### Commit 38 — `docs(plan): cierre Fase 10 + PR ready`

**Objetivo**: documentar el cierre y preparar el PR único.

**Cambios**:

1. En `docs/TERMINAL_COLLECTOR_PLAN.md`, marcar Fase 10 como completada (añadir nota al inicio de la sección 7).

2. En `docs/LIB_COMPONENTS.md`, sección final "Estado": `100% de la app sin @angular/material. @angular/cdk conservado como dependencia justificada.`

3. Generar el PR con `/pr` siguiendo la convención del proyecto:
   - Título: `refactor(lib): reemplazo total de Angular Material por componentes propios`
   - Body: lista de bloques + checkpoints + decisiones (CDK conservado, Material Icons font conservada, datepicker desde cero o flatpickr según ejecución).

**Criterios de aceptación**:
- PR abierto contra `master`.
- CI verde (build + lint + test ≥ 80% coverage).
- Squash merge listo.

### 7.4 Mapa de checkpoints

| Checkpoint | Tras commit | Bloque | Qué revisar |
|---|---|---|---|
| A | 22 | Bloque 1 | Iconos, divisores, toggle €/% (orders detail). Sin regresión visual. |
| B | 24 | Bloque 2 | Snackbars de éxito/error en flujos típicos. Tooltips desktop. |
| C | 28 | Bloque 3 | Profile menu + context menu game-detail. Sale tabs + collection nav. Filtros bottom-sheet mobile. |
| D | 29 | Bloque 4 | Cada uno de los 7 dialogs. Focus trap, Escape, backdrop. **Checkpoint más crítico**. |
| E | 34 | Bloque 5 | game-form completo. add-edit-line dialog. Loan forms con fecha. CRUD entero funcional. |
| Final | 38 | Bloque 6 | PR único contra master. CI verde. |

### 7.5 Criterios de aceptación globales

- `package.json` sin `@angular/material` ni `@angular/animations`.
- `@angular/cdk` conservado (Overlay, a11y, portal, layout) — decisión documentada.
- `grep -rn "@angular/material" src/` → **0**.
- `grep -rn "<mat-" src/` → **0**.
- `grep -rn "MatDialog\|MatSnackBar\|MatSelect\|MatFormField\|MatAutocomplete\|MatDatepicker\|MatBottomSheet\|MatMenu\|MatTabs\|MatTooltip\|MatIcon" src/ --include="*.ts"` → **0**.
- Bundle size: -150KB gz aproximado.
- Visual: paridad con Fase 8 (terminal collector style consistente).
- Funcional: 100% paridad con flujos previos.
- A11y: la deuda declarada en cada componente está listada en `docs/LIB_COMPONENTS.md` para cierre iterativo.

### 7.6 Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| `lib-datepicker` desde cero es más caro de lo previsto | Media | Alto | Fallback documentado: flatpickr envuelto. Decisión en Commit 34. |
| `lib-autocomplete` no replica el `displayWith` bien | Media | Alto | Validar primero en game-form (el más complejo) antes de propagar al resto. |
| Focus trap CDK falla con `cdk-overlay-container` y body scroll lock | Baja | Medio | CDK Overlay maneja ambos via `scrollStrategy: 'block'`. Probado en Commit 29 (checkpoint D). |
| Specs DOM-asserted rompen masivamente | Alta | Bajo (sólo CI) | Se actualizan en cada commit que toca el componente. Commit 37 cierra la deuda. |
| Algún `aria-describedby` se pierde tras la migración | Media | Medio (a11y) | Aceptado por usuario como deuda. Documentado componente a componente. |
| Bundle inicial crece (CDK ya no es transitivo de Material) | Baja | Bajo | CDK ya está en deps (4 usos `cdk/layout`). No cambia. |
| Sale tabs sin animation rompe UX visual | Baja | Bajo | Aceptado por usuario — el plan general elimina animations. |

### 7.7 Notas operativas

- **Rama dedicada**: `refactor/lib-remove-material` desde `master` post-Fase 8 mergeada. Sin PRs intermedios.
- **Convención de commits del proyecto**: títulos en backticks (`feat(lib): ...`, `chore(deps): ...`, `docs(plan): ...`, `test(lib): ...`).
- **No tocar BD**: el refactor es 100% frontend.
- **No tocar service worker**: los cambios CSS se sirven con el bust de Angular normal.
- **i18n keys nuevas**: añadir a `src/assets/i18n/es.json` y `en.json` en el mismo commit que las usa. Claves esperadas: `common.notifications`, `common.close` (ya existe), `common.next`, `common.previous`, `common.today`, `lib.calendar.month.*`, `lib.calendar.weekday.*`.
- **Tests CI ≥ 80% cobertura**: cada commit que rompa cobertura debe restaurarla en el mismo commit (no en posteriores).
- **Build de producción**: verificar tamaño del bundle tras Commit 36. Comparar con baseline pre-Fase 10.

---

**Fin del plan.**

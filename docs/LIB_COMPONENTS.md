# Monchito Game Library — Componentes `lib/`

> Librería interna de primitivas UI con estética Terminal Collector.
> **Fuente de verdad** sobre la API, variantes y patrones de uso de cada componente.
>
> Ubicación: `src/app/presentation/components/lib/`
> Tipos: `src/app/entities/types/lib-component.type.ts`
> Barrel: `@/components/lib`

---

## Índice

- [1. Filosofía](#1-filosofía)
- [2. Cómo importar](#2-cómo-importar)
- [3. Reglas Terminal Collector](#3-reglas-terminal-collector)
- [4. Catálogo de componentes](#4-catálogo-de-componentes)
  - [4.1 `lib-button`](#41-lib-button)
  - [4.2 `lib-icon-button`](#42-lib-icon-button)
  - [4.3 `lib-card`](#43-lib-card)
  - [4.4 `lib-chip`](#44-lib-chip)
  - [4.5 `lib-badge`](#45-lib-badge)
  - [4.6 `lib-checkbox`](#46-lib-checkbox)
  - [4.7 `lib-data-row`](#47-lib-data-row)
  - [4.8 `lib-section-header`](#48-lib-section-header)
  - [4.9 `lib-command-bar`](#49-lib-command-bar)
  - [4.10 `lib-empty-state`](#410-lib-empty-state)
  - [4.11 `lib-spinner`](#411-lib-spinner)
  - [4.12 `lib-skeleton`](#412-lib-skeleton)
  - [4.13 `lib-icon`](#413-lib-icon)
  - [4.14 `lib-form-field`](#414-lib-form-field)
  - [4.15 `lib-select`](#415-lib-select)
  - [4.16 `lib-autocomplete`](#416-lib-autocomplete)
  - [4.17 `lib-datepicker`](#417-lib-datepicker)
  - [4.18 `lib-snackbar`](#418-lib-snackbar)
  - [4.19 `lib-tooltip`](#419-lib-tooltip)
  - [4.20 `lib-menu`](#420-lib-menu)
  - [4.21 `lib-tabs` + `lib-router-tabs`](#421-lib-tabs--lib-router-tabs)
  - [4.22 `lib-dialog`](#422-lib-dialog)
  - [4.23 `lib-bottom-sheet`](#423-lib-bottom-sheet)
  - [4.24 `lib-divider`](#424-lib-divider)
- [5. Servicios infraestructurales](#5-servicios-infraestructurales)
- [6. Resumen tabla](#6-resumen-tabla)
- [7. Cuándo no usar `lib/`](#7-cuándo-no-usar-lib)

---

## 1. Filosofía

`lib/` es la **capa de superficie** de la app. Angular Material queda relegado a tres roles:

1. **Motor de overlay invisible** — `MatDialog`, `MatSnackBar`, `MatTooltip`, `MatMenu`, `MatBottomSheet`. Servicios accesibles y probados; los reskinneamos vía CSS global sin sustituirlos.
2. **Form-field engine** — `MatFormField`, `MatInput`, `MatAutocomplete`, `MatSelect`, `MatDatepicker`. Reescritura de los slots vía variables `--mat-sys-*` en `styles.scss`. Los inputs siguen siendo Material para no perder la integración con `Validators`.
3. **Tipografía iconográfica** — `<mat-icon>` como font-set (Material Icons). Nunca como "componente UI Material".

Todo lo que **se renderiza con identidad visual** (botones, cards, chips, badges, indicators, controls) vive en `lib/`.

**Tres reglas inquebrantables**:

- Si una casuística no encaja en la API actual de un componente `lib`, **se amplía el componente** (input nuevo, slot nuevo). Nunca se deja la excepción con Material.
- **Cero `border-radius` decorativo** (sólo 1px-2px funcional si lo justifica el contraste).
- **Cero sombras, cero transforms en hover, cero auto-animaciones**.

> Los componentes ad-hoc previos (`SkeletonComponent`, `ToggleSwitchComponent`, `BadgeChipComponent`) se eliminaron en Fase 6 del rediseño Terminal Collector. La carpeta `presentation/components/ad-hoc/` ya no existe.

---

## 2. Cómo importar

Cada componente es `standalone`. Importar desde el barrel:

```typescript
import {
  LibButtonComponent,
  LibIconButtonComponent,
  LibCardComponent,
  LibChipComponent,
  LibBadgeComponent,
  LibCheckboxComponent,
  LibDataRowComponent,
  LibSectionHeaderComponent,
  LibCommandBarComponent,
  LibEmptyStateComponent,
  LibSpinnerComponent,
  LibSkeletonComponent
} from '@/components/lib';
```

Añadirlos al array `imports` del componente standalone consumidor.

---

## 3. Reglas Terminal Collector

Cualquier ampliación de un `lib-*` debe respetar:

| # | Regla | Consecuencia práctica |
|---|---|---|
| 1 | `border-radius: 0` por defecto | No introducir `--radius-*` nuevos. |
| 2 | Bordes 1px del color del variant | `border: 1px solid var(--color)` con `--color` como custom property local. |
| 3 | Transiciones de 120ms máx, sólo `color`/`border-color`/`background-color` | Nada de `transform`, `opacity`, `box-shadow`. |
| 4 | Tipografía `JetBrains Mono` uppercase | Salvo overrides puntuales para títulos de obra (sans). |
| 5 | Focus ring visible | `:focus-visible { outline: 1px solid var(--border-active); outline-offset: 2px; }`. |
| 6 | Touch target ≥ 44px en mobile | Forzado vía `@media (max-width: 768px)`. |
| 7 | `:host { display: contents }` cuando el componente envuelve un único `<button>` interactivo | Permite que `matTooltip`, `matMenuTriggerFor`, `matSuffix` aplicadas al host se proyecten correctamente sobre el button real. |

---

## 4. Catálogo de componentes

### 4.1 `lib-button`

Selector: `retro-button`
Botón textual con corchetes `[ LABEL ]` (pseudo-elementos en desktop, ocultos en mobile ≤768px).

**Cuándo usarlo**: cualquier CTA con texto. Submit de formularios, acciones de header, footer de dialogs.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto visible (auto-uppercase en pantalla). |
| `icon` | `string \| undefined` | `undefined` | Nombre Material Icons opcional, a la izquierda del label. |
| `variant` | `'primary' \| 'ghost' \| 'danger' \| 'success'` | `'ghost'` | Color del borde y texto. |
| `disabled` | `boolean` | `false` | Deshabilita interacción. Opacity 0.4. |
| `loading` | `boolean` | `false` | Muestra spinner Material `progress_activity` rotando y deshabilita el botón. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML nativo. |
| `fullWidth` | `boolean` | `false` | `width: 100%`. Útil en mobile y forms. |

**Outputs**

| Output | Tipo | Notas |
|---|---|---|
| `clicked` | `MouseEvent` | Solo emite si no está disabled ni en loading. |

**Ejemplo**

```html
<retro-button
  [label]="'common.save' | transloco"
  icon="save"
  variant="primary"
  type="submit"
  [loading]="saving()"
  [disabled]="form.invalid"
  (clicked)="onSave()" />
```

**A11y / notas**

- `<button>` HTML nativo, no wrapper. Reciben `disabled` real.
- Si tienes contenido custom (SVG inline, icon stack), usa la variante con `ng-content` (ver §4.1.1 — ampliación Fase 8).
- No usar para acciones puramente icónicas — para eso `lib-icon-button`.

#### 4.1.1 Slot `<ng-content>` para contenido custom (Fase 8)

Cuando el botón necesita un SVG inline o contenido custom (icono de marca OAuth), proyectar el contenido entre las tags del componente. El `label` sigue siendo requerido (usado como aria-label si no hay texto visible).

```html
<retro-button
  [label]="'auth.continueWithGoogle' | transloco"
  variant="ghost"
  [fullWidth]="true"
  (clicked)="onOAuthSignIn('google')">
  <svg viewBox="0 0 24 24" aria-hidden="true">...</svg>
</retro-button>
```

> El SVG proyectado se renderiza antes del label en el orden `[ <SVG> LABEL ]`. Si `icon` está definido junto a `<ng-content>`, gana el ng-content (precedencia explícita).

---

### 4.2 `lib-icon-button`

Selector: `retro-icon-button`
Botón icónico cuadrado, 32/40/44px, sin label visible.

**Cuándo usarlo**: kebabs, back buttons, header actions, row actions, toggles standalone. Cualquier acción cuyo único contenido sea un `<mat-icon>`.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `icon` | `string` (required) | — | Nombre Material Icons. |
| `ariaLabel` | `string` (required) | — | Label accesible obligatorio. |
| `variant` | `'primary' \| 'ghost' \| 'danger'` | `'ghost'` | Color del icono. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 32 / 40 / 44px (en mobile siempre ≥ 44px). |
| `disabled` | `boolean` | `false` | Opacity 0.4. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML nativo. |

**Outputs**

| Output | Tipo | Notas |
|---|---|---|
| `clicked` | `MouseEvent` | Solo emite si no está disabled. |

**Patrón con directivas Material (matTooltip / matMenuTriggerFor / matSuffix)**

El SCSS aplica `:host { display: contents }`, lo que permite que las directivas aplicadas al wrapper se proyecten sobre el `<button>` interno:

```html
<!-- Tooltip -->
<retro-icon-button
  icon="edit"
  [ariaLabel]="'common.edit' | transloco"
  [matTooltip]="'common.edit' | transloco"
  (clicked)="onEdit()" />

<!-- Trigger de menú -->
<retro-icon-button
  icon="more_vert"
  [ariaLabel]="'common.more' | transloco"
  [matMenuTriggerFor]="contextMenu"
  (clicked)="$event.stopPropagation()" />

<!-- Slot de form-field (Fase 8 — viable, ver §4.2.1) -->
<mat-form-field appearance="outline">
  <input matInput [type]="hidden() ? 'password' : 'text'" formControlName="password" />
  <retro-icon-button
    matSuffix
    [icon]="hidden() ? 'visibility' : 'visibility_off'"
    [ariaLabel]="(hidden() ? 'auth.showPassword' : 'auth.hidePassword') | transloco"
    (clicked)="toggleVisibility()" />
</mat-form-field>
```

#### 4.2.1 Uso como `matSuffix` (Fase 8)

Material proyecta el suffix vía `<ng-content select="[matSuffix], [matIconSuffix]">`. La directiva `[matSuffix]` se aplica al **host** del componente, que actúa como ancla para el slot. Como el SCSS usa `display: contents`, el `<button>` interno queda directamente dentro de `.mat-mdc-form-field-icon-suffix` y Material puede alinearlo verticalmente.

> **Restricción**: el `<retro-icon-button matSuffix>` queda dentro del flujo del form-field. No combinarlo con `[hideClearButton]` ni otras directivas custom de form-field. Si el botón se solapa con el outline del input por alineación, revisar el SCSS local del componente consumidor (en el 99% de los casos no hace falta tocar nada).

**A11y / notas**

- `ariaLabel` siempre requerido — el componente no tiene texto visible.
- `:host { display: contents }` significa que el host no genera box propio. Si se aplican estilos al host externamente (ej. `retro-icon-button { margin: 0 1rem }`), no funcionan. Aplicar márgenes a un wrapper padre.

---

### 4.3 `lib-card`

Selector: `retro-card`
Contenedor rectangular plano para agrupar contenido.

**Cuándo usarlo**: card de listado (game-card, hardware-card), bloque de settings, contenedor de información agrupada.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Activa `role=button`, `tabindex=0`, hover y focus ring. |
| `padded` | `boolean` | `true` | Padding interno 1rem + gap entre hijos 0.75rem. Poner `false` para layouts custom. |
| `variant` | `'default' \| 'accent' \| 'muted'` | `'default'` | Color del borde / fondo. |

**Outputs**

| Output | Tipo | Notas |
|---|---|---|
| `cardClicked` | `MouseEvent` | Sólo emite si `interactive=true`. Dispara también con `Enter` y `Space`. |

**Slots**

- `<ng-content>` único — proyecta todo el contenido como hijos directos.

**Ejemplo**

```html
<retro-card [interactive]="true" (cardClicked)="onOpen(game)">
  <h3>{{ game.title }}</h3>
  <retro-data-row label="PLATFORM" [value]="game.platform" />
</retro-card>
```

**Notas**

- No tiene "subcomponentes" tipo `mat-card-title`/`mat-card-content`. Para títulos usar `<h2>`/`<h3>` con clase local.
- Si necesitas más de un slot semántico, considera ampliar a `<ng-content select="[slot=header]">` (no se ha hecho aún — esperar a que aparezca el caso).

---

### 4.4 `lib-chip`

Selector: `retro-chip`
Etiqueta inline con color semántico. Mono uppercase, borde 1px.

**Cuándo usarlo**: tags de plataforma, edición, estado en card. Filtros activos en chip-row de listados.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto del chip (auto-uppercase). |
| `icon` | `string \| undefined` | `undefined` | Icono Material a la izquierda. |
| `color` | `'primary' \| 'green' \| 'amber' \| 'rose' \| 'blue' \| 'neutral'` | `'neutral'` | Color semántico. |
| `filled` | `boolean` | `false` | Fondo sólido del color + texto `--bg-void`. Para overlays hero (cover de cards). |
| `closable` | `boolean` | `false` | Muestra botón X y permite emitir `closed`. |

**Outputs**

| Output | Tipo | Notas |
|---|---|---|
| `closed` | `void` | Sólo emite si `closable=true`. `stopPropagation` aplicado internamente. |

**Ejemplo**

```html
<retro-chip label="PS5" color="primary" />
<retro-chip label="DIGITAL" color="blue" icon="cloud" />
<retro-chip label="FOR_SALE" color="amber" [filled]="true" />

<!-- Chip de filtro activo -->
<retro-chip
  [label]="'filters.favorites' | transloco"
  color="primary"
  [closable]="true"
  (closed)="clearFavoritesFilter()" />
```

**Notas**

- No es interactivo por defecto. Si necesitas un chip-button (toggle), envuelve en `<button>` con clase local o pedir nueva API.
- `closable` añade un button interno con `aria-label="Eliminar filtro"` hardcodeado en español — pendiente i18n si crece el uso fuera de la filter-bar.

---

### 4.5 `lib-badge`

Selector: `retro-badge`
Contador o indicador de estado pequeño.

**Cuándo usarlo**: contadores numéricos junto a un icono (notificaciones, count en section-header), indicador de estado puntual (dot).

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string \| number` (required) | — | Valor mostrado. Si `dot=true`, se ignora. |
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'neutral'` | Color. |
| `dot` | `boolean` | `false` | Renderiza sólo un punto de color (sin label). |

**Ejemplo**

```html
<retro-badge [label]="unreadCount()" variant="danger" />
<retro-badge label="" variant="success" [dot]="true" />
```

**vs. `lib-chip`**: usar `badge` para 1-3 caracteres pequeños / dot; usar `chip` para tags con label legible.

---

### 4.6 `lib-checkbox`

Selector: `retro-checkbox`
Toggle `[X]` / `[ ]` mono. Implementa `ControlValueAccessor`.

**Cuándo usarlo**: checkboxes de formularios reactivos, switches binarios en filtros, toggles de settings.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `checked` | `boolean` | `false` | Estado inicial. **Solo activo en modo standalone**. Ignorado si hay `formControlName`. |
| `label` | `string \| undefined` | `undefined` | Texto a la derecha del control (auto-uppercase). |
| `size` | `'sm' \| 'md'` | `'md'` | Glyph 0.875rem / 1rem. |
| `disabled` | `boolean` | `false` | Solo activo en modo standalone (CVA usa `setDisabledState`). |

**Outputs**

| Output | Tipo | Notas |
|---|---|---|
| `changed` | `boolean` | Emite el nuevo valor tras cada toggle. |

**Modo standalone**

```html
<retro-checkbox
  [checked]="onlyFavorites()"
  label="Solo favoritos"
  (changed)="onlyFavorites.set($event)" />
```

**Modo formulario reactivo**

```html
<retro-checkbox formControlName="forSale" label="EN VENTA" />
<retro-checkbox formControlName="is_favorite" />
```

En modo CVA, `[checked]` y `[disabled]` son ignorados.

**Notas**

- Reemplaza el antiguo `app-toggle-switch` (eliminado en Fase 6). Mismo contrato `(changed)` + CVA, distinto patrón visual (`[X]/[ ]` vs pildora con thumb).
- `role="switch"` + `aria-checked` para a11y.
- Sin animación de transición — cambio entre `[X]` y `[ ]` en frame único (regla 3 Terminal Collector).

---

### 4.7 `lib-data-row`

Selector: `retro-data-row`
Fila estilo `ls -la` con label izquierda + dots + value derecha.

**Cuándo usarlo**: detalles de un juego, hardware, copia, order. Listas de pares clave-valor en game-detail, hardware-detail.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Etiqueta izquierda (auto-uppercase). |
| `value` | `string \| number \| null` | `null` | Valor derecha. Si `null`, usa `<ng-content>`. |
| `icon` | `string \| undefined` | `undefined` | Icono Material junto al label. |
| `emphasized` | `boolean` | `false` | Valor en peso mayor (énfasis). |

**Slots**

- `<ng-content>` cuando `value=null` (para chips, estrellas, JSX complejo).

**Ejemplo**

```html
<retro-data-row label="PLATFORM" [value]="game.platform" icon="videogame_asset" />
<retro-data-row label="CONDITION" [emphasized]="true" [value]="game.condition" />

<!-- Valor complejo -->
<retro-data-row label="RATING">
  <app-rating-stars [value]="game.rating" />
</retro-data-row>
```

**Notas**

- Estructura semántica `<dt>` + `<dd>`. Envolver en `<dl>` si hay varios — el componente NO añade el `<dl>` automáticamente.

---

### 4.8 `lib-section-header`

Selector: `retro-section-header`
Cabecera `> SECTION_NAME [count]` con borde inferior 1px.

**Cuándo usarlo**: divisores semánticos dentro de una página (sección "GAMES", "HARDWARE", etc.).

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto de la sección (auto-uppercase). |
| `count` | `number \| string \| null` | `null` | Contador opcional mostrado entre `[N]`. |

**Slots**

- `<ng-content select="[slot=actions]">` — botones a la derecha.

**Ejemplo**

```html
<retro-section-header label="GAMES" [count]="games().length">
  <retro-button slot="actions" label="ADD" icon="add" variant="primary" />
</retro-section-header>
```

---

### 4.9 `lib-command-bar`

Selector: `retro-command-bar`
Barra decorativa de prompt terminal `path $ --flag1 --flag2 ▋`.

**Cuándo usarlo**: encabezado decorativo de listas (games-list, hardware-list). Solo visible en desktop ≥1024px.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `path` | `string` | `'monchito ~/library'` | Ruta mostrada antes del `$`. |
| `flags` | `readonly string[]` | `[]` | Flags activos mostrados como `--flag`. |
| `cursor` | `boolean` | `true` | Cursor parpadeante al final. |

**Ejemplo**

```html
<retro-command-bar
  path="monchito ~/library/games"
  [flags]="activeFilterFlags()" />
```

**Notas**

- `aria-hidden="true"` — puramente decorativo.
- Oculto en mobile/tablet via CSS. No emite eventos.

---

### 4.10 `lib-empty-state`

Selector: `retro-empty-state`
Estado vacío con bloque ASCII + título + hint mono.

**Cuándo usarlo**: listas sin resultados, búsqueda sin matches, secciones vacías.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `title` | `string` (required) | — | Título principal (auto-uppercase). |
| `subtitle` | `string` | `''` | Descripción adicional opcional. |
| `hint` | `string` | `'$ try a different query'` | Hint en estilo prompt. |

**Slots**

- `<ng-content>` — botones de acción (típicamente un `retro-button`).

**Ejemplo**

```html
<retro-empty-state
  [title]="'games.empty.title' | transloco"
  [subtitle]="'games.empty.subtitle' | transloco"
  [hint]="'$ add your first game'">
  <retro-button [label]="'games.add' | transloco" icon="add" variant="primary" (clicked)="onAdd()" />
</retro-empty-state>
```

---

### 4.11 `lib-spinner`

Selector: `retro-spinner`
Spinner ASCII (`|/-\`, `...`, `▖▘▝▗`) sin Material.

**Cuándo usarlo**: indicador de loading inline o en bloque. Reemplaza `mat-spinner`.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `'inline' \| 'sm' \| 'md' \| 'lg'` | `'md'` | `inline` (1ch, dentro de un botón), `sm` (18-20px), `md` (40-48px), `lg` (80px). |
| `variant` | `'bars' \| 'dots' \| 'blocks'` | `'bars'` | Tipo de glyph animado. |
| `ariaLabel` | `string` | `'Loading'` | Texto accesible. |

**Ejemplo**

```html
<retro-spinner size="md" variant="bars" [ariaLabel]="'common.loading' | transloco" />
```

**Notas**

- `role="status"` para a11y.
- En `prefers-reduced-motion: reduce`, muestra un frame estático.

---

### 4.12 `lib-skeleton`

Selector: `retro-skeleton`
Bloque rectangular con shimmer mientras carga contenido.

**Cuándo usarlo**: placeholders de cards, listas, avatares y textos mientras se hace fetch.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `width` | `string` | `'100%'` | Ancho CSS. |
| `height` | `string` | `'1rem'` | Alto CSS. |
| `shape` | `'line' \| 'square' \| 'block'` | `'line'` | Alias semántico — **no altera la geometría** (siempre rectángulo plano). |

**Ejemplo**

```html
<retro-skeleton width="200px" height="1rem" />
<retro-skeleton width="40px" height="40px" shape="square" />
<retro-skeleton width="100%" height="120px" shape="block" />
```

**Notas**

- A diferencia del legacy `app-skeleton`, **no acepta `borderRadius`** — todas las skeletons son rectángulos planos (regla 1 Terminal Collector).
- `role="status"` + `aria-busy="true"` + `aria-live="polite"`.
- Animación shimmer `--bg-surface` → `--bg-surface-hi` → `--bg-surface`, 1.4s lineal. Se detiene en frame plano con `prefers-reduced-motion`.

---

### 4.13 `lib-icon`

Selector: `retro-icon`
Renderiza un icono de la webfont Material Icons.

**Cuándo usarlo**: iconos decorativos en cualquier componente. Reemplaza el uso directo de `<mat-icon>` en el DOM de la aplicación.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `name` | `string` (required) | — | Nombre del icono Material Icons (ej. `add`, `edit`, `delete`). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Tamaño del icono. |
| `ariaHidden` | `boolean` | `true` | Si `true`, aplica `aria-hidden="true"`. Poner `false` solo si el icono porta significado semántico sin texto alternativo. |

**Nota**: requiere que la webfont "Material Icons" esté cargada en `index.html`.

**Ejemplo**

```html
<retro-icon name="save" size="md" />
<retro-icon name="warning" size="lg" [ariaHidden]="false" />
```

---

### 4.14 `lib-form-field`

Selector: `retro-form-field`
Contenedor de campo de formulario con label fijo (sin floating), mensaje de error y hint. Alternativa Terminal Collector a `<mat-form-field>`.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Texto del label. |
| `error` | `string \| null` | `null` | Mensaje de error visible cuando no es null. |
| `hint` | `string` | `''` | Texto de ayuda bajo el campo. |
| `required` | `boolean` | `false` | Añade asterisco al label. |

**Junto a**

- `LibInputDirective` (selector: `[retroInput]`) — aplica estilos al `<input>` o `<textarea>` interno.
- `LibLabelComponent` — label independiente si se necesita desacoplar.
- `LibErrorComponent` — bloque de error reutilizable fuera de un form-field.
- `LibHintComponent` — hint reutilizable fuera de un form-field.

**Ejemplo**

```html
<retro-form-field label="TÍTULO" [error]="form.controls.title.errors ? 'Campo requerido' : null">
  <input retroInput formControlName="title" />
</retro-form-field>
```

---

### 4.15 `lib-select`

Selector: `retro-select`
Combobox accesible con ControlValueAccessor. Alternativa Terminal Collector a `<mat-select>`.

**Inputs**

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `options` | `LibSelectOption[]` | `[]` | Lista de opciones `{ value, label }`. |
| `placeholder` | `string` | `''` | Texto cuando no hay selección. |
| `multiple` | `boolean` | `false` | Permite selección múltiple. |

**Junto a**

- `LibOptionComponent` — opción individual para uso con `<ng-content>` cuando se necesita contenido rico.

**Ejemplo**

```html
<retro-select
  formControlName="platform"
  [options]="platformOptions"
  placeholder="SELECCIONAR PLATAFORMA" />
```

---

### 4.16 `lib-autocomplete`

Selector: `retro-autocomplete`
Panel de sugerencias construido sobre CDK Overlay.

**Outputs**

| Output | Tipo | Notas |
|---|---|---|
| `optionSelected` | `LibSelectOption` | Emite la opción elegida por el usuario. |

**Junto a**

- `LibAutocompleteTriggerDirective` (selector: `[retroAutocompleteTrigger]`) — conecta el `<input>` con el panel. Recibe la referencia al componente panel mediante `[retroAutocompleteTrigger]="autocompleteRef"`.

**Ejemplo**

```html
<input retroInput [retroAutocompleteTrigger]="ac" formControlName="search" />
<retro-autocomplete #ac [options]="suggestions()" (optionSelected)="onSelect($event)" />
```

---

### 4.17 `lib-datepicker`

Selector: `retro-datepicker`
Calendario completo con patrón APG (ARIA Authoring Practices Guide), locale `es-ES`.

**Junto a**

- `LibDatepickerDirective` (selector: `[retroDatepicker]`) — conecta el `<input>` con el calendario. Recibe la referencia al componente mediante `[retroDatepicker]="datepickerRef"`.
- `LibDatepickerToggleDirective` (selector: `[retroDatepickerToggle]`) — botón icónico que abre/cierra el calendario. Recibe la misma referencia.

**Ejemplo**

```html
<input retroInput [retroDatepicker]="dp" formControlName="releaseDate" />
<button [retroDatepickerToggle]="dp" aria-label="Abrir calendario"></button>
<retro-datepicker #dp />
```

---

### 4.18 `lib-snackbar`

No es un componente standalone de plantilla sino un **servicio singleton**.

**Uso**: `inject(LibSnackbarService).open({ text, variant, duration })`

| Parámetro | Tipo | Default | Descripción |
|---|---|---|---|
| `text` | `string` (required) | — | Mensaje mostrado. |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Color semántico. |
| `duration` | `number` | `4000` | Milisegundos antes del auto-dismiss. |

**Junto a**

- `LibSnackbarHostComponent` — contenedor que gestiona la cola de toasts. **Debe montarse una sola vez** en `app.component.html`.

**Notas**

- Cola FIFO: si hay un snackbar activo, el siguiente espera a que se cierre.
- El usuario puede cerrar manualmente con el botón `×`.

**Ejemplo**

```typescript
// En el componente
private readonly _snackbar: LibSnackbarService = inject(LibSnackbarService);

this._snackbar.open({ text: 'Guardado correctamente', variant: 'success' });
```

```html
<!-- app.component.html -->
<retro-snackbar-host />
```

---

### 4.19 `lib-tooltip`

No es un componente sino una **directiva DOM nativa**.

Selector: `[retroTooltip]`

**Cuándo usarlo**: tooltips informativos en elementos desktop. La directiva es inactiva en dispositivos táctiles (sin hover real).

**Notas**

- Solo activo en desktop / hover. En táctil no se muestra nada.
- Implementado sobre posicionamiento nativo sin CDK para mantener el bundle reducido.

**Ejemplo**

```html
<retro-icon-button
  icon="info"
  ariaLabel="Información"
  [retroTooltip]="'Ver detalles del estado'" />
```

---

### 4.20 `lib-menu`

Selector: `retro-menu`
Panel de menú contextual construido sobre CDK Overlay con navegación por teclado completa.

**Junto a**

- `LibMenuItemComponent` — ítem individual del menú. Acepta `label`, `icon` y `disabled`.
- `LibMenuTriggerDirective` (selector: `[retroMenuTriggerFor]`) — conecta el elemento trigger con el panel. Recibe la referencia al componente mediante `[retroMenuTriggerFor]="menuRef"`.

**Ejemplo**

```html
<retro-icon-button
  icon="more_vert"
  ariaLabel="Más opciones"
  [retroMenuTriggerFor]="contextMenu" />

<retro-menu #contextMenu>
  <retro-menu-item label="EDITAR" icon="edit" (clicked)="onEdit()" />
  <retro-menu-item label="ELIMINAR" icon="delete" [disabled]="!canDelete()" (clicked)="onDelete()" />
</retro-menu>
```

---

### 4.21 `lib-tabs` + `lib-router-tabs`

**`lib-tabs`** — Selector: `retro-tabs`
Tablist ARIA con roving tabindex para tabs sin ruta.

**`lib-router-tabs`** — Selector: `retro-router-tabs`
Navegación por tabs con `routerLink` y `aria-current="page"` para tabs ligadas a rutas.

**Ejemplo**

```html
<!-- Tabs sin ruta -->
<retro-tabs [tabs]="tabs" [(activeTab)]="activeTab" />

<!-- Tabs con ruta -->
<retro-router-tabs [tabs]="routerTabs" />
```

---

### 4.22 `lib-dialog`

No es un componente standalone de plantilla sino un **servicio sobre `LibOverlayService`**.

**Uso**: `inject(LibDialogService).open(Component, { data })`

**Directivas de contenido** (aplicar al template del componente que se proyecta en el dialog):

| Directiva | Descripción |
|---|---|
| `retroDialogTitle` | Cabecera del dialog. |
| `retroDialogContent` | Cuerpo scrolleable. |
| `retroDialogActions` | Pie con botones de acción. |
| `retroDialogClose` | Botón que cierra el dialog al hacer click. |

**Tokens de inyección**

| Token | Descripción |
|---|---|
| `LIB_DIALOG_DATA` | Datos tipados pasados al `open()`. Inyectar con `inject(LIB_DIALOG_DATA)`. |
| `LibDialogRef` | Referencia al dialog para cerrarlo programáticamente con `.close(result)`. |

**Ejemplo**

```typescript
// Abrir
inject(LibDialogService).open(ConfirmDialogComponent, { data: { message: '...' } });

// Dentro del componente del dialog
private readonly _data = inject(LIB_DIALOG_DATA);
private readonly _dialogRef: LibDialogRef = inject(LibDialogRef);

onConfirm(): void {
  this._dialogRef.close(true);
}
```

---

### 4.23 `lib-bottom-sheet`

No es un componente standalone de plantilla sino un **servicio sobre `LibOverlayService`**.

**Uso**: `inject(LibBottomSheetService).open(Component, data)`

**Tokens de inyección**

| Token | Descripción |
|---|---|
| `LIB_BOTTOM_SHEET_DATA` | Datos tipados pasados al `open()`. Inyectar con `inject(LIB_BOTTOM_SHEET_DATA)`. |
| `LibBottomSheetRef` | Referencia para cerrar el bottom-sheet con `.close(result)`. |

**Ejemplo**

```typescript
// Abrir
inject(LibBottomSheetService).open(FiltersSheetComponent, filtersData);

// Dentro del componente del bottom-sheet
private readonly _data = inject(LIB_BOTTOM_SHEET_DATA);
private readonly _sheetRef: LibBottomSheetRef = inject(LibBottomSheetRef);

onApply(): void {
  this._sheetRef.close(this._filters);
}
```

---

### 4.24 `lib-divider`

No es un componente Angular sino una **clase CSS utilitaria**.

**Uso**: `<hr class="lib-divider">`

**Notas**

- Renderiza una línea horizontal de 1px con `--border-subtle`.
- Sin márgenes propios — el espaciado lo gestiona el componente padre.
- No usar `<mat-divider>` ni `<hr>` sin clase — siempre `class="lib-divider"` para mantener la consistencia visual Terminal Collector.

---

## 5. Servicios infraestructurales

### `LibOverlayService`

Engine base sobre el que se construyen los servicios de alto nivel: `LibDialogService`, `LibBottomSheetService`, `LibMenuTriggerDirective`, `LibSelectComponent`, `LibAutocompleteComponent` y `LibDatepickerComponent`.

Gestiona el ciclo de vida del CDK Overlay (crear portal, posicionar, destruir) y aplica las animaciones de entrada/salida Terminal Collector.

> **No usar `LibOverlayService` directamente en componentes de aplicación.** Usar siempre los servicios de alto nivel (`LibDialogService`, `LibBottomSheetService`) o las directivas trigger (`libMenuTriggerFor`, `libAutocompleteTrigger`, `libDatepicker`).

---

## 6. Resumen tabla

| Componente / Servicio | Selector / API | Slot (`<ng-content>`) | Output principal | Variantes / Notas |
|---|---|---|---|---|
| `lib-button` | `retro-button` | sí (Fase 8) | `clicked` | `primary` / `ghost` / `danger` / `success` |
| `lib-icon-button` | `retro-icon-button` | no | `clicked` | `primary` / `ghost` / `danger` × `sm` / `md` / `lg` |
| `lib-card` | `retro-card` | sí (único) | `cardClicked` | `default` / `accent` / `muted` |
| `lib-chip` | `retro-chip` | no | `closed` | 6 colores × `filled?` |
| `lib-badge` | `retro-badge` | no | — | 6 variants × `dot?` |
| `lib-checkbox` | `retro-checkbox` | no | `changed` (+ CVA) | `sm` / `md` |
| `lib-data-row` | `retro-data-row` | sí (sustituto de `value`) | — | `emphasized?` |
| `lib-section-header` | `retro-section-header` | sí (`[slot=actions]`) | — | — |
| `lib-command-bar` | `retro-command-bar` | no | — | — |
| `lib-empty-state` | `retro-empty-state` | sí | — | — |
| `lib-spinner` | `retro-spinner` | no | — | 4 tamaños × 3 glyphs |
| `lib-skeleton` | `retro-skeleton` | no | — | — |
| `lib-icon` | `retro-icon` | no | — | `sm` / `md` / `lg` |
| `lib-form-field` | `retro-form-field` | sí (`<input retroInput>`) | — | + `LibInputDirective`, `LibLabelComponent`, `LibErrorComponent`, `LibHintComponent` |
| `lib-select` | `retro-select` | no (CVA) | — | `multiple?` + `LibOptionComponent` |
| `lib-autocomplete` | `retro-autocomplete` + `[retroAutocompleteTrigger]` | no | `optionSelected` | — |
| `lib-datepicker` | `retro-datepicker` + `[retroDatepicker]` + `[retroDatepickerToggle]` | no | — | locale `es-ES`, patrón APG |
| `lib-snackbar` | `LibSnackbarService.open()` + `retro-snackbar-host` | — | — | `info` / `success` / `warning` / `danger`, cola FIFO |
| `lib-tooltip` | `[retroTooltip]` (directiva) | — | — | Solo desktop/hover |
| `lib-menu` | `retro-menu` + `[retroMenuTriggerFor]` | sí (`LibMenuItemComponent`) | — | + `LibMenuItemComponent` |
| `lib-tabs` | `retro-tabs` | no | — | roving tabindex |
| `lib-router-tabs` | `retro-router-tabs` | no | — | `routerLink` + `aria-current="page"` |
| `lib-dialog` | `LibDialogService.open()` | — | — | `LIB_DIALOG_DATA`, `LibDialogRef`, directivas de contenido |
| `lib-bottom-sheet` | `LibBottomSheetService.open()` | — | — | `LIB_BOTTOM_SHEET_DATA`, `LibBottomSheetRef` |
| `lib-divider` | `.lib-divider` (clase CSS en `<hr>`) | — | — | — |

---

## 7. Cuándo no usar `lib/`

Los siguientes patrones quedan deliberadamente **fuera** del scope de `lib/`:

- **Componentes específicos de una page** (e.g. `app-game-card`, `app-order-summary-card`, `app-rating-stars`). Estos consumen los `lib-*` pero viven en `pages/<route>/components/`.
- **Dialogs concretos** (`app-confirm-dialog`, `app-wishlist-item-dialog`). Son componentes de aplicación que se abren con `LibDialogService` pero contienen lógica/copy específicos de un caso de uso.

Si te encuentras escribiendo un componente que crees que debería ser `lib-*`, antes pregunta:

1. ¿Aparece en más de 2 pages distintas? Si no → no es `lib`.
2. ¿Tiene API estable (inputs/outputs no acoplados a un dominio)? Si no → no es `lib`.
3. ¿Encaja en la estética Terminal Collector (border 1px, no shadows, mono uppercase)? Si no → no es `lib`.

---

**Fin de la documentación.**

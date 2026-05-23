# retro-list

Familia de componentes para listas Terminal Collector. `retro-list` es el contenedor padre obligatorio; `retro-list-item` es la fila hija que solo funciona dentro de él.

---

## RetroListComponent

Contenedor de solo layout: apila sus hijos en columna con un `gap` configurable. No gestiona estados (loading, vacío, error) — eso es responsabilidad del consumidor mediante `@if`/`@for`.

- **Selector:** `retro-list`
- **Standalone:** sí

### Inputs

Ninguno.

### Outputs

Ninguno.

### Slots

| Slot    | Descripción                                          |
| ------- | ---------------------------------------------------- |
| Default | Ítems de la lista (típicamente `<retro-list-item>`). |

### CSS custom properties

| Propiedad          | Default  | Descripción                        |
| ------------------ | -------- | ---------------------------------- |
| `--retro-list-gap` | `0.5rem` | Espaciado entre ítems de la lista. |

---

## RetroListItemComponent

Fila de lista Terminal Collector. Layout horizontal leading | cuerpo | trailing. Borde 1px, fondo `--bg-surface`, sin border-radius.

> **Requisito:** debe usarse siempre dentro de un `<retro-list>`. Usarlo sin padre lanza un error en runtime.

- **Selector:** `retro-list-item`
- **Standalone:** sí

### Inputs

| Nombre        | Tipo                               | Default     | Descripción                                                                                                                                       |
| ------------- | ---------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive` | `boolean`                          | `false`     | Activa comportamiento de fila clicable (role=button, hover, focus). Emite `itemClicked` al hacer clic, Enter o Space.                             |
| `hoverable`   | `boolean`                          | `false`     | Activa hover de `border-color` sin requerir `interactive`. Anulado por `disabled=true`. No añade `role` ni emite clicks.                          |
| `disabled`    | `boolean`                          | `false`     | Marca la fila como deshabilitada: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`. Bloquea `itemClicked` aunque `interactive=true`. |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg'`   | `'sm'`      | Padding interno. none=0, sm=0.5/0.75rem, md=0.75/1rem, lg=1/1.25rem.                                                                              |
| `selected`    | `boolean`                          | `false`     | Estado visual de selección (box-shadow inset 2px `--border-active` + fondo `--bg-surface-hi`).                                                    |
| `variant`     | `'default' \| 'accent' \| 'muted'` | `'default'` | Variante visual. `accent` colorea el borde con `--primary`. `muted` hace el fondo transparente.                                                   |
| `staggered`   | `boolean`                          | `false`     | Activa animación de entrada escalonada. El consumidor asigna `[style.--i]="index"` en el `@for`. Respeta `prefers-reduced-motion`.                |

### Outputs

| Nombre        | Tipo         | Descripción                                                  |
| ------------- | ------------ | ------------------------------------------------------------ |
| `itemClicked` | `MouseEvent` | Click/Enter/Space cuando `interactive=true` y no `disabled`. |

### Slots / ng-content

| Selector                  | Descripción                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `[retroListItemLeading]`  | Columna izquierda: avatar, icono, checkbox. Se oculta automáticamente si está vacía. |
| _(default)_               | Cuerpo principal: título, subtítulo, metadatos.                                      |
| `[retroListItemTrailing]` | Columna derecha: acción, badge, chevron. Se oculta automáticamente si está vacía.    |

### CSS custom properties

| Variable                         | Default                | Descripción                                                 |
| -------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `--retro-list-item-hover-border` | `var(--border-active)` | Color de borde en hover cuando `hoverable` o `interactive`. |

### Types

Definidos en `retro-list-item.types.ts`:

- `RetroListItemVariant` — `'default' | 'accent' | 'muted'`
- `RetroListItemPadding` — `'none' | 'sm' | 'md' | 'lg'`

---

## Ejemplos

### Lista básica con animación escalonada

```html
<retro-list>
  @for (game of games(); track game.id; let i = $index) {
  <retro-list-item [interactive]="true" [staggered]="true" [style.--i]="i" (itemClicked)="onSelect(game)">
    <img retroListItemLeading [src]="game.coverUrl" alt="" />
    <strong>{{ game.title }}</strong>
    <span>{{ game.platform }}</span>
    <retro-badge retroListItemTrailing [label]="game.status" />
  </retro-list-item>
  }
</retro-list>
```

### Manejo de estados externo

```html
@if (loading()) {
<retro-spinner />
} @else if (items().length === 0) {
<retro-empty-state title="Sin resultados" />
} @else {
<retro-list>
  @for (it of items(); track it.id) {
  <retro-list-item>{{ it.label }}</retro-list-item>
  }
</retro-list>
}
```

---

## ⚠️ Trailing interactivo dentro de un item `interactive`

Cuando un `<retro-list-item [interactive]="true">` contiene un elemento clicable en el slot `[retroListItemTrailing]` (botón, icon-button, enlace…), los eventos de teclado **burbujean** hacia el item. Si el usuario hace foco en el botón del trailing y pulsa `Enter` o `Space`, se dispara tanto el click del botón como el `itemClicked` del item.

Para evitarlo, envuelve el contenido del trailing en un `<div>` que corte la propagación:

```html
<div
  retroListItemTrailing
  (click)="$event.stopPropagation()"
  (keydown.enter)="$event.stopPropagation()"
  (keydown.space)="$event.stopPropagation()">
  <retro-icon-button icon="delete" (clicked)="onDelete($event)" />
</div>
```

> El click del botón sigue llegando al handler de `onDelete` con normalidad. Solo se corta el burbujeo que activaría también `itemClicked`.

---

## Contrato padre-hijo

`RetroListComponent` se auto-provee bajo el token interno `RETRO_LIST_PARENT` (no expuesto en la API pública). `RetroListItemComponent` lo requiere en el constructor — si no lo encuentra, lanza:

> RetroListItemComponent must be used inside a \<retro-list\> container.

Este mecanismo permite en el futuro exponer configuración compartida (densidad, padding por defecto) sin cambiar la API externa.

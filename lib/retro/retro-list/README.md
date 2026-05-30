# retro-list

Familia de componentes para listas Terminal Collector. `retro-list` es el contenedor padre obligatorio; `retro-list-item` es la fila hija que solo funciona dentro de él.

**Selector:** `retro-list` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita una lista de filas con layout homogéneo (título, metadatos, acciones) en estilo terminal.
- NO usar cuando: los datos son tabulares con columnas fijas y cabeceras — en ese caso usar una tabla HTML semántica.

## Slots

| Selector    | Tipo esperado                         | Descripción                                       |
| ----------- | ------------------------------------- | ------------------------------------------------- |
| _(default)_ | `retro-list-item` u otro bloque libre | Ítems de la lista. Típicamente `retro-list-item`. |

## Tokens CSS expuestos

| Variable           | Default  | Descripción                        |
| ------------------ | -------- | ---------------------------------- |
| `--retro-list-gap` | `0.5rem` | Espaciado entre ítems de la lista. |

## Ejemplo mínimo

```html
<retro-list>
  @for (game of games(); track game.id; let i = $index) {
  <retro-list-item [interactive]="true" [staggered]="true" [style.--i]="i" (itemClicked)="onSelect(game)">
    <strong>{{ game.title }}</strong>
  </retro-list-item>
  }
</retro-list>
```

## Contrato padre-hijo

`RetroListComponent` se auto-provee bajo el token interno `RETRO_LIST_PARENT`. `RetroListItemComponent` lo requiere en el constructor — si no lo encuentra, lanza:

> RetroListItemComponent must be used inside a \<retro-list\> container.

Este mecanismo permite en el futuro exponer configuración compartida (densidad, padding por defecto) sin cambiar la API externa.

## Gotchas

- `retro-list` no gestiona estados (loading, vacío, error). El consumidor los maneja externamente con `@if`/`@for` y componentes como `retro-empty-state`.
- Cuando un `<retro-list-item [interactive]="true">` contiene un elemento clicable en el slot `[retroListItemTrailing]` (botón, icon-button, enlace…), los eventos de teclado burbujean hacia el item. Si el usuario hace foco en el botón del trailing y pulsa `Enter` o `Space`, se dispara tanto el click del botón como el `itemClicked` del item. Para evitarlo, envuelve el contenido del trailing en un `<div>` que corte la propagación:

```html
<div
  retroListItemTrailing
  (click)="$event.stopPropagation()"
  (keydown.enter)="$event.stopPropagation()"
  (keydown.space)="$event.stopPropagation()">
  <retro-icon-button icon="delete" (clicked)="onDelete($event)" />
</div>
```

---

# retro-list-item

Fila de lista Terminal Collector. Layout horizontal leading | cuerpo | trailing. Borde 1px, fondo `--bg-surface`, sin border-radius.

**Selector:** `retro-list-item` · **Standalone:** sí · **CVA:** no

> **Requisito:** debe usarse siempre dentro de un `<retro-list>`. Usarlo sin padre lanza un error en runtime.

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita una fila de lista con zonas leading/body/trailing diferenciadas, opcionalmente interactiva.
- NO usar cuando: la fila es solo un par label/valor estático — en ese caso usar `retro-data-row`.

## API — Inputs

| Nombre        | Tipo Angular                                    | Default     | Descripción                                                                                                                                       |
| ------------- | ----------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive` | `InputSignal<boolean>`                          | `false`     | Activa comportamiento de fila clicable (role=button, hover, focus). Emite `itemClicked` al hacer clic, Enter o Space.                             |
| `hoverable`   | `InputSignal<boolean>`                          | `false`     | Activa hover de `border-color` sin requerir `interactive`. Anulado por `disabled=true`. No añade `role` ni emite clicks.                          |
| `disabled`    | `InputSignal<boolean>`                          | `false`     | Marca la fila como deshabilitada: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`. Bloquea `itemClicked` aunque `interactive=true`. |
| `padding`     | `InputSignal<'none' \| 'sm' \| 'md' \| 'lg'>`   | `'sm'`      | Padding interno. `none`=0, `sm`=0.5rem 0.75rem, `md`=0.75rem 1rem, `lg`=1rem 1.25rem.                                                             |
| `selected`    | `InputSignal<boolean>`                          | `false`     | Estado visual de selección (box-shadow inset 2px `--border-active` + fondo `--bg-surface-hi`).                                                    |
| `variant`     | `InputSignal<'default' \| 'accent' \| 'muted'>` | `'default'` | Variante visual. `accent` colorea el borde con `--primary`. `muted` hace el fondo transparente.                                                   |
| `staggered`   | `InputSignal<boolean>`                          | `false`     | Activa animación de entrada escalonada. Requiere `[style.--i]="index"` en el `@for`. Respeta `prefers-reduced-motion`.                            |

## API — Outputs

| Nombre        | Tipo Angular                   | Descripción                                                  |
| ------------- | ------------------------------ | ------------------------------------------------------------ |
| `itemClicked` | `OutputEmitterRef<MouseEvent>` | Click/Enter/Space cuando `interactive=true` y no `disabled`. |

## Slots

| Selector                  | Tipo esperado                | Descripción                                                 |
| ------------------------- | ---------------------------- | ----------------------------------------------------------- |
| `[retroListItemLeading]`  | icono, avatar, checkbox      | Columna izquierda. Se oculta automáticamente si está vacía. |
| _(default)_               | título, subtítulo, metadatos | Cuerpo principal de la fila.                                |
| `[retroListItemTrailing]` | acción, badge, chevron       | Columna derecha. Se oculta automáticamente si está vacía.   |

## Tokens CSS expuestos

| Variable                         | Default                | Descripción                                                 |
| -------------------------------- | ---------------------- | ----------------------------------------------------------- |
| `--retro-list-item-hover-border` | `var(--border-active)` | Color de borde en hover cuando `hoverable` o `interactive`. |

## Tipos exportados

- `RetroListItemVariant` — `'default' \| 'accent' \| 'muted'`
- `RetroListItemPadding` — `'none' \| 'sm' \| 'md' \| 'lg'`

## Ejemplo mínimo

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

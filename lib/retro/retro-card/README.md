# retro-card

Contenedor neutro de la lib Terminal Collector. Rectángulo borde 1px, fondo `--bg-surface`, sin sombras ni border-radius. Soporta variantes visuales, padding configurable, estado de selección, hover y modo interactivo.

**Selector:** `retro-card` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita agrupar contenido en un bloque visual delimitado (ficha de juego, panel de detalles, tarjeta de colección).
- NO usar cuando: la unidad de contenido es una fila dentro de una lista — en ese caso usar `retro-list-item`.

## API — Inputs

| Nombre        | Tipo Angular                                    | Default     | Descripción                                                                                                                                                                                               |
| ------------- | ----------------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `interactive` | `InputSignal<boolean>`                          | `false`     | Activa comportamiento de tarjeta clicable: `role=button`, hover, focus-visible y emisión de `cardClicked`.                                                                                                |
| `hoverable`   | `InputSignal<boolean>`                          | `false`     | Activa hover de `border-color` sin requerir `interactive`. Cuando `interactive=true` se considera implícitamente activo. Anulado por `disabled=true`.                                                     |
| `disabled`    | `InputSignal<boolean>`                          | `false`     | Deshabilita la tarjeta: `opacity: 0.5`, `cursor: not-allowed`, `aria-disabled="true"`, sin hover ni focus-visible. `tabindex="-1"` si además es interactiva. Prioridad sobre `interactive` y `hoverable`. |
| `padding`     | `InputSignal<'none' \| 'sm' \| 'md' \| 'lg'>`   | `'md'`      | Padding interno. `none`=0, `sm`=0.75rem, `md`=1rem (mobile 0.875rem), `lg`=1.5rem/1rem (mobile 1rem).                                                                                                     |
| `padded`      | `InputSignal<boolean \| undefined>`             | `undefined` | **Deprecated** — usar `padding`. `true` → `'md'`, `false` → `'none'`.                                                                                                                                     |
| `selected`    | `InputSignal<boolean>`                          | `false`     | Estado visual de selección: box-shadow inset 2px `--border-active` + fondo `--bg-surface-hi`.                                                                                                             |
| `variant`     | `InputSignal<'default' \| 'accent' \| 'muted'>` | `'default'` | Variante visual. `accent` colorea el borde con `--primary`. `muted` hace el fondo transparente.                                                                                                           |

## API — Outputs

| Nombre        | Tipo Angular                   | Descripción                                                                                               |
| ------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `cardClicked` | `OutputEmitterRef<MouseEvent>` | Emite el `MouseEvent` cuando `interactive=true` y no `disabled`. Click, Enter o Space activan la emisión. |

## Slots

| Selector    | Tipo esperado | Descripción                         |
| ----------- | ------------- | ----------------------------------- |
| _(default)_ | bloque libre  | Contenido proyectado de la tarjeta. |

## Tokens CSS expuestos

| Variable                    | Default                | Descripción                                                                                                              |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--retro-card-hover-border` | `var(--border-active)` | Color de borde en hover cuando `hoverable` o `interactive`. El consumidor puede sobreescribirla (ej. `--dominant-glow`). |

## Tipos exportados

- `LibCardVariant` — `'default' \| 'accent' \| 'muted'`
- `RetroCardPadding` — `'none' \| 'sm' \| 'md' \| 'lg'`

## Ejemplo mínimo

```html
<!-- Tarjeta interactiva con variante accent -->
<retro-card [interactive]="true" variant="accent" (cardClicked)="onSelect()">
  <p>Contenido</p>
</retro-card>

<!-- Hover sin click (tarjeta navegable por enlace interno) -->
<retro-card [hoverable]="true">
  <a routerLink="/detalle">Ver detalle</a>
</retro-card>

<!-- Estado deshabilitado mientras carga -->
<retro-card [interactive]="true" [disabled]="isLoading()" (cardClicked)="onSelect()">
  <p>No clicable mientras carga</p>
</retro-card>
```

## Gotchas

- `padded` está deprecated. Migrarlo a `padding="md"` o `padding="none"` según el valor booleano que usaba.
- `disabled` tiene prioridad total sobre `interactive` y `hoverable`: bloquea clicks, elimina hover y saca la tarjeta del tab order (`tabindex="-1"`).
- `selected` es independiente de `interactive`: una tarjeta puede mostrarse seleccionada sin ser clicable.

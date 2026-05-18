# retro-card

Contenedor neutro Terminal Collector. Rectángulo 1px sin sombras ni border-radius.

## Componente — RetroCardComponent

- **Selector:** `retro-card`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `interactive` | `boolean` | `false` | Activa hover, focus y emite `cardClicked`. |
| `padding` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | Padding interno. none=0, sm=0.75rem, md=1rem (mobile 0.875rem), lg=1.5rem/1rem (mobile 1rem). |
| `padded` | `boolean` | `undefined` | **Deprecated** — usar `padding`. `true`→`md`, `false`→`none`. |
| `selected` | `boolean` | `false` | Estado visual de selección (box-shadow inset 2px `--border-active` + fondo `--bg-surface-hi`). Independiente de `interactive`. No compite con `border-color` del consumidor. |
| `variant` | `'default' \| 'accent' \| 'muted'` | `'default'` | Variante visual. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `cardClicked` | `MouseEvent` | Click/Enter/Espacio cuando `interactive=true`. |

### Slots / ng-content

- Default: contenido proyectado libremente.

### Types

- `LibCardVariant` en `retro-card.types.ts`.
- `RetroCardPadding` en `retro-card.types.ts`.

## Ejemplo

```html
<retro-card [interactive]="true" variant="accent" (cardClicked)="onSelect()">
  <p>Contenido</p>
</retro-card>
```

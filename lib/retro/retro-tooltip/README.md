# retro-tooltip

Tooltip nativo sin CDK Overlay. Crea un `<div>` en el body con `position: fixed`.

## Directiva — RetroTooltipDirective (`directive/`)

- **Selector:** `[retroTooltip]`
- **A11y:** panel `role="tooltip"`, `aria-describedby` en el host.
- **Solo en dispositivos hover** (`@media (hover: hover)` — inactiva en táctiles).
- **Posicionamiento:** bottom-center por defecto; ajuste automático si no cabe en viewport.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `retroTooltip` | `string` (required) | — | Texto del tooltip. |
| `retroTooltipDelay` | `number` | `500` | Retardo en ms. |

## Ejemplo

```html
<retro-icon-button
  icon="info"
  ariaLabel="Más información"
  [retroTooltip]="'Pulsa para ver detalles'"
  [retroTooltipDelay]="300" />
```

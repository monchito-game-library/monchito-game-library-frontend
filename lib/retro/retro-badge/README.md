# retro-badge

Badge contador o indicador de estado de la lib Terminal Collector. Con `dot=true` muestra solo un punto coloreado.

## Componente — RetroBadgeComponent

- **Selector:** `retro-badge`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string \| number` (required) | — | Texto/número visible. |
| `variant` | `'primary' \| 'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | `'neutral'` | Variante semántica. |
| `dot` | `boolean` | `false` | Si true, muestra solo un punto sin label. |

### Types

- `RetroBadgeVariant` en `retro-badge.types.ts`.

### Dependencias

Ninguna.

## Ejemplo

```html
<retro-badge [label]="5" variant="danger" />
<retro-badge [label]="''" variant="success" [dot]="true" />
```

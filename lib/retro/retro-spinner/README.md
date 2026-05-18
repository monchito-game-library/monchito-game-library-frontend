# retro-spinner

Spinner ASCII Terminal Collector. Animación CSS pura con frames discretos.

## Componente — RetroSpinnerComponent

- **Selector:** `retro-spinner`
- **A11y:** `role="status"` + `aria-label`.
- **Reduced motion:** frame estático en `prefers-reduced-motion: reduce`.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `size` | `'inline' \| 'sm' \| 'md' \| 'lg'` | `'md'` | inline=dentro de botón, sm=18-20px, md=40-48px, lg=80px. |
| `variant` | `'bars' \| 'dots' \| 'blocks'` | `'bars'` | bars `\|/-\\`, dots `...→....`, blocks `▖▘▝▗`. |
| `ariaLabel` | `string` | `'Loading'` | Label para lectores de pantalla. |

### Types

- `LibSpinnerSize`, `LibSpinnerVariant` en `retro-spinner.types.ts`.

## Ejemplo

```html
<retro-spinner size="md" variant="bars" ariaLabel="Cargando" />
<retro-spinner size="inline" variant="dots" />
```

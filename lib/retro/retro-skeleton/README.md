# retro-skeleton

Skeleton de carga Terminal Collector. Rectángulo con shimmer horizontal. `prefers-reduced-motion` detiene la animación.

## Componente — RetroSkeletonComponent

- **Selector:** `retro-skeleton`
- **A11y:** `role="status"`, `aria-busy="true"`, `aria-live="polite"`.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `width` | `string` | `'100%'` | Anchura CSS. |
| `height` | `string` | `'1rem'` | Altura CSS. |
| `shape` | `'line' \| 'square' \| 'block'` | `'line'` | Alias semántico (siempre rectangular). |

### Types

- `LibSkeletonShape` en `retro-skeleton.types.ts`.

## Ejemplo

```html
<retro-skeleton width="200px" height="1.25rem" />
<retro-skeleton width="100%" height="120px" shape="block" />
```

## Design note — CRT shimmer tint

El shimmer usa un gradiente de 4 stops con un tinte violeta sutil `rgba(124, 58, 237, 0.14)` en el pico (40%), alineado con el color primario de Terminal Collector. El tinte es intencionalmente tenue (14% alpha) y solo es perceptible durante la animación. Con `prefers-reduced-motion: reduce` la animación se desactiva completamente y el tinte desaparece — queda únicamente el fondo plano `--bg-surface-hi`.

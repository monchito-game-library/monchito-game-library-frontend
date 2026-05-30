# retro-skeleton

Placeholder de carga reutilizable Terminal Collector. Rectángulo plano sin border-radius con shimmer horizontal CRT. Sirve como sustituto visual del contenido mientras se carga datos asíncronos.

**Selector:** `retro-skeleton` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se está cargando contenido asíncrono (lista de juegos, detalle de tarjeta, imagen) y se quiere evitar el layout shift mostrando un placeholder de tamaño equivalente.
- NO usar cuando: la carga es instantánea o el spinner de `retro-button` con `loading` ya cubre el caso.

## API — Inputs

| Nombre   | Tipo Angular                    | Default  | Descripción                                                             |
| -------- | ------------------------------- | -------- | ----------------------------------------------------------------------- |
| `width`  | `InputSignal<string>`           | `'100%'` | Anchura CSS del bloque (p. ej. `'120px'`, `'100%'`).                    |
| `height` | `InputSignal<string>`           | `'1rem'` | Altura CSS del bloque (p. ej. `'1rem'`, `'120px'`).                     |
| `shape`  | `InputSignal<LibSkeletonShape>` | `'line'` | Alias semántico opcional. No altera la geometría (siempre rectangular). |

## Tipos exportados

- `LibSkeletonShape` — `'line' \| 'square' \| 'block'`

## Ejemplo mínimo

```html
<retro-skeleton width="200px" height="1.25rem" /> <retro-skeleton width="100%" height="120px" shape="block" />
```

## Gotchas

- La geometría es siempre rectangular (border-radius 0); el input `shape` es un alias semántico sin efecto visual en esta versión — reservado para tweaks futuros.
- El shimmer usa un gradiente de 4 stops con un tinte violeta CRT `rgba(124, 58, 237, 0.14)` en el pico (40%) alineado con el color primario de Terminal Collector. El tinte solo es perceptible durante la animación (1.4s lineal infinita).
- Con `prefers-reduced-motion: reduce`, la animación se detiene completamente y el tinte desaparece; el fondo queda como un plano `--bg-surface-hi`.
- El componente emite `role="status"` con `aria-busy="true"` y `aria-live="polite"`, por lo que los lectores de pantalla anunciarán el cambio cuando el skeleton desaparezca y el contenido real aparezca.

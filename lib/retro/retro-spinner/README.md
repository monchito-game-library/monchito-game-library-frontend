# retro-spinner

Spinner ASCII reutilizable Terminal Collector. Animación CSS pura con frames discretos sobre `::before`; sin Material ni SVG.

**Selector:** `retro-spinner` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita indicar estado de carga — tanto en pantalla completa (`md`/`lg`) como inline dentro de un botón o texto (`inline`/`sm`).
- NO usar cuando: el estado de carga ya lo gestiona `retro-button` con `loading="true"` — ese componente incluye un spinner interno.

## API — Inputs

| Nombre      | Tipo Angular                     | Default     | Descripción                                                                                       |
| ----------- | -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `size`      | `InputSignal<LibSpinnerSize>`    | `'md'`      | Tamaño: `'inline'` (1em, dentro de botón/línea), `'sm'` (1.125rem), `'md'` (2rem), `'lg'` (3rem). |
| `variant`   | `InputSignal<LibSpinnerVariant>` | `'bars'`    | Glyph animado: `'bars'` (`\|/-\\`), `'dots'` (`....`), `'blocks'` (`▖▘▝▗`).                       |
| `ariaLabel` | `InputSignal<string>`            | `'Loading'` | Label accesible para lectores de pantalla (`aria-label` en `role="status"`).                      |

## Tipos exportados

- `LibSpinnerSize` — `'inline' \| 'sm' \| 'md' \| 'lg'`
- `LibSpinnerVariant` — `'bars' \| 'dots' \| 'blocks'`

## Ejemplo mínimo

```html
<!-- Pantalla de carga -->
<retro-spinner size="md" variant="bars" ariaLabel="Cargando" />

<!-- Inline dentro de texto o botón personalizado -->
<retro-spinner size="inline" variant="dots" />
```

## Gotchas

- **`prefers-reduced-motion`**: cuando el sistema tiene activada la preferencia de movimiento reducido, la animación se desactiva (`animation: none`) y `::before` muestra el frame estático `...`. El componente sigue siendo visible y accesible.
- **Tamaños responsive**: en mobile (≤ 768px) los tamaños `md` y `lg` se reducen automáticamente (`md`: 2rem → 1.75rem, `lg`: 3rem → 2.25rem). El tamaño `inline` y `sm` no cambian.
- **Variante `bars`**: anima mediante `transform: rotate()` sobre el carácter `|` en lugar de cambiar `content` en `::before`. Esto garantiza compatibilidad con navegadores que no soportan animaciones de `content`.
- El componente tiene `display: inline-block` y no genera caja de bloque — puede usarse directamente dentro de texto fluido o contenedores flex sin ajustes adicionales.

# retro-icon

Wrapper de Material Icons (webfont). Paridad funcional con `mat-icon` sin dependencia de `@angular/material/icon`.

## Componente — RetroIconComponent

- **Selector:** `retro-icon`
- **Standalone:** sí
- **A11y:** `aria-hidden="true"` por defecto.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `name` | `string` (required) | — | Liga del icono Material Icons. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'` | xs=chip/row, sm=botón/tabs, md=menús, lg=headers, xl=topbar, 2xl=empty states. |
| `ariaHidden` | `boolean` | `true` | Para iconos informativos pasar `false`. |

### Types

- `LibIconSize` en `retro-icon.types.ts`.

## Ejemplo

```html
<retro-icon name="save" size="sm" />
<retro-icon name="check_circle" size="lg" [ariaHidden]="false" />
```

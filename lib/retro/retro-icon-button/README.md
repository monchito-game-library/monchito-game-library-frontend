# retro-icon-button

Botón de icono Terminal Collector. Borde 1px en hover, sin ripple ni Material Buttons.

## Componente — RetroIconButtonComponent

- **Selector:** `retro-icon-button`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `icon` | `string` (required) | — | Material Icons liga. |
| `ariaLabel` | `string` (required) | — | Label accesible obligatorio. |
| `variant` | `'primary' \| 'ghost' \| 'danger'` | `'ghost'` | Variante visual. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | sm=32px, md=40px, lg=44px. |
| `disabled` | `boolean` | `false` | Deshabilita. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `clicked` | `MouseEvent` | Emite el clic si no está deshabilitado. |

### Types

- `LibIconButtonVariant`, `LibIconButtonSize` en `retro-icon-button.types.ts`.

## Ejemplo

```html
<retro-icon-button icon="delete" ariaLabel="Eliminar" variant="danger" size="sm" (clicked)="onDelete()" />
```

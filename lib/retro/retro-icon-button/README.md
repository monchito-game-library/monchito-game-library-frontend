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

## CSS custom properties

| Token | Default | Description |
|---|---|---|
| `--retro-btn-bottom-offset` | `0` | Sets the `margin-bottom` of the button to align it vertically with the control box of a sibling `retro-form-field` in a flex row. Typical value when a subscript is visible: `1.25rem`. Set it on the parent container (e.g. `.retro-field-row`), not on the button itself. |

## Ejemplo

```html
<retro-icon-button icon="delete" ariaLabel="Eliminar" variant="danger" size="sm" (clicked)="onDelete()" />
```

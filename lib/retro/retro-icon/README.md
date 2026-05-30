# retro-icon

Wrapper de Material Icons (webfont). Paridad funcional con `mat-icon` sin dependencia de `@angular/material/icon`.

## Componente — RetroIconComponent

- **Selector:** `retro-icon`
- **Standalone:** sí
- **A11y:** `aria-hidden="true"` por defecto.

### Inputs

| Nombre       | Tipo                                            | Default | Descripción                                                                    |
| ------------ | ----------------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `name`       | `string` (required)                             | —       | Liga del icono Material Icons.                                                 |
| `size`       | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'md'`  | xs=chip/row, sm=botón/tabs, md=menús, lg=headers, xl=topbar, 2xl=empty states. |
| `ariaHidden` | `boolean`                                       | `true`  | Para iconos informativos pasar `false`.                                        |

### Host classes

El componente aplica clases al elemento host con bindings individuales (no reemplaza clases externas del call-site):

| Clase                  | Condición        |
| ---------------------- | ---------------- |
| `retro-icon-host`      | siempre          |
| `retro-icon-host--xs`  | `size === 'xs'`  |
| `retro-icon-host--sm`  | `size === 'sm'`  |
| `retro-icon-host--md`  | `size === 'md'`  |
| `retro-icon-host--lg`  | `size === 'lg'`  |
| `retro-icon-host--xl`  | `size === 'xl'`  |
| `retro-icon-host--2xl` | `size === '2xl'` |

Las clases añadidas en el call-site (`<retro-icon class="my-class" ...>`) se preservan en todos los ciclos de detección de cambios.

### Types

- `LibIconSize` en `retro-icon.types.ts`.

## Ejemplo

```html
<retro-icon name="save" size="sm" />
<retro-icon name="check_circle" size="lg" [ariaHidden]="false" />
<retro-icon class="my-custom" name="star" size="md" />
```

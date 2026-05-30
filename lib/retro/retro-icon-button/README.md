# retro-icon-button

Botón de icono reutilizable Terminal Collector. `<button>` nativo con `<retro-icon>` interno. Borde 1px en hover, sin ripple ni Material Buttons.

**Selector:** `retro-icon-button` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: la acción solo necesita un icono sin texto visible (eliminar fila, cerrar panel, copiar, editar inline).
- NO usar cuando: el botón debe mostrar texto visible junto al icono — usar `retro-button` con slot `[slot=start]`.

## API — Inputs

| Nombre      | Tipo Angular                        | Default    | Descripción                                                         |
| ----------- | ----------------------------------- | ---------- | ------------------------------------------------------------------- |
| `icon`      | `InputSignal<string> (required)`    | —          | Nombre del icono Material Icons (webfont liga).                     |
| `ariaLabel` | `InputSignal<string> (required)`    | —          | Etiqueta accesible obligatoria — no hay texto visible en pantalla.  |
| `variant`   | `InputSignal<LibIconButtonVariant>` | `'ghost'`  | Variante visual: `'primary'`, `'ghost'`, `'danger'`.                |
| `size`      | `InputSignal<LibIconButtonSize>`    | `'md'`     | Tamaño del botón: `sm` (32px), `md` (40px), `lg` (44px).            |
| `disabled`  | `InputSignal<boolean>`              | `false`    | Deshabilita el botón.                                               |
| `type`      | `InputSignal<LibButtonType>`        | `'button'` | Tipo del `<button>` HTML nativo: `'button'`, `'submit'`, `'reset'`. |

## API — Outputs

| Nombre    | Tipo Angular                   | Descripción                                                         |
| --------- | ------------------------------ | ------------------------------------------------------------------- |
| `clicked` | `OutputEmitterRef<MouseEvent>` | Emite el `MouseEvent` al hacer clic; solo si no está deshabilitado. |

## Tokens CSS expuestos

| Variable                    | Default | Descripción                                                                                                                                                                                       |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--retro-btn-bottom-offset` | `0`     | Ajusta el `margin-bottom` para alinear verticalmente con el control box de un `retro-form-field` hermano en flex row. Valor típico: `1.25rem`. Establecer en el contenedor padre, no en el botón. |

## Tipos exportados

- `LibIconButtonVariant` — `'primary' \| 'ghost' \| 'danger'`
- `LibIconButtonSize` — `'sm' \| 'md' \| 'lg'`
- `LibButtonType` — `'button' \| 'submit' \| 'reset'` (importado de `retro-button`)

## Ejemplo mínimo

```html
<retro-icon-button icon="delete" ariaLabel="Eliminar" variant="danger" size="sm" (clicked)="onDelete()" />
```

## Gotchas

- `ariaLabel` es required porque no hay texto visible: sin él el botón sería inaccesible para lectores de pantalla.
- El host usa `display: contents`, lo que significa que no genera un box propio. Los overlays anclados al componente (p. ej. `matTooltip`, `matMenuTriggerFor`) se resuelven sobre el `<button>` interno. Si necesitas el anchor del `<button>` desde un overlay externo, usa `querySelector('button')` en el elemento host.
- En mobile (≤ 768px) los tamaños `sm` y `md` se promocionan automáticamente a 44px para cumplir el touch target mínimo.

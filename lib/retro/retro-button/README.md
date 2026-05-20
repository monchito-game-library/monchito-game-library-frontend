# retro-button

Botón Terminal Collector con corchetes `[ LABEL ]` (pseudo-elementos en desktop, ocultos en mobile ≤ 768px). Disponible en tres tamaños: `sm` (32px), `md` (40px), `lg` (44px, default).

## Componente — RetroButtonComponent

- **Selector:** `retro-button`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto del botón (uppercase en pantalla). |
| `variant` | `'primary' \| 'ghost' \| 'danger' \| 'success'` | `'ghost'` | Variante visual. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | Altura: 32 / 40 / 44 px. En mobile sm/md se promocionan a 44 px. |
| `disabled` | `boolean` | `false` | Deshabilita el botón. |
| `loading` | `boolean` | `false` | Muestra spinner interno y deshabilita. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Tipo HTML. |
| `fullWidth` | `boolean` | `false` | Ocupa todo el ancho disponible. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `clicked` | `MouseEvent` | Emite el clic si no está deshabilitado/loading. |

### Slots / ng-content

- `[slot=start]`: contenido a la izquierda del label.
- `[slot=end]`: contenido a la derecha del label.
- Ambos slots se ocultan cuando `loading()` es `true`.

### Types

- `LibButtonVariant`, `LibButtonType`, `RetroButtonSize` en `retro-button.types.ts`.

### Dependencias

- `RetroIconComponent` (spinner + slots).

## CSS custom properties

| Token | Default | Description |
|---|---|---|
| `--retro-btn-bottom-offset` | `0` | Sets the `margin-bottom` of the button to align it vertically with the control box of a sibling `retro-form-field` in a flex row. Typical value when a subscript is visible: `1.25rem`. Set it on the parent container (e.g. `.retro-field-row`), not on the button itself. |

## Ejemplo

```html
<retro-button label="Guardar" variant="primary" (clicked)="onSave($event)">
  <retro-icon slot="start" name="save" size="sm" />
</retro-button>
```

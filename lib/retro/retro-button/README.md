# retro-button

Botón Terminal Collector con corchetes `[ LABEL ]` (pseudo-elementos en desktop, ocultos en mobile ≤ 768px).

## Componente — RetroButtonComponent

- **Selector:** `retro-button`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` (required) | — | Texto del botón (uppercase en pantalla). |
| `variant` | `'primary' \| 'ghost' \| 'danger' \| 'success'` | `'ghost'` | Variante visual. |
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

- `LibButtonVariant`, `LibButtonType` en `retro-button.types.ts`.

### Dependencias

- `RetroIconComponent` (spinner + slots).

## Ejemplo

```html
<retro-button label="Guardar" variant="primary" (clicked)="onSave($event)">
  <retro-icon slot="start" name="save" size="sm" />
</retro-button>
```

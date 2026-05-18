# retro-checkbox

Checkbox terminal `[X]` / `[ ]` con `ControlValueAccessor`.

## Componente — RetroCheckboxComponent

- **Selector:** `retro-checkbox`
- **Standalone:** sí
- **ControlValueAccessor:** compatible con `formControlName` y `[(ngModel)]`.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `checked` | `boolean` | `false` | Estado en modo standalone. |
| `label` | `string \| undefined` | `undefined` | Etiqueta mono uppercase. |
| `size` | `'sm' \| 'md'` | `'md'` | Tamaño del glyph. |
| `disabled` | `boolean` | `false` | Desactiva en modo standalone. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `changed` | `boolean` | Emite el nuevo valor tras cada toggle. |

### Types

- `LibCheckboxSize` en `retro-checkbox.types.ts`.

## Ejemplo

```html
<retro-checkbox formControlName="includeArchived" label="MOSTRAR ARCHIVADOS" />
```

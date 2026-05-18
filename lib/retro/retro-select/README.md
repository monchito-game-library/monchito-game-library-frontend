# retro-select

Select accesible Terminal Collector (combobox + listbox APG). `ControlValueAccessor` completo.

## Componente — RetroSelectComponent

- **Selector:** `retro-select`
- **ControlValueAccessor:** sí.
- **A11y:** `role="combobox"` + `role="listbox"`, `aria-expanded`, `aria-activedescendant`, `aria-selected`.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `placeholder` | `string` | `''` | Texto si no hay selección. |
| `ariaLabelledBy` | `string \| undefined` | `undefined` | ID del label externo. |
| `value` | `unknown` | `undefined` | Valor en modo standalone. |

### Outputs: `selectionChange: unknown`.

### Teclado: ArrowUp/Down, Home/End, Enter/Space, Escape, Tab, type-ahead.

## Componente — RetroOptionComponent

- **Selector:** `retro-option`
- **Inputs:** `value: unknown` (required), `disabled: boolean`.
- **Slots:** Default (label).
- **Reutilizable** también dentro de `<retro-autocomplete>`.

## Ejemplo

```html
<retro-form-field>
  <retro-label>Estado</retro-label>
  <retro-select formControlName="status" placeholder="Selecciona...">
    @for (s of statuses; track s.code) {
      <retro-option [value]="s.code">{{ s.label }}</retro-option>
    }
  </retro-select>
</retro-form-field>
```

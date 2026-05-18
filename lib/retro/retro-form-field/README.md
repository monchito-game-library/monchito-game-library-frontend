# retro-form-field

Sistema de campo de formulario Terminal Collector. Agrupa label, input nativo, error y hint. Sin floating label.

Esta carpeta contiene 5 entidades acopladas:

| Entidad | Selector | Rol |
|---|---|---|
| `RetroFormFieldComponent` | `retro-form-field` | Contenedor orquestador. |
| `RetroLabelComponent` | `retro-label` | Label uppercase. |
| `RetroInputDirective` | `input[retroInput], textarea[retroInput]` | Decora el input nativo. |
| `RetroErrorComponent` | `retro-error` | Mensaje de error. |
| `RetroHintComponent` | `retro-hint` | Texto de ayuda. |

## RetroFormFieldComponent

### Inputs: `disabled: boolean` (default `false`).

### Signals: `focused: WritableSignal<boolean>`, `invalid: WritableSignal<boolean>`.

### Slots / ng-content

- `retro-label, [retroLabel]` — inicio.
- `[retroPrefix]` — antes del input.
- Default — el input/select/etc.
- `[retroSuffix]` — después del input.
- `retro-error, [retroError]` — si `invalid()`.
- `retro-hint, [retroHint]` — si no `invalid()`.

## RetroLabelComponent

### Inputs: `for?: string`, `required: boolean` (default `false`).

## Ejemplo

```html
<retro-form-field>
  <retro-label [required]="true">Email</retro-label>
  <input retroInput type="email" formControlName="email" />
  @if (form.controls.email.hasError('required')) {
    <retro-error>Campo requerido</retro-error>
  }
  <retro-hint>Usa tu email corporativo</retro-hint>
</retro-form-field>
```

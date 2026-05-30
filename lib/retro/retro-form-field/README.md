> **@internal** — Esta pieza es de uso interno de la librería retro. No la uses directamente en tu aplicación; utiliza los componentes self-contained: `retro-input`, `retro-select`, `retro-search`, `retro-datepicker`.

# retro-form-field

Contenedor de campo de formulario Terminal Collector. Agrupa label, control proyectado (input, select, search, datepicker…), mensajes de error y hint. Sin floating label.

**Selector:** `retro-form-field` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: necesitas wrappear un control nativo (`input retroInput`) o un control self-contained que no tiene label integrado. También lo usan internamente `retro-input`, `retro-select`, `retro-search` y `retro-datepicker`.
- NO usar cuando: puedes usar directamente `retro-input`, `retro-textarea`, `retro-select` o `retro-search` — estos ya internalizan el form-field.

## API — Inputs

| Nombre           | Tipo Angular                                 | Default     | Descripción                                                                                  |
| ---------------- | -------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `controlRef`     | `InputSignal<RetroFormFieldControl \| null>` | `null`      | Control inyectado en modo self-contained. Tiene prioridad sobre el contentChild.             |
| `disabled`       | `InputSignal<boolean>`                       | `false`     | Desactiva visualmente el campo (sin pointer-events, opacidad reducida).                      |
| `multiline`      | `InputSignal<boolean>`                       | `false`     | Activa modo multilínea: stretch vertical, sin min-height, botón clear en top-right absoluto. |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>`          | `'lg'`      | Altura del campo: sm (32px), md (40px), lg (44px).                                           |
| `clearable`      | `InputSignal<boolean>`                       | `false`     | Muestra el botón X de limpiar cuando el control tiene valor.                                 |
| `clearAriaLabel` | `InputSignal<string>`                        | `'Limpiar'` | `aria-label` del botón limpiar.                                                              |
| `hideSubscript`  | `InputSignal<boolean>`                       | `false`     | Oculta el bloque subscript (hint/error). Usar en campos sin validación visible.              |

## API — Outputs

| Nombre    | Tipo Angular             | Descripción                                                                             |
| --------- | ------------------------ | --------------------------------------------------------------------------------------- |
| `cleared` | `OutputEmitterRef<void>` | Emite al pulsar el botón limpiar. El control interno es responsable de vaciar el valor. |

## Slots

| Selector                    | Tipo esperado                | Descripción                                                                    |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `retro-label, [retroLabel]` | `<retro-label>`              | Label del campo. Siempre encima del control.                                   |
| `[retroPrefix]`             | icono, texto u otro elemento | Contenido antes del control (dentro del borde).                                |
| _(default)_                 | control nativo o directiva   | El control principal (`input retroInput`, etc.).                               |
| `[retroSuffix]`             | icono, botón u otro elemento | Contenido después del control (dentro del borde).                              |
| `retro-error, [retroError]` | `<retro-error>`              | Mensaje de error. Solo visible cuando el control es inválido y ha sido tocado. |
| `retro-hint, [retroHint]`   | `<retro-hint>`               | Texto de ayuda. Solo visible cuando el control es válido.                      |

## Tokens CSS expuestos

| Variable                    | Default | Descripción                                                                                                                                          |
| --------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--retro-btn-bottom-offset` | `0`     | Offset vertical para alinear botones adyacentes al campo con el borde inferior del control. Disponible dentro del área `.retro-form-field__control`. |

## Ejemplo mínimo

```html
<retro-form-field [size]="'md'">
  <retro-label [required]="true">Email</retro-label>
  <input retroInput type="email" formControlName="email" />
  @if (form.controls.email.hasError('required')) {
  <retro-error>Campo requerido</retro-error>
  }
  <retro-hint>Usa tu email corporativo</retro-hint>
</retro-form-field>
```

## Gotchas

- El botón clear solo aparece en el DOM cuando `clearable` es `true` y el control tiene valor (`!empty`). Está oculto si el control está deshabilitado.
- El control proyectado se descubre mediante el token `RETRO_FORM_FIELD_CONTROL`. Cualquier control que implemente `RetroFormFieldControl` y provea el token se integra automáticamente.
- `controlRef` (modo self-contained) tiene prioridad sobre el contentChild. Los componentes `retro-input`, `retro-select`, etc. pasan `[controlRef]="this"` para que el form-field interno los descubra aunque no sean contenido proyectado.
- `retro-error` y `retro-hint` son mutuamente excluyentes: si el control está en estado inválido se muestra el error; si está válido, se muestra el hint. Solo uno de los dos es visible a la vez.

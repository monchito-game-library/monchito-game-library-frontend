> **@internal** — Esta pieza es de uso interno de la librería retro. No la uses directamente en tu aplicación; utiliza los componentes self-contained: `retro-input`, `retro-select`, `retro-search`, `retro-datepicker`.

# retro-form-field

Sistema de campo de formulario Terminal Collector. Agrupa label, control proyectado (input, select, search, datepicker…), mensajes de error y hint. Sin floating label.

Esta carpeta contiene 5 entidades acopladas:

| Entidad | Selector | Rol |
|---|---|---|
| `RetroFormFieldComponent` | `retro-form-field` | Contenedor orquestador. |
| `RetroLabelComponent` | `retro-label` | Label uppercase. |
| `RetroInputDirective` | `input[retroInput], textarea[retroInput]` | Decora el input nativo. |
| `RetroErrorComponent` | `retro-error` | Mensaje de error. |
| `RetroHintComponent` | `retro-hint` | Texto de ayuda. |

## RetroFormFieldComponent

### Inputs

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Desactiva visualmente el campo (sin pointer-events, opacidad reducida). |
| `multiline` | `boolean` | `false` | Activa modo multilínea: stretch vertical, sin min-height, botón clear top-right absoluto. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | Altura del campo: sm = 32px, md = 40px, lg = 44px. |
| `clearable` | `boolean` | `false` | Muestra un botón X de limpiar cuando el control tiene valor. |
| `clearAriaLabel` | `string` | `'Limpiar'` | Texto del `aria-label` del botón limpiar. |
| `hideSubscript` | `boolean` | `false` | Oculta el bloque subscript (hint/error); usar solo en campos sin validación visible (p.ej. búsqueda). |

### Outputs

| Output | Tipo | Descripción |
|---|---|---|
| `cleared` | `void` | Emite al pulsar el botón limpiar. El control interno gestiona el vaciado del valor. |

> El botón clear se renderiza dentro del campo, a la izquierda del slot `[retroSuffix]`. Solo aparece en el DOM cuando `clearable` es `true` y el control tiene valor (`!empty`). Está oculto cuando el control está deshabilitado.

### Signals

| Signal | Tipo | Descripción |
|---|---|---|
| `focused` | `WritableSignal<boolean>` | Verdadero cuando el control proyectado tiene el foco. |
| `invalid` | `WritableSignal<boolean>` | Verdadero cuando el control es inválido y ha sido tocado. |

### Detección del control proyectado

`RetroFormFieldComponent` descubre su control hijo mediante el token `RETRO_FORM_FIELD_CONTROL`. Cualquier control que implemente la interfaz `RetroFormFieldControl` y provea el token puede integrarse con el form-field:

```typescript
providers: [
  { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => MyControlComponent) }
]
```

### Slots / ng-content

- `retro-label, [retroLabel]` — label, siempre encima del campo.
- `[retroPrefix]` — antes del control (iconos decorativos, etc.).
- Default — el control (input, select, etc.).
- `[retroSuffix]` — después del control.
- `retro-error, [retroError]` — se muestra si `invalid()`.
- `retro-hint, [retroHint]` — se muestra si no `invalid()`.

## RetroLabelComponent

### Inputs: `for?: string`, `required: boolean` (default `false`).

## RetroInputDirective

Directiva que implementa `RetroFormFieldControl` y provee `RETRO_FORM_FIELD_CONTROL` para integrarse con `RetroFormFieldComponent`. Usada internamente por `RetroInputComponent` y `RetroTextareaComponent` — no la uses directamente en plantillas de la aplicación.

El uso de `<textarea retroInput>` en templates de la app está **deprecado**. Usar `<retro-textarea>` en su lugar:

```html
<!-- Usar retro-textarea en su lugar -->
<retro-textarea label="Notas" formControlName="notes" [rows]="3" />
```

## Ejemplo

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

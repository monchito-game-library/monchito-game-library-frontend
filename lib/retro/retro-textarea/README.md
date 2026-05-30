# retro-textarea

Área de texto multilínea self-contained Terminal Collector. Internaliza `retro-form-field` + label + textarea nativo y los gestiona como una unidad.

**Selector:** `retro-textarea` · **Standalone:** sí · **CVA:** sí

## Cuándo usar / Cuándo NO usar

- Usar cuando: necesitas un campo de texto multilínea con label integrado y soporte para `formControlName` / `ngModel`.
- NO usar cuando: el texto es de una sola línea — usar `retro-input`.

## API — Inputs

| Nombre           | Tipo Angular                        | Default     | Descripción                                                                                           |
| ---------------- | ----------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`               | `''`        | Texto del label del campo.                                                                            |
| `placeholder`    | `InputSignal<string>`               | `''`        | Placeholder del textarea nativo.                                                                      |
| `hint`           | `InputSignal<string \| null>`       | `null`      | Mensaje de ayuda bajo el campo.                                                                       |
| `error`          | `InputSignal<string \| null>`       | `null`      | Mensaje de error bajo el campo.                                                                       |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>` | `'lg'`      | Altura base de referencia: sm (32px), md (40px), lg (44px). En multilínea actúa como token de diseño. |
| `rows`           | `InputSignal<number>`               | `3`         | Número de líneas visibles del textarea.                                                               |
| `clearable`      | `InputSignal<boolean>`              | `false`     | Muestra el botón X para limpiar cuando el campo tiene valor.                                          |
| `clearAriaLabel` | `InputSignal<string>`               | `'Limpiar'` | `aria-label` del botón limpiar.                                                                       |
| `maxlength`      | `InputSignal<number \| null>`       | `null`      | Longitud máxima de caracteres. `null` = sin límite.                                                   |
| `readonly`       | `InputSignal<boolean>`              | `false`     | El textarea es de solo lectura (no editable, pero el valor va al formulario).                         |

## API — Outputs

| Nombre    | Tipo Angular                   | Descripción                          |
| --------- | ------------------------------ | ------------------------------------ |
| `cleared` | `OutputEmitterRef<void>`       | Se emite al pulsar el botón limpiar. |
| `blur`    | `OutputEmitterRef<FocusEvent>` | Blur del textarea nativo.            |
| `focus`   | `OutputEmitterRef<FocusEvent>` | Focus del textarea nativo.           |

## Slots

| Selector        | Tipo esperado         | Descripción                                            |
| --------------- | --------------------- | ------------------------------------------------------ |
| `[retroPrefix]` | icono u otro elemento | Contenido en el área de prefix del form-field interno. |
| `[retroSuffix]` | icono u otro elemento | Contenido en el área de suffix del form-field interno. |

## Contrato CVA

- `writeValue(value)`: acepta `string | null`; `null` normaliza a `''` internamente.
- `registerOnChange`: emite `string` (`emptyValue: ''` — nunca emite `null` al formulario, idéntico a `retro-input`).
- `setDisabledState`: refleja `disabled`.

## Ejemplo mínimo

```html
<retro-textarea
  label="Notas"
  formControlName="notes"
  [rows]="4"
  placeholder="Escribe aquí..."
  [clearable]="true"
  [error]="notesError()" />
```

## Gotchas

- El comportamiento al vaciar es idéntico al de `retro-input`: el formulario recibe `''`, nunca `null`. Los validadores `Validators.required` detectan el campo vacío correctamente.
- El resize del textarea nativo está desactivado por diseño (`resize: none`).
- En modo multilínea el botón clear se posiciona en absoluto en la esquina superior derecha del textarea.
- No tiene input `hideSubscript` — el bloque subscript siempre se renderiza (a diferencia de `retro-input`).

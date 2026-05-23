# retro-textarea

Área de texto multilínea self-contained Terminal Collector. Internaliza `retro-form-field` + label + textarea nativo.
Implementa `ControlValueAccessor` — compatible con `formControlName` y `ngModel`.

## Selector

`retro-textarea`

## Inputs

| Nombre           | Tipo                   | Default     | Descripción                                                                                                        |
| ---------------- | ---------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| `label`          | `string`               | `''`        | Texto del label.                                                                                                   |
| `placeholder`    | `string`               | `''`        | Placeholder del textarea nativo.                                                                                   |
| `hint`           | `string \| null`       | `null`      | Mensaje de ayuda bajo el campo.                                                                                    |
| `error`          | `string \| null`       | `null`      | Mensaje de error bajo el campo.                                                                                    |
| `size`           | `'sm' \| 'md' \| 'lg'` | `'lg'`      | Altura de referencia del campo (32/40/44px). En modo multilínea actúa solo como token de diseño.                   |
| `clearable`      | `boolean`              | `false`     | Muestra botón X para limpiar cuando hay valor. En modo multilínea el botón aparece en la esquina superior derecha. |
| `clearAriaLabel` | `string`               | `'Limpiar'` | `aria-label` del botón limpiar.                                                                                    |
| `maxlength`      | `number \| null`       | `null`      | Longitud máxima de caracteres.                                                                                     |
| `readonly`       | `boolean`              | `false`     | Textarea de solo lectura (el valor sí va al formulario).                                                           |
| `rows`           | `number`               | `3`         | Número de líneas visibles del textarea.                                                                            |

## Outputs

| Nombre    | Tipo         | Descripción                          |
| --------- | ------------ | ------------------------------------ |
| `cleared` | `void`       | Se emite al pulsar el botón limpiar. |
| `blur`    | `FocusEvent` | Blur del textarea nativo.            |
| `focus`   | `FocusEvent` | Focus del textarea nativo.           |

## Slots (ng-content)

| Selector        | Descripción                                       |
| --------------- | ------------------------------------------------- |
| `[retroPrefix]` | Elementos con comportamiento propio en el prefix. |
| `[retroSuffix]` | Elementos con comportamiento propio en el suffix. |

## Ejemplo

```html
<retro-textarea
  label="Notas"
  formControlName="notes"
  [rows]="3"
  placeholder="Escribe aquí tus notas..."
  [clearable]="true"
  [error]="notesError()" />
```

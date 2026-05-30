# retro-input

Campo de texto self-contained Terminal Collector. Internaliza `retro-form-field` + label + input nativo y los gestiona como una unidad.

**Selector:** `retro-input` · **Standalone:** sí · **CVA:** sí

## Cuándo usar / Cuándo NO usar

- Usar cuando: necesitas un campo de texto de una sola línea con label integrado, validación reactiva y soporte para `formControlName` / `ngModel`.
- NO usar cuando: el texto es multilínea — usar `retro-textarea`. Para búsqueda con autocomplete, usar `retro-search`.

## API — Inputs

| Nombre           | Tipo Angular                                                                 | Default     | Descripción                                                                               |
| ---------------- | ---------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `label`          | `InputSignal<string>`                                                        | `''`        | Texto del label. Si está vacío, el label no se renderiza.                                 |
| `placeholder`    | `InputSignal<string>`                                                        | `''`        | Placeholder del input nativo.                                                             |
| `hint`           | `InputSignal<string \| null>`                                                | `null`      | Mensaje de ayuda bajo el campo.                                                           |
| `error`          | `InputSignal<string \| null>`                                                | `null`      | Mensaje de error bajo el campo.                                                           |
| `size`           | `InputSignal<'sm' \| 'md' \| 'lg'>`                                          | `'lg'`      | Altura del campo: sm (32px), md (40px), lg (44px).                                        |
| `prefixIcon`     | `InputSignal<string \| null>`                                                | `null`      | Nombre de icono Material decorativo en el prefix. Mutuamente excluyente con `prefixText`. |
| `prefixText`     | `InputSignal<string \| null>`                                                | `null`      | Texto corto de prompt terminal (p.ej. `"$ "`). Mutuamente excluyente con `prefixIcon`.    |
| `suffixIcon`     | `InputSignal<string \| null>`                                                | `null`      | Nombre de icono Material decorativo en el suffix.                                         |
| `clearable`      | `InputSignal<boolean>`                                                       | `false`     | Muestra el botón X para limpiar cuando el campo tiene valor.                              |
| `clearAriaLabel` | `InputSignal<string>`                                                        | `'Limpiar'` | `aria-label` del botón limpiar.                                                           |
| `hideSubscript`  | `InputSignal<boolean>`                                                       | `false`     | Oculta el bloque subscript (hint/error). Útil en campos sin validación visible.           |
| `type`           | `InputSignal<'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'>` | `'text'`    | Tipo del input nativo.                                                                    |
| `autocomplete`   | `InputSignal<string>`                                                        | `'off'`     | Atributo `autocomplete` del input nativo.                                                 |
| `maxlength`      | `InputSignal<number \| null>`                                                | `null`      | Longitud máxima de caracteres. `null` = sin límite.                                       |
| `readonly`       | `InputSignal<boolean>`                                                       | `false`     | El input es de solo lectura (no editable, pero el valor va al formulario).                |

## API — Outputs

| Nombre    | Tipo Angular                      | Descripción                          |
| --------- | --------------------------------- | ------------------------------------ |
| `cleared` | `OutputEmitterRef<void>`          | Se emite al pulsar el botón limpiar. |
| `blur`    | `OutputEmitterRef<FocusEvent>`    | Blur del input nativo.               |
| `focus`   | `OutputEmitterRef<FocusEvent>`    | Focus del input nativo.              |
| `enter`   | `OutputEmitterRef<KeyboardEvent>` | Pulsación de Enter en el input.      |

## Slots

| Selector        | Tipo esperado                | Descripción                                                                                                                                 |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `[retroPrefix]` | icono, botón u otro elemento | Contenido con comportamiento propio en el área de prefix (p.ej. `retro-icon-button`). Se renderiza después del `prefixIcon` / `prefixText`. |
| `[retroSuffix]` | icono, botón u otro elemento | Contenido con comportamiento propio en el área de suffix. Se renderiza después del `suffixIcon`.                                            |

## Contrato CVA

- `writeValue(value)`: acepta `string | null`; `null` normaliza a `''` internamente.
- `registerOnChange`: emite `string` (`emptyValue: ''` — nunca emite `null` al formulario).
- `setDisabledState`: refleja `disabled`.

## Ejemplo mínimo

```html
<retro-input
  label="Correo electrónico"
  formControlName="email"
  type="email"
  placeholder="usuario@ejemplo.com"
  [clearable]="true"
  prefixIcon="mail"
  [error]="emailError()" />
```

```html
<!-- Con slot retroSuffix personalizado -->
<retro-input label="URL" formControlName="url">
  <retro-icon-button retroSuffix icon="open_in_new" (clicked)="openUrl()" />
</retro-input>
```

```html
<!-- Con prefijo de prompt terminal -->
<retro-input label="Comando" formControlName="command" prefixText="$ " placeholder="npm install" />
```

## Gotchas

- Al vaciar el campo (borrado manual o botón clear), el formulario recibe `''`, no `null`. Los validadores `Validators.required` detectan el campo vacío correctamente.
- `prefixIcon` y `prefixText` son mutuamente excluyentes en el template: si ambos tienen valor, `prefixText` tiene prioridad.
- El slot `[retroPrefix]` se renderiza siempre, incluso si también hay `prefixIcon` o `prefixText`. Usa uno u otro para evitar duplicados visuales.

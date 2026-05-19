# retro-input

Campo de texto self-contained Terminal Collector. Internaliza `retro-form-field` + label + input nativo.
Implementa `ControlValueAccessor` — compatible con `formControlName` y `ngModel`.

## Selector

`retro-input`

## Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `label` | `string` | `''` | Texto del label. |
| `placeholder` | `string` | `''` | Placeholder del input nativo. |
| `hint` | `string \| null` | `null` | Mensaje de ayuda bajo el campo. |
| `error` | `string \| null` | `null` | Mensaje de error bajo el campo. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'lg'` | Altura del campo (32/40/44px). |
| `prefixIcon` | `string \| null` | `null` | Nombre de icono Material decorativo en prefix. |
| `prefixText` | `string \| null` | `null` | Texto corto de prompt terminal (p.ej. `"$ "`); mutuamente excluyente con `prefixIcon`. |
| `suffixIcon` | `string \| null` | `null` | Nombre de icono Material decorativo en suffix. |
| `clearable` | `boolean` | `false` | Muestra botón X para limpiar cuando hay valor. |
| `clearAriaLabel` | `string` | `'Limpiar'` | `aria-label` del botón limpiar. |
| `hideSubscript` | `boolean` | `false` | Oculta el bloque subscript (hint/error); usar en campos sin validación visible (p.ej. búsqueda). |
| `type` | `'text' \| 'email' \| 'password' \| 'number' \| 'tel' \| 'url'` | `'text'` | Tipo del input nativo. |
| `autocomplete` | `string` | `'off'` | Atributo `autocomplete` del input nativo. |
| `maxlength` | `number \| null` | `null` | Longitud máxima de caracteres. |

## Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `cleared` | `void` | Se emite al pulsar el botón limpiar. |
| `blur` | `FocusEvent` | Blur del input nativo. |
| `focus` | `FocusEvent` | Focus del input nativo. |
| `enter` | `KeyboardEvent` | Pulsación de Enter en el input. |

## Slots (ng-content)

| Selector | Descripción |
|---|---|
| `[retroPrefix]` | Elementos con comportamiento propio en el prefix (p.ej. botones). |
| `[retroSuffix]` | Elementos con comportamiento propio en el suffix. |

## Ejemplo

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
<retro-input
  label="Comando"
  formControlName="command"
  prefixText="$ "
  placeholder="npm install" />
```
